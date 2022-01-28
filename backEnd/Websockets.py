import logging

from flask import copy_current_request_context
from flask_socketio import SocketIO, emit, join_room, leave_room
import ChessLogic
from REST_API import *
from enum import Enum

# SOCKET IO CONFIG
app = app
socketio = SocketIO(app, cors_allowed_origins="*", ping_interval=5)
thread = None
timer_thread = None


# SOCKET CONNECTION
def check_auth(sid, player_id):
    if (str(player_id) not in authorized_sockets) or (sid != authorized_sockets[str(player_id)]):
        return False
    return True


@socketio.on('connect')
def connect():
    print('Player connected! ' + request.sid)
    emit('connect', {})


@socketio.on('disconnect')
def disconnect():
    player_id = get_id_by_sid(request.sid)

    # delete player from queue if he's in it
    to_be_removed = get_player_from_queue_by_id(player_id)
    if to_be_removed:
        leave_room('queue' + str(to_be_removed[1]))
        queues[str(to_be_removed[1])].remove(to_be_removed[0])

    print('Player disconnected ', request.sid)
    # if he was in game notify opponent that the player disconnected

    game_info = get_is_player_in_game(player_id)
    if game_info:
        game = game_info[0]
        print('SENT OPONENT STATUS UPDATE ', request.sid)
        emit('update_opponents_socket_status', {'status': 'disconnected'}, room=game.game_room_id, include_self=False)
        leave_room(game.game_room_id, request.sid)


@socketio.on("authorize")
def authorize(data):
    if ('sessionToken' not in data) or ('userId' not in data):
        if debug_mode: print("Missing data in socket auth request")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    print(data)
    session_token = data['sessionToken']
    player_id = str(data['userId'])

    # communicate unauthorised access
    if not authorize_user(player_id, session_token):
        if debug_mode:
            print("Authorization of player" + player_id + " failed")

        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    # add socket_id to authorized sockets for player
    if debug_mode:
        print("Authorization of player" + player_id + " succeded")

    authorized_sockets[player_id] = request.sid

    # check if player was in a game/lobby and add him back [game,playinsAs]
    game_info = get_is_player_in_game(player_id)
    if game_info:
        game = game_info[0]
        playing_as = game_info[1]

        if debug_mode:
            print("Player " + str(player_id) + " rejoined game " + str(game.game_id) + " as " + str(
                playing_as + " with FEN " + str(game.curr_FEN)))

        join_room(game.game_room_id, request.sid)

        # game rejoin communicate (in case player was in queue when disconnected)
        emit("game_found",
             {'gameId': game.game_room_id, 'playingAs': playing_as, 'FEN': game.curr_FEN,

              'gameMode': game.game_mode_id, 'whiteScore': game.defender_state.white_score,
              'blackScore': game.defender_state.black_score},

             to=request.sid)

        # notify opponent that the player reconnected
        print("SENDING SOCKET STATUS UPDATE")
        emit('update_opponents_socket_status', {'status': 'connected'}, room=game.game_room_id,
             include_self=False)

        # notify player whether the opponent is connected
        opponent_status = 'connected'
        if (playing_as == 'w' and (game.black_player.id not in authorized_sockets)) or (
                playing_as == 'b' and (game.white_player.id not in authorized_sockets)):
            opponent_status = 'disconnected'

        emit('update_opponents_socket_status', {'status': opponent_status}, to=request.sid)

    emit('authorized', )


@socketio.on('get_positions_info')
def get_positions_info(data):
    data_obj = json.loads(data)
    player_id = data_obj['playerId']

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    result = positions_FENS
    emit('positions_info', result, to=request.sid)


@socketio.on('join_single_player')
def join_single_player(data):
    data_obj = json.loads(data)
    player_id = data_obj['playerId']
    game_mode_id = data_obj['gameModeId']
    game_mode = game_modes[game_mode_id]

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    players_game = get_is_player_in_game(player_id)
    if players_game:
        print("PLAYER ALREADY IN GAME")
        return

    print("Player with id " + str(player_id) + " joined single player game mode " + str(game_mode_id))

    # get player elo from db
    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_id(player_id)
        player_elo = user['ELO']
        username = user['Username']
    except Exception as ex:
        print("DB ERROR " + str(ex))
        return

    # check if player isn't in this queue already
    if get_player_from_queue(player_id, game_mode_id) is not False:
        emit('already_in_queue', {'playerId': player_id}, to=request.sid)
        return

    player = Player(player_id, username, player_elo, 'u')

    print("Creating a new single player game")

    game_id = random.randint(0, 9999999999999)
    game_id_hash = hashlib.sha256(str(game_id).encode())
    game_room_id = str(game_id_hash.hexdigest())

    # create gameroom and add player
    join_room(game_room_id)

    # positions setup
    # TODO here generate starting fen and computer player stats
    if str(game_mode_id) == "2":
        chosen_postion = int(data_obj['positionId'])
        chosen_starting_score = int(data_obj['posStartingScore'])

        starting_FEN = game_mode.game_mode_starting_FEN[chosen_postion]
        player_color = starting_FEN.split(" ")[1]

        if player_color == 'w':
            computer_color = 'b'
        else:
            computer_color = 'w'

        # make defender scores
        if player_color == 'w':
            defender_state = DefenderState(chosen_starting_score, -1, 0)
        else:
            defender_state = DefenderState(-1, chosen_starting_score, 0)

        computer_player = Player(-1, 'Computer', 5000, computer_color)  # id, name,ELO, playing as #TODO change ELO?
        print(player_color)

        timer = Timer(game_mode.game_mode_time)
        # example timer
        # timer = TImer(5000) #in ms

        # create game in server storage
        try:
            if player_color == 'w':
                games[game_room_id] = Game(game_id, game_room_id, game_mode_id, player, computer_player,
                                           player_color,
                                           starting_FEN, 0, timer, defender_state=defender_state)
            else:
                games[game_room_id] = Game(game_id, game_room_id, game_mode_id, computer_player, player,
                                           player_color,
                                           starting_FEN, 0, timer, defender_state=defender_state)
        except Exception as ex:
            print("Creating game error " + str(ex))
            return

        print(games[game_room_id])
        emit("game_found", {'gameId': game_room_id, 'playingAs': player_color, 'gameMode': game_mode_id})


# MATCHMAKING
@socketio.on('join_queue')
def join_queue(data):
    @copy_current_request_context
    def run_match_maker():
        match_maker()

    print(data)
    global thread
    if thread is None:
        thread = socketio.start_background_task(run_match_maker)

    # # TIMERS THREAD
    # @copy_current_request_context
    # def update_timers():
    #     while True:
    #         for game in games:
    #             won_game = game.timer.update_timers(game.curr_turn)
    #             if won_game:
    #                 finish_game(game, won_game)
    #
    # global timer_thread
    # if timer_thread is None:
    #     timer_thread = socketio.start_background_task(update_timers())

    data_obj = json.loads(data)
    player_id = data_obj['playerId']
    game_mode_id = data_obj['gameModeId']
    game_mode = game_modes[game_mode_id]
    game_multiplayer = game_mode.game_mode_multiplayer

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    players_game = get_is_player_in_game(player_id)
    if players_game:
        print("PLAYER ALREADY IN GAME")
        return

    print("Player with id " + str(player_id) + " joined the queue for game mode" + str(game_mode_id))

    if not game_multiplayer:
        print("Tried to join multiplayer in single")
        return

    join_room('queue' + str(game_mode_id), request.sid)

    # get player elo from db
    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_id(player_id)
        player_elo = user['ELO']
        username = user['Username']
    except Exception as ex:
        print("DB ERROR " + str(ex))
        return

    # check if player isn't in this queue already
    if get_player_from_queue(player_id, game_mode_id) is not False:
        emit('already_in_queue', {'playerId': player_id}, to=request.sid)
        return

    player = Player(player_id, username, player_elo, 'u')

    # as array playerObject,waitTime (in ms), currentScope
    queues.setdefault(str(game_mode_id), []).append([player, 0, initial_scope])
    print(queues)
    # send initial scope to the player that joined the queue
    emit('update_scope', {'scope': str(initial_scope)}, to=request.sid)
    # send back current queue info to all connected clients
    emit('queue_info', {'playersInQueue': str(len(queues[str(game_mode_id)]))}, to='queue' + str(game_mode_id))


@socketio.on('leave_queue')
def leave_queue(data):
    data_obj = json.loads(data)
    player_id = data_obj['playerId']
    game_mode_id = data_obj['gameModeId']

    print(data)
    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    print("Player with id " + player_id + "left the queue for gameId " + str(game_mode_id))

    # if queue for gameId somehow doesn't exist
    if str(game_mode_id) not in queues:
        return

    # delete player from queue if he's in it
    to_be_removed = get_player_from_queue(player_id, game_mode_id)
    if to_be_removed:
        queues[str(game_mode_id)].remove(to_be_removed)
        leave_room('queue' + str(game_mode_id), request.sid)

    # send back success message
    emit('queue_left', {'success': 'true'}, to=request.sid)
    # update all other players waiting in queue
    emit('queue_info', {'playersInQueue': str(len(queues[str(game_mode_id)]))}, to='queue' + str(game_mode_id))


def match_maker():
    while True:
        # TODO move to another thread, but my computer can't handle it :(
        for game_id, game in games.copy().items():
            won_game, full_second_passed = game.timer.update_timers(game.curr_turn)
            if full_second_passed:
                emit('update_timers', {'whiteTime': game.timer.white_time, 'blackTime': game.timer.black_time},
                     room=game.game_room_id)
            if won_game:
                finish_game(game, won_game)

        for game_mode_id, players in queues.copy().items():
            for player in players:
                start = timer()
                find_match(game_mode_id, player)
                end = timer()

                time_taken = (end - start) * 1000
                # increment wait time for all players still in queue
                increment_wait_time(game_mode_id, time_taken)


def increment_wait_time(game_mode_id, time_taken):
    for player in queues[game_mode_id]:
        player[1] += time_taken


# try to find a match for given player
def find_match(game_mode_id, player):
    # check if a socket is connected for player
    player_id = player[0].id
    if player_id not in authorized_sockets:
        return

    player_elo = player[0].ELO
    player_sid = authorized_sockets[player_id]
    player_wait_time = player[1]
    player_curr_scope = player[2]

    # increment scope depending on how long the player has been waiting for
    scope = initial_scope + int(player_wait_time / scope_update_interval) * scope_update_ammount

    # iterate through all possible opponents
    for opponent in list(queues[str(game_mode_id)]):

        # don't match the player with himself
        if opponent == player:
            continue

        opponent_elo = opponent[0].ELO
        opponent_wait_time = opponent[1]
        opponent_scope = initial_scope + int(opponent_wait_time / scope_update_interval) * scope_update_ammount

        # if opponent elo is in scope and players is in his it's a match
        if (player_elo - scope <= opponent_elo <= player_elo + scope) \
                and (opponent_elo - opponent_scope <= player_elo <= opponent_elo + opponent_scope):
            # check if both players are still in queue

            # cache opponent data
            opponent_id = opponent[0].id
            if opponent_id not in authorized_sockets:
                continue

            opponent_sid = authorized_sockets[opponent_id]

            # remove from queue and leave room
            queues[str(game_mode_id)].remove(player)
            queues[str(game_mode_id)].remove(opponent)
            leave_room('queue' + str(game_mode_id), player_sid)
            leave_room('queue' + str(game_mode_id), opponent_sid)

            # randomise who plays as white 0 for player, 1 for opponent
            white_player = random.randint(0, 1)

            if white_player == 1:
                white_sid = player_sid
                white_player = player[0]
                black_sid = opponent_sid
                black_player = opponent[0]
            else:
                white_sid = opponent_sid
                white_player = opponent[0]
                black_sid = player_sid
                black_player = player[0]

            white_player.playing_as = 'w'
            black_player.playing_as = 'b'

            try:
                # create game in db
                db = ChessDB.ChessDB()
                starting_FEN = game_modes[int(game_mode_id)].game_mode_starting_FEN
                game_id = db.add_game(white_player.id, float(0.5), black_player.id, float(0.5), [],
                                      game_mode_id,starting_FEN)
                game_id_hash = hashlib.sha256(str(game_id).encode())
                game_room_id = str(game_id_hash.hexdigest())

                # create gameroom for the two players and add both of them
                join_room(game_room_id, white_sid)
                join_room(game_room_id, black_sid)

                # notify the players of their positions and opponents socket status
                emit("game_found", {'gameId': game_room_id, 'playingAs': 'w', 'gameMode': game_mode_id}, to=white_sid)
                emit("game_found", {'gameId': game_room_id, 'playingAs': 'b', 'gameMode': game_mode_id}, to=black_sid)
                emit('update_opponents_socket_status', {'status': 'connected'}, room=game_room_id)

                # create game in server storage
                game_mode = game_modes[int(game_mode_id)]
                games[game_room_id] = Game(game_id, game_room_id, game_mode_id, white_player, black_player, 'w',
                                           game_mode.game_mode_starting_FEN, 0,
                                           Timer(game_mode.game_mode_time))
            except Exception as ex:
                print("DB ERROR " + str(ex))

    # notify player of scope change if it has happened
    if player_curr_scope != scope:
        player[2] = scope
        emit("update_scope", {'scope': scope}, to=player_sid)

#end game
def finish_game(game_info, win_color):
    game_id = game_info.game_id
    game_mode_id = games[game_info.game_room_id].game_mode_id
    game_multiplayer = game_modes[int(game_mode_id)].game_mode_multiplayer
    game_end_FEN = games[game_info.game_room_id].curr_FEN

    # delete game
    if str(game_info.game_room_id) in games:
        games.pop(str(game_info.game_room_id), None)

    win_color_upper_letter = str(win_color).upper()

    # if it was a single player game
    if not game_multiplayer:
        player_color= 'W'

        if game_info.white_player.id in authorized_sockets:
            player_sid = authorized_sockets[game_info.white_player.id]
        elif game_info.black_player.id in authorized_sockets:
            player_sid = authorized_sockets[game_info.black_player.id]
            player_color = 'B'

        if win_color_upper_letter == 'N':
            emit("game_ended", {'result': 'draw', 'eloChange': 0}, to=player_sid)
            return

        if win_color_upper_letter == player_color:
            emit("game_ended", {'result': 'win', 'eloChange': 0}, to=player_sid)
        else:
            emit("game_ended", {'result': 'lost', 'eloChange': 0}, to=player_sid)



        return

    # update in database
    try:
        db = ChessDB.ChessDB()

        # add match result to db
        db.update_scores(win_color_upper_letter, game_id)

        # update players' rankings
        white_id = game_info.white_player.id
        black_id = game_info.black_player.id
        white_user_info = db.get_user_by_id(white_id)
        black_user_info = db.get_user_by_id(black_id)

        white_ELO = white_user_info['ELO']
        white_dv = white_user_info['ELODeviation']
        white_v = white_user_info['ELOVolatility']
        black_ELO = black_user_info['ELO']
        black_dv = black_user_info['ELODeviation']
        black_v = black_user_info['ELOVolatility']
        white_result = int(win_color_upper_letter == 'W')
        white_ELO, white_dv, white_v, black_ELO, black_dv, black_v = RatingSystem.calculate_glicko(white_ELO, white_dv,
                                                                                                   white_v, black_ELO,
                                                                                                   black_dv, black_v,
                                                                                                   white_result)

        white_elo_change = db.update_elo(white_id, white_ELO, white_dv, white_v)
        white_elo_change_int = math.ceil(white_elo_change)
        black_elo_change = int(db.update_elo(black_id, black_ELO, black_dv, black_v))
        black_elo_change_int = math.ceil(black_elo_change)

        #update game FEN
        db.update_FEN(game_id,game_end_FEN)

    except Exception as ex:
        print("DB ERROR " + str(ex))

    # notify players of their respective results
    white_sid = authorized_sockets[game_info.white_player.id]
    black_sid = authorized_sockets[game_info.black_player.id]
    if win_color_upper_letter == "W":
        emit("game_ended", {'result': 'win', 'eloChange': white_elo_change_int}, to=white_sid)
        emit("game_ended", {'result': 'lost', 'eloChange': black_elo_change_int}, to=black_sid)
    elif win_color_upper_letter == "B":
        emit("game_ended", {'result': 'lost', 'eloChange': white_elo_change_int}, to=white_sid)
        emit("game_ended", {'result': 'win', 'eloChange': black_elo_change_int}, to=black_sid)
    else:
        emit("game_ended", {'result': 'draw', 'eloChange': white_elo_change_int}, to=white_sid)
        emit("game_ended", {'result': 'draw', 'eloChange': black_elo_change_int}, to=black_sid)


@socketio.on('surrender')
def surrender(data):
    obj = json.loads(data)
    print(obj)

    game_room_id = obj['gameroomId']

    # check if game even exists
    if game_room_id not in games:
        print("GAME ARLEADY GONE!! ")
        emit('error', {'error': 'Game already gone'})
        return

    player_id = obj['playerId']

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    # check if is in the game
    players_game = get_is_player_in_game(player_id)
    if not players_game or players_game[0].game_room_id != game_room_id:
        print("Player doesn't play in this game!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    print("Player with id " + player_id + "surrendered the game")

    game_info = games[game_room_id]
    player_color = players_game[1]
    # get opponents color
    opp_color = 'w'
    if player_color == 'w':
        opp_color = 'b'

    finish_game(game_info, opp_color)


@socketio.on('place_defender_piece')
def place_defender_piece(data):
    data_obj = json.loads(data)
    print(data_obj)

    # authorize player
    if not check_auth(request.sid, data_obj['playerId']):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    game_room_id = data_obj['gameroomId']
    player_id = data_obj['playerId']

    # check if the game exists at all
    if game_room_id not in games:
        print("NO_SUCH_GAME_EXISTS")
        return

    # check if is in the game
    players_game = get_is_player_in_game(player_id)
    if not players_game or players_game[0].game_room_id != game_room_id:
        print("Player doesn't play in this game!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    player_color = players_game[1]
    game_info = games[game_room_id]
    spent_points = data_obj['spentPoints']

    # check if it's even a defender game
    if str(game_info.game_mode_id) == '0':
        print("Not a defender game")
        return

    # defender game already in making moves phase
    if game_info.defender_state.phase != 0:
        print("Defender game already in making moves phase")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    white_id = game_info.white_player.id
    black_id = game_info.black_player.id
    curr_turn = game_info.curr_turn
    got_FEN = data_obj['FEN']

    # check if it's coming from the wrong player
    if str(curr_turn) != str(player_color):
        # send not ur turn packet
        print("NOT UR TURN")
        return

    if not games[game_room_id].defender_state.update_score(player_color, spent_points):
        print("AIN't GOT THAT MANY POINTS TO SPENT BUCKO")
        return
    if spent_points == 0:
        games[game_room_id].defender_state.end_phase(player_color)
    # get opposite turn
    opp_turn = 'w'
    if str(games[game_room_id].game_mode_id) == "1":
        if int(games[game_room_id].defender_state.white_score) == 0 and int(
                games[game_room_id].defender_state.black_score) == 0:
            opp_turn = 'w'
        elif int(games[game_room_id].defender_state.white_score) < 0:
            if curr_turn == 'b':
                opp_turn = 'w'
            else:
                opp_turn = 'b'
        elif int(games[game_room_id].defender_state.black_score) < 0:
            if curr_turn == 'b':
                opp_turn = 'w'
            else:
                opp_turn = 'b'
        elif int(games[game_room_id].defender_state.black_score) == 0:
            opp_turn = 'w'
        elif int(games[game_room_id].defender_state.white_score) == 0:
            opp_turn = 'b'
        else:
            if curr_turn == 'b':
                opp_turn = 'w'
            else:
                opp_turn = 'b'
        # if curr_turn == 'b' and int(games[game_room_id].defender_state.white_score) == 0 and int(
        #         games[game_room_id].defender_state.black_score) != 0:
        #     opp_turn = 'b'
        # elif curr_turn == 'w':
        #     opp_turn = 'b'

    # TODO MAKE GOOD @wojtek
    if str(games[game_room_id].game_mode_id) == "2":

        your_score = games[game_room_id].defender_state.white_score
        if curr_turn == 'b':
            your_score = games[game_room_id].defender_state.black_score

        opp_turn = curr_turn

        if your_score < 0:
            if games[game_room_id].defender_state.phase == 0:
                opp_turn = curr_turn
            else:
                if curr_turn == 'b':
                    opp_turn = 'w'
                else:
                    opp_turn = 'b'

    if spent_points == 0:
        games[game_room_id].defender_state.end_phase(player_color)
        games[game_room_id].defender_state.check_change_phase()
        spent_points = 1
        print(games[game_room_id].defender_state.phase)

    games[game_room_id].curr_turn = opp_turn
    # update FEN with turn info
    updated_FEN = ChessLogic.update_fen_with_turn_info(got_FEN, opp_turn)
    games[game_room_id].curr_FEN = updated_FEN

    # only notify opponent if multiplayer,
    if not game_modes[int(game_info.game_mode_id)].game_mode_multiplayer:
        return

    # send move to opponent
    opponent_sid = authorized_sockets[white_id]
    if player_color == 'w':
        opponent_sid = authorized_sockets[black_id]

    emit('place_defender_piece_local',
         {'FEN': updated_FEN, 'spentPoints': spent_points, 'whiteScore': games[game_room_id].defender_state.white_score,
          'blackScore': games[game_room_id].defender_state.black_score}, to=opponent_sid)


def make_AI_move(opponent_sid,FEN):
    newFEN, move_AN_notation, move_neo_chess_notation = ChessLogic.get_best_move(FEN)

    emit('make_move_local_ai', move_neo_chess_notation, to=opponent_sid)

    return newFEN, move_AN_notation
    # # authorize player
    # if not check_auth(request.sid, data_obj['playerId']):
    #     print("Unathorized!! ")
    #     emit('unauthorized', {'error': 'Unauthorized access'})
    #     return
    #
    # game_room_id = data_obj['gameroomId']
    # player_id = data_obj['playerId']
    #
    # # check if the game exists at all
    # if game_room_id not in games:
    #     print("NO_SUCH_GAME_EXISTS")
    #     return
    #
    # # check if is in the game
    # players_game = get_is_player_in_game(player_id)
    # if not players_game or players_game[0].game_room_id != game_room_id:
    #     print("Player doesn't play in this game!! ")
    #     emit('unauthorized', {'error': 'Unauthorized access'})
    #     return
    #
    # player_color = players_game[1]
    # game_info = games[game_room_id]
    # white_id = game_info.white_player.id
    # black_id = game_info.black_player.id
    # curr_turn = game_info.curr_turn
    #
    # # if game_info.game_mode_id != '1':
    # #     print("Not a defender game")
    # #     return
    #
    # # # # defender game already in making moves phase
    # # if game_info.defender_state.phase != 1:
    # #     print("Defender game not in making moves phase yet")
    # #     return
    #
    # # check if it's coming from the wrong player
    # if str(curr_turn) != str(player_color):
    #     # send not ur turn packet
    #     print("NOT UR TURN")
    #     return
    #
    # curr_FEN = data_obj['FEN']
    # try:
    #     new_FEN, move = ChessLogic.get_best_move(curr_FEN)
    # except Exception as ex:
    #     print("STOCKFISH DIED COZ " + str(ex))
    #     return
    #
    # print(move)
    # emit('make_AI_move_local', move, room=game_room_id)
    #
    # # update local game object
    # if game_room_id not in games:
    #     print("NO_SUCH_GAME_EXISTS")
    #     return
    #
    # games[game_room_id].curr_FEN = new_FEN
    # move_order = game_info.num_of_moves
    # games[game_room_id].num_of_moves = move_order + 1
    # # get opposite turn
    # opp_turn = 'w'
    # if curr_turn == 'w':
    #     opp_turn = 'b'
    # games[game_room_id].curr_turn = opp_turn
    #
    # # try:
    # #     game_id = game_info.game_id
    # #     db = ChessDB.ChessDB()
    # #     db.add_move(game_id, str(curr_turn).upper(), move_order, move)
    # # except Exception as ex:
    # #     print("DB ERROR" + str(ex))
    #
    # # check for checkmates
    # is_mate = ChessLogic.is_checkmate(games[game_room_id].curr_FEN)
    # if is_mate:
    #     finish_game(game_info, curr_turn)


@socketio.on('make_move')
def make_move(data):
    data_obj = json.loads(data)
    print(data_obj)

    # authorize player
    if not check_auth(request.sid, data_obj['playerId']):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    print(data)
    game_room_id = data_obj['gameroomId']
    move = data_obj['move']
    player_id = data_obj['playerId']
    is_promotion = data_obj['move']['isPromotion']

    # check if the game exists at all
    if game_room_id not in games:
        print("NO_SUCH_GAME_EXISTS")
        return

    # check if is in the game
    players_game = get_is_player_in_game(player_id)
    if not players_game or players_game[0].game_room_id != game_room_id:
        print("Player doesn't play in this game!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    player_color = players_game[1]
    game_info = games[game_room_id]
    white_id = game_info.white_player.id
    black_id = game_info.black_player.id
    curr_turn = game_info.curr_turn

    # check if it's coming from the wrong player
    if str(curr_turn) != str(player_color):
        # send not ur turn packet
        print("NOT UR TURN")
        return

    is_move_legal, move_AN_notation = ChessLogic.is_valid_move(game_info.curr_FEN, move['startingSquare'],
                                                               move['targetSquare'])

    if not is_move_legal:
        emit('illegal_move', move, to=request.sid)
        print("INVALID MOVE")
        return

    # append promotion move suffix to promotion moves
    if str(is_promotion) == "1":
        move_AN_notation.promotion = 5

    # send move to opponent
    if white_id in authorized_sockets and black_id in authorized_sockets:
        opponent_sid = authorized_sockets[white_id]
        if player_color == 'w':
            opponent_sid = authorized_sockets[black_id]

        emit('make_move_local', move, to=opponent_sid)

    # update local game object
    if game_room_id not in games:
        print("NO_SUCH_GAME_EXISTS")
        return

    new_FEN = ChessLogic.update_FEN_by_AN_move(game_info.curr_FEN, move_AN_notation)
    games[game_room_id].curr_FEN = new_FEN
    move_order = game_info.num_of_moves
    games[game_room_id].num_of_moves = move_order + 1

    #add move to db
    add_move_to_db(game_info.game_id, move_AN_notation, curr_turn, move_order)

    # switch turns
    opp_turn = 'w'
    if curr_turn == 'w':
        opp_turn = 'b'
    games[game_room_id].curr_turn = opp_turn


    is_checkmate = ChessLogic.is_checkmate(games[game_room_id].curr_FEN)
    if is_checkmate:
        finish_game(game_info, curr_turn)
        return

    is_stalemate = ChessLogic.is_stalemate(games[game_room_id].curr_FEN)
    if is_stalemate:
        finish_game(game_info, 'N')
        return

    # make AI move in positions gamemode
    if str(game_info.game_mode_id) == "2" and opp_turn != player_color:
        computer_color = games[game_room_id].curr_turn

        newFEN , move_AN_notation = make_AI_move(request.sid,games[game_room_id].curr_FEN)
        # update FEN after AI move
        new_FEN = ChessLogic.update_FEN_by_AN_move(games[game_room_id].curr_FEN, move_AN_notation)
        games[game_room_id].curr_FEN = new_FEN
        # increment move count
        move_order = games[game_room_id].num_of_moves
        games[game_room_id].num_of_moves = move_order + 1
        # add move to db
        add_move_to_db(games[game_room_id].game_id, move_AN_notation, games[game_room_id].curr_turn, move_order)
        #change turn back to players
        games[game_room_id].curr_turn = player_color

        # check for checkmates after AI MOVE
        if game_room_id not in games:
            print("NO_SUCH_GAME_EXISTS")
            return

        is_checkmate = ChessLogic.is_checkmate(games[game_room_id].curr_FEN)
        if is_checkmate:
            finish_game(game_info, computer_color)
            return

        is_stalemate = ChessLogic.is_stalemate(games[game_room_id].curr_FEN)
        if is_stalemate:
            finish_game(game_info, 'N')
            return


def add_move_to_db(game_id, move_AN_notation, curr_turn, move_order):
    try:
        db = ChessDB.ChessDB()
        move_string = str(move_AN_notation)
        db.add_move(game_id, str(curr_turn).upper(), move_order, move_string)
    except Exception as ex:
        print("DB ERROR WHEN ADDING MOVE " + str(ex))


# propose a draw
@socketio.on("propose_draw")
def propose_draw(data):
    data_obj = json.loads(data)

    game_id = data_obj['gameroomId']
    player_id = data_obj['playerId']

    print("PROPOSED A DRAW")
    print(data_obj)

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    # check if player is in the selected game
    game_info_pack = get_is_player_in_game(player_id)
    if not game_info_pack or str(game_info_pack[0].game_room_id) != str(game_id):
        print("Wrong game")
        return

    game_obj = game_info_pack[0]
    playing_as = game_info_pack[1]

    opp_color = 'w'
    if playing_as == 'w':
        opp_color = 'b'

    # if you already proposed a draw, don't propose again
    if games[game_obj.game_room_id].draw_proposed == playing_as:
        return

    # if a draw was already proposed by the opponent, just accept it
    if games[game_obj.game_room_id].draw_proposed == opp_color:
        finish_game(game_obj, 'none')
        emit('draw_response', {'accepted': True}, room=game_obj.game_room_id, include_self=True)
        return

    # set draw proposed by player color in game info
    games[game_obj.game_room_id].draw_proposed = playing_as

    # send to everyone in the room except sender
    emit('draw_proposed', {}, room=game_obj.game_room_id, include_self=False)


# accept a draw
@socketio.on("answer_draw")
def answer_draw(data):
    data_obj = json.loads(data)
    print(data_obj)

    game_id = data_obj['gameroomId']
    player_id = data_obj['playerId']
    accepted = data_obj['accepted']

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    # check if player is in the selected game
    game_info_pack = get_is_player_in_game(player_id)
    if not game_info_pack or str(game_info_pack[0].game_room_id) != str(game_id):
        print("Wrong game")
        return

    game_obj = game_info_pack[0]
    playing_as = game_info_pack[1]

    opp_color = 'w'
    if playing_as == 'w':
        opp_color = 'b'

    # check if it was opponent proposed a draw
    if games[game_obj.game_room_id].draw_proposed != opp_color:
        return

    # if it was declined, clear gameobject draw proposal
    if not accepted:
        games[game_obj.game_room_id].draw_proposed = None

    if accepted:
        finish_game(game_obj, 'none')

    # send to everyone in the room
    emit('draw_response', {'accepted': accepted}, room=game_obj.game_room_id, include_self=False)


# in game chat
@socketio.on("send_chat_to_server")
def send_chat_to_server(data):
    data_obj = json.loads(data)

    player_name = data_obj['username']
    text = data_obj['msg']
    game_id = data_obj['gameId']
    player_id = data_obj['userId']

    # authorize player
    if not check_auth(request.sid, player_id):
        print("Unathorized!! ")
        emit('unauthorized', {'error': 'Unauthorized access'})
        return

    # check if player is in the selected game
    game_info = get_is_player_in_game(player_id)[0]
    if not game_info or str(game_info.game_room_id) != str(game_id):
        print("Wrong game")
        return

    # send to everyone in the room except sender
    emit('receive_message', {'text': text, 'playerName': player_name}, room=game_info.game_room_id, include_self=False)
