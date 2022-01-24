import json

from flask import Flask, request, jsonify, make_response, url_for, redirect
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from hashlib import sha256

import ChessDB
import random
import hashlib
from flask_cors import CORS
import RatingSystem
from ServerState import *
import pyotp
import base64
from Mailing import Mailing

domain = '34.118.14.151'
dns_domain = 'chess-defence.ddns.net'
local_port = str(3000)
local_domain = 'localhost:' + local_port
origin_prefix = "http://"
allowed_domains = [domain, dns_domain, local_domain, '127.0.0.1', '127.0.0.1:' + local_port, 'localhost']
# add http:// before each allowed domain to get orgin
allowed_origins = [origin_prefix + dom for dom in allowed_domains]
debug_mode = True
mail = Mailing()

# FLASK CONFIG
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretkey'
app.config['SECURITY_PASSWORD_SALT'] = 'a3D2xz1k0G'
app.config['DEBUG'] = True
app.config['CORS_HEADERS'] = 'Content-Type'

account_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

cors = CORS(app, resources={r"/*": {"origins": "*"}})
# TODO Uncomment below when ssl is installed (secure cookies)
# app.config.update(
#     SESSION_COOKIE_HTTPONLY= True,
#     SESSION_COOKIE_SECURE=True,
# )

# COOKIES CONFIG
app.config['SECRET_KEY'] = 'secret!'
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_SAMESITE='None'
)


# generates response for given data and code with appropriate headers
def generate_response(request_got, data, HTTP_code):
    origin = request_got.environ.get('HTTP_ORIGIN', 'default value')

    if origin in allowed_origins:
        resp = make_response(jsonify(data), HTTP_code)
        resp.headers['Access-Control-Allow-Origin'] = origin
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        resp.headers['Access-Control-Allow-Methods'] = '*'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp

    return make_response({}, 400)


# LOGIN SERVICE HELPERS
def generate_session_token(user_id):
    n = random.randint(1000000000000, 9999999999999)
    n = hashlib.sha256(str(n).encode())
    return str(n.hexdigest())


def generate_refresh_token(user_id):
    n = random.randint(1000000000000, 9999999999999)
    n = hashlib.sha256(str(n).encode())
    return str(n.hexdigest())


def authorize_user(user_id, session_token):
    # making sure userid is a string
    user_id_str = str(user_id)
    if (user_id_str not in Sessions) or (session_token != Sessions[user_id_str]['session_token']):
        return False

    return True


def get_domain_from_url(url):
    if ':' in url:
        url = url.split(":")[1]

    dom = url[2:]
    # replace localhost with localhost ip
    if dom == "localhost":
        dom = '127.0.0.1'

    return dom


@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    request_data = request.get_json()

    if debug_mode:
        print("LOGIN REQUEST " + str(request_data))

    user_name = request_data['username']

    # get user data from db
    try:
        db = ChessDB.ChessDB()
        user = db.get_user(user_name)
    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {
            "error": "Can't fetch from db"
        }, 503)

    # user wasn't found in the database ergo wrong username
    if user is None:
        return generate_response(request, {
            "error": "Username doesn't exist"
        }, 403)

    user_id = str(user['userID'])
    user_pass = str(user['Password'])
    user_2fa = True if str(user['2FA']) == '1' else False
    user_elo = str(user['ELO'])
    user_account_activated = True if str(user['AccountConfirmed']) == "1" else False

    # actual user's password doesn't match given
    if user_pass != sha256(str.encode(f"{request_data['hashedPassword']}{user['Salt']}")).hexdigest():
        return generate_response(request, {
            "error": "Incorrect password"
        }, 403)

    # generate session and refresh token for user
    session_token = generate_session_token(user_id)
    refresh_token = generate_refresh_token(user_id)
    Sessions[user_id] = {
        'refresh_token': refresh_token,
        'session_token': session_token
    }

    print(refresh_token)
    # create cookie with refresh token, and send back payl1oad with sessionToken
    resp = generate_response(request, {
        "userId": user_id,
        "userElo": user_elo,
        "sessionToken": session_token,
        "twoFa": user_2fa,
        "accountActivated": user_account_activated
    }, 200)

    # create resfresh token cookie that is only ever sent to /refresh_session path
    req_url = request.environ.get('HTTP_ORIGIN', 'default value')
    curr_domain = get_domain_from_url(req_url)
    if curr_domain in allowed_domains:
        resp.set_cookie('refreshToken', refresh_token, domain=curr_domain, samesite='None',
                        secure='false')  # path="/refresh_session"

    return resp


# takes refresh token from cookie and generates and returns new session token
@app.route('/refresh_session', methods=['GET', 'OPTIONS'])
def refresh_session():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("REFRESH_SESSION REQUEST " + " " + str(request.cookies))

    user_id = str(request.args['userId'])

    # check if it even contains refresh token cookie
    if not request.cookies.get('refreshToken'):
        if debug_mode:
            print("Missing refresh token cookie.")

        return generate_response(request, {
            "error": "Missing refresh token cookie."
        }, 401)

    refresh_token = str(request.cookies.get('refreshToken'))
    # check if refresh token is valid
    if (user_id not in Sessions) or Sessions[user_id]['refresh_token'] != str(refresh_token):
        if debug_mode:
            print("Wrong refresh token.")

        return generate_response(request, {
            "error": "Wrong refresh token."
        }, 401)

    if debug_mode:
        print("GOT TOKEN: " + refresh_token)

    if debug_mode:
        print("HAVE TOKEN: " + Sessions[user_id]['refresh_token'])

    new_session_token = generate_session_token(user_id)
    Sessions[user_id]['session_token'] = new_session_token

    return generate_response(request, {
        "sessionToken": str(new_session_token)
    }, 200)


@app.route('/logout', methods=['GET', 'OPTIONS'])
def logout():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if request.args is None:
        if debug_mode:
            print('No player id in logout')

        return generate_response(request, {"error": "Missing playerId"}, 400)

    if debug_mode:
        print("LOGOUT REQUEST " + str(request.args))

    user_id = request.args['userId']

    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        return generate_response(request, {"error": "Authorisation failed."}, 401)

    # delete session token for user
    del Sessions[str(user_id)]

    # delete authorized socket for user
    # if user_id in authorized_sockets:
    #     del authorized_sockets[user_id]

    # set cookie to a dummy one
    resp = generate_response(request, {
        "logout": 'succesfull'
    }, 200)

    req_url = request.environ.get('HTTP_ORIGIN', 'default value')
    curr_domain = get_domain_from_url(req_url)

    if curr_domain in allowed_domains:
        resp.set_cookie('refreshToken', 'none', domain=curr_domain, samesite='None',
                        secure='false')  # path="/refresh_session"

    return resp


@app.route('/check2Fa', methods=['POST', 'OPTIONS'])
def check_2_fa():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    request_data = request.get_json()
    username = request_data['username']
    two_fa_code = request_data['code']

    if debug_mode:
        print("CHECK_2FA_CODE REQUEST " + str(request_data))

    try:
        db = ChessDB.ChessDB()
        user = db.get_user(username)

        otp_secret = user['OTPSecret']
        otp = pyotp.totp.TOTP(otp_secret)

        verify_result = otp.verify(two_fa_code)

        return generate_response(request, {
            "result": verify_result
        }, 200 if verify_result else 403)

    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {
            "error": "Database error"
        }, 503)


@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    request_data = request.get_json()
    username = request_data['username']
    hashed_password = request_data['hashedPassword']
    email = request_data['email']
    is2FaEnabled = request_data['is2FaEnabled']

    if debug_mode:
        print("REGISTER REQUEST " + str(request_data))

    try:
        # handle username taken
        db = ChessDB.ChessDB()

        if db.user_exists(username):
            return generate_response(request, {
                "error": "Username already taken"
            }, 403)

        if db.user_exists(email):
            return generate_response(request, {
                "error": "Email already taken"
            }, 403)

        # generate OTP data
        otp_secret = base64.b32encode(email.encode('ascii'))
        otp_url = pyotp.totp.TOTP(otp_secret).provisioning_uri(email, issuer_name="NeoChess")

        # add to database
        db.add_user(username, hashed_password, email, is2FaEnabled, otp_secret, 'PL', RatingSystem.starting_ELO,
                    RatingSystem.starting_ELO_deviation, RatingSystem.starting_ELO_volatility)

        token = account_serializer.dumps(email, salt=app.config['SECRET_KEY'])
        link = url_for('confirm_email', token=token, _external=True)

        if is2FaEnabled:
            mail.send_qr_code(login, email, otp_url)

        mail.send_welcome_message(login, email, link)

    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {"error": "Database error"}, 503)

    return generate_response(request,
                             {
                                 "registration": 'succesfull',
                             }, 200)


@app.route('/delete', methods=['DELETE', 'OPTIONS'])
def delete_user():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("DELETE_USER REQUEST " + str(request.args))

    user_id = request.args['id']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed."
        }, 401)

    request_data = request.get_json()

    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_id(user_id)

        if user['Password'] != sha256(str.encode(f"{request_data['hashedPassword']}{user['Salt']}")).hexdigest():
            return generate_response(request, {
                "response": "Incorrect password"
            }, 403)

        if request_data['isTwoFaEnabled']:
            otp_secret = user['OTPSecret']
            otp = pyotp.totp.TOTP(otp_secret)
            verify_result = otp.verify(request_data['twoFaCode'])
            if not verify_result:
                return generate_response(request, {
                    "response": "Incorrect 2FA code"
                }, 403)

        db.remove_user(user_id)
        del Sessions[str(user_id)]
        resp = generate_response(request, {
            "response": 'OK'
        }, 200)

        req_url = request.environ.get('HTTP_ORIGIN', 'default value')
        curr_domain = get_domain_from_url(req_url)

        if curr_domain in allowed_domains:
            resp.set_cookie('refreshToken', 'none', domain=curr_domain, samesite='None',
                            secure='false')  # path="/refresh_session"

        return resp

    except Exception as ex:
        return generate_response(request, {
            "response": f"Database error: {ex}"
        }, 503)


@app.route('/getUserDetails', methods=['GET', 'OPTIONS'])
def get_user_details():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("GET_USER_DETAILS REQUEST " + str(request.args))

    user_id = request.args['id']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed."
        }, 401)

    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_id(user_id)

        return generate_response(request, user, 200)
    except Exception as ex:
        return generate_response(request, {
            "response": f"Database error: {ex}"
        }, 503)


@app.route('/update', methods=['POST', 'OPTIONS'])
def update_user():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("UPDATE_USER REQUEST " + str(request.args))

    user_id = request.args['id']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed."
        }, 401)

    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_id(user_id)

        request_data = request.get_json()

        if request_data['email'] != "":
            if db.user_exists(request_data['email']) and user['Email'] != request_data['email']:
                return generate_response(request, {
                    "response": "Email address already taken"
                }, 403)
            else:
                token = account_serializer.dumps(request_data['email'], salt=app.config['SECRET_KEY'])
                link = url_for('confirm_email', token=token, _external=True)
                mail.send_welcome_message(user['Username'], request_data['email'], link)

        if user['Password'] != sha256(str.encode(f"{request_data['hashedCurrentPassword']}{user['Salt']}")).hexdigest():
            return generate_response(request, {
                "response": "Incorrect password"
            }, 403)

        db.update_user(user, request_data)

        return generate_response(request, {
            "response": "OK"
        }, 200)

    except Exception as ex:
        return generate_response(request, {
            "response": f"Database error: {ex}"
        }, 503)


@app.route('/resent', methods=['GET', 'OPTIONS'])
def resent_activation_email():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("RESENT_ACTIVATION_EMAIL REQUEST " + str(request.args))

    data = request.args['data']

    if "@" not in data:
        db = ChessDB.ChessDB()
        user = db.get_user(data)
        data = user['Email']

    try:
        token = account_serializer.dumps(data, salt=app.config['SECRET_KEY'])
        link = url_for('confirm_email', token=token, _external=True)

        mail.send_welcome_message(login, data, link)

        return generate_response(request, {
            "result": "ok"
        }, 200)
    except Exception as ex:
        return generate_response(request, {
            "result": ex
        }, 503)



@app.route('/confirm/<token>', methods=['GET', 'OPTIONS'])
def confirm_email(token):
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    try:
        email = account_serializer.loads(token, salt=app.config['SECRET_KEY'], max_age=3600)
    except SignatureExpired as ex:
        print(ex)
        return generate_response(request, {
            "activation_result": "The confirmation link is invalid or has expired."
        }, 400)

    db = ChessDB.ChessDB()
    user = db.get_user_by_email(email)

    if user is not None:
        if user['AccountConfirmed']:
            return redirect(f"{local_domain}/")
        else:
            db.activate_user_account(email)
            return redirect(f"{local_domain}/")


@app.route('/reset', methods=['POST'])
def reset():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    request_data = request.get_json()
    token = request_data['token']
    password = request_data['hashedPassword']

    if debug_mode:
        print("SET_NEW_PASSWORD REQUEST " + str(request.args))

    try:
        email = account_serializer.loads(token, salt=app.config['SECRET_KEY'], max_age=3600)

        db = ChessDB.ChessDB()
        db.update_password(password, email)

        return generate_response(request, {
            "response": "OK"
        }, 200)
    except Exception as ex:
        return generate_response(request, {
            "response": f"Database error: {ex}"
        }, 503)


@app.route('/forgotPassword', methods=['GET', 'OPTIONS'])
def forgot_password():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("PASSWORD_RESET REQUEST " + str(request.args))

    email = request.args['email']

    try:
        db = ChessDB.ChessDB()
        user = db.get_user_by_email(email)
    except Exception as ex:
        return generate_response(request, {
            "response": f"Database error: {ex}"
        }, 503)

    if user is not None:
        try:
            token = account_serializer.dumps(email, salt=app.config['SECRET_KEY'])
            reset_url = f"{origin_prefix}{local_domain}/forgotPassword?token={token}"

            mail.send_reset_password_token(user['userID'], email, reset_url)
        except Exception as ex:
            return generate_response(request, {
                "response": f"Password reset error: {ex}"
            }, 503)

    return generate_response(request, {
        "response": "OK"
    }, 200)


@app.route('/is_in_game', methods=['GET', 'OPTIONS'])
def is_in_game():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("IS_IN_GAME REQUEST " + str(request.args))

    user_id = request.args['userId']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed."
        }, 401)

    # generate info
    data = {"inGame": False}
    game_info = get_is_player_in_game(user_id)
    if not game_info:
        if debug_mode:
            print('Player not in game!')

        return generate_response(request, data, 200)

    game = game_info[0]
    playing_as = game_info[1]
    opponent_username = game_info[2]
    print(game)

    data = {
        "inGame": True,
        "gameId": game.game_room_id,
        "gameMode": game.game_mode_id,
        "playingAs": playing_as,
        "opponentUsername": opponent_username
    }

    return generate_response(request, data, 200)


@app.route('/get_game_info', methods=['GET', 'OPTIONS'])
def get_game_info():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("GAME_INFO REQUEST " + str(request.args))

    if 'gameRoomId' not in request.args:
        print("MISSING ARGUMENT")
        return generate_response(request, {
            "error": 'missing gameRoomId arg'
        }, 400)

    game_room_id = request.args['gameRoomId']

    # generate info
    game = games[str(game_room_id)]
    print(game)

    data = {"inGame": True,
            "gameId": game.game_room_id,
            "gameMode": game.game_mode_id,
            'currentTurn': game.curr_turn,
            "FEN": game.curr_FEN,
            "whitePlayer": {
                "username": game.white_player.username,
                "ELO": game.white_player.ELO,
                "playingAs": 'w'
            },
            "blackPlayer": {
                "username": game.black_player.username,
                "ELO": game.black_player.ELO,
                "playingAs": 'b'
            },
            'blackTime': game.timer.black_time,
            'whiteTime': game.timer.white_time,
            'drawProposedColor': game.draw_proposed
            }

    if str(game.game_mode_id) == '1' or str(game.game_mode_id) == '2':
        data = {"inGame": True,
                "gameId": game.game_room_id,
                "gameMode": game.game_mode_id,
                'currentTurn': game.curr_turn,
                "FEN": game.curr_FEN,
                "whitePlayer": {
                    "username": game.white_player.username,
                    "ELO": game.white_player.ELO,
                    "playingAs": 'w'
                },
                "blackPlayer": {
                    "username": game.black_player.username,
                    "ELO": game.black_player.ELO,
                    "playingAs": 'b'
                },
                'blackTime': game.timer.black_time,
                'whiteTime': game.timer.white_time,
                'whiteScore': game.defender_state.white_score,
                'blackScore': game.defender_state.black_score,
                'drawProposedColor': game.draw_proposed,
                'currentPhase': game.defender_state.phase
                }

    return generate_response(request, data, 200)


@app.route('/get_qr_code', methods=['GET', 'OPTIONS'])
def get_2fa_code():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("QR CODE REQUEST " + str(request.args))

    email = request.args['email']

    # generate OTP data
    otp_secret = base64.b32encode(email.encode('ascii'))
    otp_url = pyotp.totp.TOTP(otp_secret).provisioning_uri(email, issuer_name="NeoChess")

    data = {
        "qr_code": base64.b64encode(mail.get_qr_code(otp_url)).decode()
    }

    return generate_response(request, data, 200)


@app.route('/get_ELO_change_in_last_game', methods=['GET', 'OPTIONS'])
def get_ELO_change_in_last_game():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode: print("PLAYER_ELO CHANGE REQUEST " + str(request.args))
    user_id = request.args['userId']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']
    if not authorize_user(user_id, session_token):
        if debug_mode: print('Authorization failed')
        return generate_response(request, {"error": "Authorisation failed."}, 401)

    try:
        db = ChessDB.ChessDB()
        elo_last_two_games = db.get_elo_change_in_two_last_games(user_id)
        games_played = db.count_games(user_id)[0]

        # player has played only one game so far
        if games_played < 1:
            elo_change = elo_last_two_games[0][0] - RatingSystem.starting_ELO
        else:
            elo_change = elo_last_two_games[0][0] - elo_last_two_games[1][0]

    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {"error": "Database error"}, 503)

    data = {
        'eloChange': elo_change,
    }

    return generate_response(request, data, 200)


@app.route('/get_available_game_modes', methods=['GET', 'OPTIONS'])
def get_available_game_modes():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    data = []
    for game_mode in game_modes:
        data.append(
            {
                "gameModeId": game_mode.game_mode_id,
                "gameModeName": game_mode.game_mode_name,
                "gameModeDesc": game_mode.game_mode_desc,
                "gameModeTime": game_mode.game_mode_time,
                "gameModeIcon": game_mode.game_mode_icon,
                'gameModeMultiplayer': game_mode.game_mode_multiplayer
            }
        )
    print("game modes!")
    print(data)

    return generate_response(request, data, 200)


@app.route('/player_stats', methods=['GET', 'OPTIONS'])
def get_player_stats():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("PLAYER_STATS REQUEST " + str(request.args))

    user_id = request.args['userId']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed."
        }, 401)

    try:
        db = ChessDB.ChessDB()
        user_info = db.get_user_by_id(user_id)
        print(user_info)
        elo = user_info['ELO']
        deviation = user_info['ELODeviation']
        games_played = db.count_games(user_id)
        games_won = db.count_wins(user_id)
        games_lost = db.count_losses(user_id)
        draws = db.count_draws(user_id)

        # defender stats
        defender_played = db.count_games(user_id, 1)
        defender_won = db.count_wins(user_id, 1)
        defender_lost = db.count_losses(user_id, 1)
        defender_draws = db.count_draws(user_id, 1)
    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {
            "error": "Database error"
        }, 503)

    return generate_response(request, {
        'elo': elo,
        'deviation': deviation,
        'gamesPlayed': games_played,
        'gamesWon': games_won,
        'gamesLost': games_lost,
        'draws': draws,
        'defenderPlayed': defender_played,
        'defenderWon': defender_won,
        'defenderLost': defender_lost,
        'defenderDraws': defender_draws
    }, 200)


def generate_example_match_data():
    match1 = {"matchResult": "win",
              'p1Username': 'GG_Kasparov', 'p1PlayedAs': 'White', 'p1ELO': 1420,
              'p2Username': 'Rhyzome', 'p2PlayedAs': 'Black', 'p2ELO': 1587,
              'nOfMoves': '50',
              "hour": "21:37", "dayMonthYear": '22/05/2021'}
    match2 = {"matchResult": "loss",
              'p1Username': 'GG_Kasparov', 'p1PlayedAs': 'White', 'p1ELO': 1410,
              'p2Username': 'BodyW/Organs', 'p2PlayedAs': 'Black', 'p2ELO': 1567,
              "hour": "21:07",
              'nOfMoves': '32',
              "dayMonthYear": '22/05/2021'}

    return [match1, match2]


@app.route('/match_history', methods=['GET', 'OPTIONS'])
def get_history():
    if request.method == "OPTIONS":
        return generate_response(request, {}, 200)

    if debug_mode:
        print("PLAYER_HISTORY REQUEST " + str(request.args))

    user_id = request.args['userId']

    # handle user not having a session at all or invalid authorization
    session_token = request.headers['Authorization']

    if not authorize_user(user_id, session_token):
        if debug_mode:
            print('Authorization failed')

        return generate_response(request, {
            "error": "Authorisation failed"
        }, 401)

    # set page to 0 if not given in request
    page = 0
    if 'page' in request.args:
        page = int(request.args['page'])
    # num of games on given page, default 10
    games_per_page = 10
    if 'perPage' in request.args:
        games_per_page = int(request.args['perPage'])

    try:
        db = ChessDB.ChessDB()
        start = page * games_per_page
        end = (page * games_per_page) + games_per_page
        game_history = db.get_games(user_id, start, end)
        count_games = db.count_games(user_id)
        max_page = int(count_games[0] / games_per_page) + 1
    except Exception as ex:
        if debug_mode:
            ("DB ERROR " + str(ex))

        return generate_response(request, {
            "error": "Database error"
        }, 503)

    history = []

    # return max Page number
    history.append({'maxPage': max_page})

    # maps results from numbers to strings
    possible_results = {'0.0': 'loss', '0.5': 'draw', '1.0': 'win'}
    for game in game_history:
        try:
            white = db.get_participant('White', game['GameID'])
            black = db.get_participant('Black', game['GameID'])
            numOfMoves = db.count_moves(game['GameID'])

            # detect computer player
            if black is None:
                black = (0, 0, 0, 0.0, 'Black', '----', 'COMPUTER')
            if white is None:
                white = (0, 0, 0, 0.0, 'White', '---', 'COMPUTER')

            black_score = str(black[3])
            white_score = str(white[3])
            if black_score not in possible_results or white_score not in possible_results:
                continue

            result = possible_results[black_score]
            if str(white[2]) == user_id:
                result = possible_results[white_score]


            # extract date info from given string
            day_mont_year = str(game['played'])[:10]
            hour = str(game['played'])[11:16]

            match = {"matchResult": result,
                     'p1Username': str(white[6]), 'p1PlayedAs': 'White', 'p1ELO': str(white[5]),
                     'p2Username': str(black[6]), 'p2PlayedAs': 'Black', 'p2ELO': str(black[5]),
                     "hour": hour,
                     "nOfMoves": numOfMoves,
                     "dayMonthYear": day_mont_year}
            history.append(match)
        except Exception as ex:
            if debug_mode:
                ("DB ERROR " + str(ex))

            return generate_response(request, {
                "error": "Cannot fetch from db"
            }, 503)

    if debug_mode:
        print(game_history)

    return generate_response(request, json.dumps(history), 200)
