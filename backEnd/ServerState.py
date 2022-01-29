import math
from timeit import default_timer as timer


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
                 num_of_moves, timer, draw_proposed='null', defender_state=False):
        self.game_id = game_id
        self.game_room_id = game_room_id
        self.game_mode_id = game_mode_id
        self.white_player = white_player
        self.black_player = black_player
        self.curr_turn = curr_turn
        self.curr_FEN = curr_FEN
        self.num_of_moves = num_of_moves
        self.timer = timer
        self.draw_proposed = draw_proposed

        if not defender_state:
            self.defender_state = DefenderState()
        else:
            self.defender_state = defender_state


class GameMode:

    def __init__(self, game_mode_id, game_mode_name, game_mode_desc, game_mode_time, game_mode_starting_FEN,
                 game_mode_icon, game_mode_multiplayer=True):
        self.game_mode_id = game_mode_id
        self.game_mode_name = game_mode_name
        self.game_mode_desc = game_mode_desc
        self.game_mode_time = game_mode_time  # max time in gamemode (in s)
        self.game_mode_starting_FEN = game_mode_starting_FEN
        self.game_mode_icon = game_mode_icon  # font awesome icon name (omit fa/fas, just name)
        self.game_mode_multiplayer = game_mode_multiplayer


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


########################
# SERVER STATE VARIABLES#
########################

# User login sessions
# userid (string) is key, contains dict with 'session_token' and 'refresh_token'
# ex. tkn=Sessions['3']['refresh_token'] gets refresh token for playerId 3
Sessions = {}

# Socket auth service
authorized_sockets = {}

# Matchmaking variables
queues = {}
q_max_wait_time = 10000  # in ms
initial_scope = 1000  # +-elo when looking for opponents
scope_update_interval = 10000  # time it takes for scope to widen (in ms)
scope_update_ammount = 50  # ammount by which scope widens every scope_update_interval

# Gameplay variables
# white_id, #black_id,#curr_turn,#game_id,#numOfMoves,FEN
games = {}
time_dialation = 1  # should be 1 in ideal conditions >1 if server lags behind

#################
# GAME MODES#
#################

default_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
default_desc = "Classic chess"

# defender
defender_FEN = "8/8/8/8/8/8/8/8 w - - 0 1"
defender_desc = "Chess defender desc"
defender_starting_score = 20


# state 0- placing pieces stage, 1- making them movesss
class DefenderState:

    def __init__(self, white_score=defender_starting_score, black_score=defender_starting_score, phase=0):
        self.white_score = white_score
        self.black_score = black_score
        self.phase = phase

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

    # ends puting down phase for given color
    def end_phase(self, player_color):
        if player_color == 'w':
            self.white_score = -1

        if player_color == 'b':
            self.black_score = -1

    def check_change_phase(self):
        if self.black_score == -1 and self.white_score == -1:
            self.phase = 1


# Positions? (vs computer)
positions_FENS = ["8/8/8/8/2P5/1PPP4/R1P5/KR6 w - - 0 1", "1bkb4/1rbr4/8/8/8/8/8/8 w - - 0 1",
                  "8/8/8/8/8/2B5/1B1B4/1RKR4 b - - 0 1", "8/8/8/8/8/PP6/QPP5/KQPP4 b - - 0 1",
                  "8/8/8/8/8/PP6/QPP5/KQPP4 b - - 0 1","1kr3r1/ppp5/8/6p1/6pp/8/8/8 w - - 0 1",
                  "8/8/8/1Q6/3P4/4P3/1R3PPP/1R3BK1 w - - 0 1","2r1r1k1/2r1r1b1/5pbp/6p1/8/8/8/8 w - - 0 1"
                  ]
positions_desc = "Start from given position and outplay a computer"

game_modes = [
    GameMode(0, "Classic", default_desc, 600, default_FEN, 'chess'),  # classic mode, time in S
    GameMode(1, "Defender", defender_desc, 600, defender_FEN, 'chess'),  # defender mode, time in S
    GameMode(2, "Positions", positions_desc, 600, positions_FENS, 'chess-pawn', game_mode_multiplayer=False)
    # defender mode, time in S
]


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


# returns [game,color,opponent_username] game object with it's info and
# which color the given player is playing ('w'/'b')
# False if player not in game
def get_is_player_in_game(player_id):
    if player_id is None:
        return

    for roomId, game in games.items():
        if game.white_player.id == player_id:
            return [game, 'w', game.black_player.username]
        if game.black_player.id == player_id:
            return [game, 'b', game.white_player.username]

    return False
