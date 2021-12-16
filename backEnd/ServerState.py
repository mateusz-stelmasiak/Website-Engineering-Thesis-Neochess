import math
from timeit import default_timer as timer

########################
# SERVER STATE VARIABLES#
########################

# User login sessions
# userid (string) is key, contains dict with 'session_token' and 'refresh_token'
# ex. tkn=Sessions['3']['refresh_token'] gets refresh token for playerId 3
Sessions = {}

# Matchmaking variables
queues = {}
q_max_wait_time = 10000  # in ms
initial_scope = 1000  # +-elo when looking for opponents
scope_update_interval = 10000  # time it takes for scope to widen (in ms)
scope_update_ammount = 50  # ammount by which scope widens every scope_update_interval

# Gameplay variables
# white_id, #black_id,#curr_turn,#game_id,#numOfMoves,FEN
games = {}
default_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
defender_FEN = "8/8/8/8/8/8/8/8 w - - 0 1"

# TODO HERE YOU CAN CHANGE MAX_TIMES
time_dialation = 1  # should be 1 in ideal conditions >1 if server lags behind
game_mode_times = [600, 600]  # defines time constraint IN SECONDS for gametype at index
game_mode_starting_FEN = [default_FEN, defender_FEN]
defender_starting_score = 20

# Socket auth service
authorized_sockets = {}


#################
# ACCESOR_METHODS#
#################


def get_player_from_queue(player_id, game_mode_id):
    if str(game_mode_id) not in queues.copy():
        return False

    for player in queues[str(game_mode_id)]:
        if player[0].id == player_id:
            return player

    return False


def get_player_from_queue_by_id(player_id):

    if player_id is None:
        return False

    for game_mode_id, queuedPlayers in queues.copy().items():
        for player in queuedPlayers:
            if player[0].id == player_id:
                return [player, game_mode_id]

    return False

def get_player_from_queue_by_sid(sid):
    # get player ID from sid
    player_id = get_id_by_sid(sid)

    if player_id is None:
        return False

    for game_mode_id, queuedPlayers in queues.copy().items():
        for player in queuedPlayers:
            if player[0].id == player_id:
                return [player, game_mode_id]

    return False


# get player ID from sid
def get_id_by_sid(sid):
    try:
        player_id = list(authorized_sockets.keys())[list(authorized_sockets.values()).index(sid)]
        return player_id
    except Exception as ex:
        return None


# returns [game,color] game object with it's info and
# which color the given player is playing ('w'/'b')
# False if player not in game
def get_is_player_in_game(playerId):
    if playerId is None:
        return

    for roomId, game in games.items():
        if game.white_player.id == playerId:
            return [game, 'w']
        if game.black_player.id == playerId:
            return [game, 'b']

    return False


################
# COMMON CLASSES#
################


class Player:
    def __init__(self, id, username, ELO, playing_as):
        self.id = id
        self.username = username
        self.ELO = ELO
        self.playing_as = playing_as


class Game:

    def __init__(self, game_id, game_room_id, game_mode_id, white_player, black_player, curr_turn, curr_FEN,
                 num_of_moves, timer):
        self.game_id = game_id
        self.game_room_id = game_room_id
        self.game_mode_id = game_mode_id
        self.white_player = white_player
        self.black_player = black_player
        self.curr_turn = curr_turn
        self.curr_FEN = curr_FEN
        self.num_of_moves = num_of_moves
        self.timer = timer
        self.defender_state = Defender_State()


# state 0- placing pieces stage, 1- making them movesss
class Defender_State:

    def __init__(self):
        self.black_score = defender_starting_score
        self.white_score = defender_starting_score
        self.phase = 0

    # returns false on illegal place
    def update_score(self, player_color, spent_points):
        if player_color == 'w':
            new_score = self.white_score - spent_points
            if new_score < 0:
                return False
            self.white_score = new_score

        if player_color == 'b':
            new_score = self.black_score - spent_points
            if new_score < 0:
                return False
            self.black_score = new_score

        return True

    #ends puting down phase for given color
    def end_phase(self,player_color):
        if player_color == 'w':
            self.white_score=-1

        if player_color == 'b':
            self.black_score = -1

    def check_change_phase(self):
        if self.black_score == -1 and self.white_score == -1:
            self.phase = 1



class Timer:
    def __init__(self, max_time):
        self.white_time = max_time
        self.black_time = max_time
        self.last_move_timestamp = timer()

    # returns color that won by time
    def update_timers(self, curr_turn):
        time_passed = time_dialation * (timer() - self.last_move_timestamp)
        self.last_move_timestamp = timer()

        if curr_turn == 'w':
            dec_val, seconds_before = math.modf(self.white_time)
            self.white_time = self.white_time - time_passed
            dec_val, seconds_after = math.modf(self.white_time)
            full_second_passed = seconds_before > seconds_after
        elif curr_turn == 'b':
            dec_val, seconds_before = math.modf(self.black_time)
            self.black_time = self.black_time - time_passed
            dec_val, seconds_after = math.modf(self.black_time)
            full_second_passed = seconds_before > seconds_after

        if self.black_time <= 0:
            return 'w', full_second_passed
        if self.white_time <= 0:
            return 'b', full_second_passed

        return None, full_second_passed
