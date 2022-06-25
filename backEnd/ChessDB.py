import base64
import time
import mysql.connector
import pyotp
import os

import RatingSystem
import random

from hashlib import sha256

# to account for time difference due to timezones (in hh:mm:ss)
server_time_difference = '02:00:00'


class ChessDB:
    def __init__(self):
        for _ in range (10):
            try:
                self.mydb = mysql.connector.connect(host=os.getenv("DATABASE_LOCATION"),
                                                    user="neochess_431429",
                                                    password="FmHnqBd2lsnC",
                                                    database="neo-chess-database")     
                print("Connected to database")
                break 
            except Exception as ex:
                print(f"Exception ocurred while connecting to database: {ex}")
                time.sleep(10)

        # self.mydb = mysql.connector.connect(host="serwer1305496.home.pl", user="13748919_neochess",
        #                                     password="YhuuFd6Z",
        #                                     database="13748919_neochess")

        self.alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*;?"

    def __del__(self):
        self.mydb.close()

    def create_db(self):
        mycursor = self.mydb.cursor()

        mycursor.execute('''create table if not exists Games
                             (GameID integer primary key AUTO_INCREMENT,
                             played DATETIME,
                             GameMode int not null DEFAULT 0,
                             FEN varchar(84) not null DEFAULT "");''')

        mycursor.execute('''create table if not exists Users
                            (userID integer primary key AUTO_INCREMENT,
                            Username varchar(64) unique not null, 
                            Password varchar(64) not null, 
                            Salt varchar(12) not null,
                            Email varchar(64) not null,
                            2FA boolean not null DEFAULT false,
                            OTPSecret varchar(64) not null,
                            AccountConfirmed boolean not null DEFAULT false,
                            CreatedAt DATETIME not null,
                            UpdatedAt DATETIME,
                            LoggedInAt DATETIME,
                            LastLoggedInAt DATETIME,
                            ELO int not null DEFAULT ''' + str(RatingSystem.starting_ELO) + ''', 
                            ELODeviation int not null DEFAULT ''' + str(RatingSystem.starting_ELO_deviation) + ''',
                            ELOVolatility FLOAT not null DEFAULT ''' + str(
            RatingSystem.starting_ELO_volatility) + ''' );''')

        mycursor.execute('''create table if not exists TwoFaRecoveryCodes
                            (CodeID Integer primary key AUTO_INCREMENT,
                            userID Integer not null,
                            Code varchar(64) not null,
                            Foreign key (userID) references Users(userID) on delete cascade);''')

        mycursor.execute('''CREATE table if not exists Participants
                            (ParticipantID integer primary key AUTO_INCREMENT, 
                            GameID INTEGER not null,
                            userID Integer not null,
                            Foreign key (GameID) references  Games(GameID) on delete cascade,
                            Foreign key (userID) references Users(userID) on delete cascade, 
                            Score FLOAT not null, 
                            Color varchar(32) not null,
                            currELO int not null);''')

        mycursor.execute('''create table if not exists Moves
                            (MoveID integer primary key AUTO_INCREMENT,
                            GameID INTEGER not null,
                            ParticipantID INTEGER  not null,
                            Foreign key (GameID) references  Games(GameID) on delete cascade,
                            Foreign key (ParticipantID) references Participants(ParticipantID) on delete cascade, 
                            move_order integer not null, 
                            Move varchar(100) not null);''')

        mycursor.close()

    def get_salt(self):
        return ''.join(random.choice(self.alphabet) for _ in range(12))

    def get_curr_date_time(self):
        mycursor = self.mydb.cursor()
        date = "SELECT ADDTIME(CURRENT_TIMESTAMP(), '" + server_time_difference + "') AS Today"
        mycursor.execute(date)

        return mycursor.fetchone()[0]

    def get_curr_date(self):
        mycursor = self.mydb.cursor()
        date = "SELECT NOW() AS Today"
        mycursor.execute(date)

        return mycursor.fetchone()[0]

    def user_exists(self, data):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_user = ("""SELECT * FROM Users WHERE Username = %s or Email = %s""")

        data_user = (data, data)

        mycursor.execute(sql_user, data_user)
        user = mycursor.fetchone()

        return True if user is not None else False

    def add_recovery_codes(self, user_id, recovery_codes):
        mycursor = self.mydb.cursor(dictionary=True)

        for recovery_code in recovery_codes:
            sql_codes = ("INSERT INTO TwoFaRecoveryCodes (Code, userID) VALUES (%s, %s)")
            data_code = (recovery_code, user_id)

            mycursor.execute(sql_codes, data_code)

        self.mydb.commit()
        mycursor.close()

    def update_login_times(self, user_id, last_login_time):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_update = ("""UPDATE Users SET LastLoggedInAt = %s, LoggedInAt = %s WHERE userID = %s""")

        date = self.get_curr_date()
        data_update = (last_login_time if last_login_time is not None else date, date, user_id)
        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()

    def add_user(self, username, password, email, is_2_fa_enabled, otp_secret, elo, elo_dv, elo_v, recovery_codes=None):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_user = ("INSERT INTO Users "
                    "(Username, Password, Salt, Email, 2FA, OTPSecret, CreatedAt, Elo, EloDeviation,"
                    "EloVolatility)"
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")

        date = self.get_curr_date()
        salt = self.get_salt()
        data_user = (username, sha256(str.encode(f"{password}{salt}")).hexdigest(), salt, email, is_2_fa_enabled,
                     otp_secret, date, elo, elo_dv, elo_v)

        mycursor.execute(sql_user, data_user)
        self.mydb.commit()
        mycursor.close()

        if is_2_fa_enabled:
            self.add_recovery_codes(mycursor.lastrowid, recovery_codes)

    def remove_user(self, user_id):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_delete = ("""DELETE FROM Users WHERE userID = %s""")

        data_delete = (user_id,)
        mycursor.execute(sql_delete, data_delete)
        self.mydb.commit()
        mycursor.close()

    def activate_user_account(self, email):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_update = ("""UPDATE Users SET AccountConfirmed = true WHERE Email = %s""")

        data_update = (email,)
        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()

    # gdzie moves to lista list gdzie move = (Color, move_order, move)
    def add_game(self, w_id, w_score, b_id, b_score, moves, game_mode_id, FEN):
        mycursor = self.mydb.cursor()

        sql_game = ("INSERT INTO Games "
                    "(played,GameMode,FEN) "
                    "VALUES (%s, %s,%s)")

        date = self.get_curr_date_time()
        data_game = (date, game_mode_id,FEN)
        mycursor.execute(sql_game, data_game)
        game_id = mycursor.lastrowid

        sql_participant = ("INSERT INTO Participants"
                           "(GameID, UserID, Score, Color, currELO)"
                           "VALUES(%s, %s, %s, %s, %s)")

        white_user = self.get_user_by_id(w_id)
        black_user = self.get_user_by_id(b_id)

        data_participant = (game_id, white_user['userID'], w_score, "White", white_user['ELO'])
        mycursor.execute(sql_participant, data_participant)
        data_participant = (game_id, black_user['userID'], b_score, "Black", black_user['ELO'])
        mycursor.execute(sql_participant, data_participant)

        sql_move = ("INSERT INTO Moves"
                    "(GameID, ParticipantID, move_order, Move)"
                    "VALUES (%s, %s, %s, %s)")

        for move in moves:
            data_move = (game_id, self.get_participant(move[0], game_id)[0], move[1], move[2])
            mycursor.execute(sql_move, data_move)
        self.mydb.commit()
        mycursor.close()
        return game_id

    def add_move(self, game_id, color, move_order, move):
        mycursor = self.mydb.cursor()

        sql_move = ("INSERT INTO Moves"
                    "(GameID, ParticipantID, move_order, Move)"
                    "VALUES (%s, %s, %s, %s)")

        data_move = (game_id, self.get_participant(color, game_id)[0], move_order, move)
        mycursor.execute(sql_move, data_move)
        self.mydb.commit()
        mycursor.close()

    # returns elo change (old-new)
    def update_elo(self, user_id, new_ELO, new_ELO_dv, new_ELO_v):
        mycursor = self.mydb.cursor()

        # calculate ELO change
        sql_find = ("""SELECT ELO FROM Users WHERE UserID = %s""")
        data_find = (user_id,)
        mycursor.execute(sql_find, data_find)
        ELO_before = mycursor.fetchone()[0]
        ELO_change = new_ELO - ELO_before

        sql_update = ("""UPDATE Users SET ELO = %s,ELODeviation = %s,ELOVolatility =%s WHERE UserID = %s""")
        data_update = (new_ELO, new_ELO_dv, new_ELO_v, user_id)
        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()
        return ELO_change

    def update_user(self, user, new_user_data_json, mail_service):
        mycursor = self.mydb.cursor(dictionary=True)
        is_account_activated = True

        user_id = user['userID']

        salt = self.get_salt() if new_user_data_json['hashedNewPassword'] is not None else user['Salt']

        new_password = sha256(str.encode(f"{new_user_data_json['hashedNewPassword']}{salt}")).hexdigest() \
            if new_user_data_json['hashedNewPassword'] is not None \
            else user['Password']

        email = new_user_data_json['email'] if new_user_data_json['email'] != "" else user['Email']
        is_2_fa_enabled = new_user_data_json['is2FaEnabled']

        if user['Email'] != email and email != "":
            is_account_activated = False

        if user['2FA'] and not is_2_fa_enabled:
            sql_remove_codes = ("""DELETE FROM TwoFaRecoveryCodes WHERE userID = %s""")
            data_remove = (user_id,)
            mycursor.execute(sql_remove_codes, data_remove)
        elif not user['2FA'] and is_2_fa_enabled:
            self.add_recovery_codes(user_id, new_user_data_json['hashedRecoveryCodes'])
            otp_secret = base64.b32encode(email.encode('ascii'))
            otp_url = pyotp.totp.TOTP(otp_secret).provisioning_uri(email, issuer_name="NeoChess")
            mail_service.send_qr_code(user['Username'], email, otp_url, otp_secret.decode('utf-8'))

        sql_update_query = ("""UPDATE Users SET
                                Password = %s,
                                Salt = %s,
                                Email = %s,
                                2FA = %s,
                                UpdatedAt = %s,
                                AccountConfirmed = %s WHERE userID = %s""")

        data_update = (new_password, salt, email, is_2_fa_enabled, self.get_curr_date(), is_account_activated, user_id)
        mycursor.execute(sql_update_query, data_update)

        self.mydb.commit()

        mycursor.close()

    def update_password(self, new_password, email):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_update = ("""UPDATE Users SET Password = %s, Salt = %s WHERE userID = %s""")

        salt = self.get_salt()

        data_update = (
            sha256(str.encode(f"{new_password}{salt}")).hexdigest(),
            salt,
            self.get_user_by_email(email)['userID']
        )

        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()

    def update_FEN(self, game_id, new_FEN):
        mycursor = self.mydb.cursor()

        sql_update = ("""UPDATE Games SET FEN = %s WHERE GameID = %s""")
        data_update = (new_FEN, game_id)
        mycursor.execute(sql_update, data_update)

        self.mydb.commit()
        mycursor.close()

    def get_last_game_FEN(self,user_id):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_find = ("""SELECT Games.FEN FROM Games, Participants
                             WHERE Participants.UserID = %s AND Games.GameID = Participants.GameID
                             ORDER BY Games.GameID DESC
                             LIMIT 1""")

        data_find = (user_id, )
        mycursor.execute(sql_find, data_find)
        last_game_FEN = mycursor.fetchone()
        mycursor.close()

        if last_game_FEN is not None:
            return last_game_FEN['FEN']

        return last_game_FEN

    def update_scores(self, Color, game_id):
        mycursor = self.mydb.cursor()

        sql_update = ("""UPDATE Participants SET Score = 1 WHERE Color = %s AND GameID = %s""")
        if (Color == "W"):
            data_update = ("White", game_id)
            mycursor.execute(sql_update, data_update)
            sql_update = ("""UPDATE Participants SET Score = 0 WHERE Color = %s AND GameID = %s""")
            data_update = ("Black", game_id)
            mycursor.execute(sql_update, data_update)
        elif (Color == "B"):
            data_update = ("Black", game_id)
            mycursor.execute(sql_update, data_update)
            sql_update = ("""UPDATE Participants SET Score = 0 WHERE Color = %s AND GameID = %s""")
            data_update = ("White", game_id)
            mycursor.execute(sql_update, data_update)
        else:
            sql_update = ("""UPDATE Participants SET Score = 0.5 WHERE Color = %s AND GameID = %s""")
            data_update = ("White", game_id)
            mycursor.execute(sql_update, data_update)
            data_update = ("Black", game_id)
            mycursor.execute(sql_update, data_update)

        self.mydb.commit()
        mycursor.close()

    def get_user_recovery_codes_by_id(self, user_id):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_find = ("SELECT Code FROM TwoFaRecoveryCodes WHERE TwoFaRecoveryCodes.userID = %s")

        data_find = (user_id,)
        mycursor.execute(sql_find, data_find)
        user_codes = mycursor.fetchall()
        mycursor.close()
        return user_codes

    def get_user_by_email(self, email):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_find = ("SELECT * FROM Users WHERE Users.Email = %s")

        data_find = (email,)
        mycursor.execute(sql_find, data_find)
        user_data = mycursor.fetchone()

        mycursor.close()
        return user_data

    def get_user(self, data):
        mycursor = self.mydb.cursor(buffered=True, dictionary=True)

        sql_find = ("SELECT * FROM Users WHERE Users.Username = %s OR Users.Email = %s")

        data_find = (data, data)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()

        return result

    def get_user_by_id(self, user_id):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_find = ("SELECT * FROM Users WHERE Users.userID = %s")

        data_find = (user_id,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_participant(self, color, game_id):
        mycursor = self.mydb.cursor()

        if color == 'w' or color == "W":
            color = "White"

        if color == 'b' or color == 'B':
            color = "Black"

        sql_find = ("""SELECT t1.*, Users.Username FROM (SELECT * FROM Participants WHERE Color = %s AND GameID = %s)t1, Users
                               WHERE t1.UserID = Users.UserID""")

        data_find = (color, game_id)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_moves(self, game_id):
        mycursor = self.mydb.cursor()

        sql_find = ("SELECT * FROM Moves WHERE Moves.GameID = %s")

        data_find = (game_id,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_games_two(self, username1, username2):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT t1.* FROM (SELECT Games.*,participants.UserID FROM Games,participants
                       WHERE Participants.UserID = %s AND Games.GameID = participants.GameID)t1
                       INNER JOIN (SELECT Games.*,participants.UserID FROM Games,Participants
                       WHERE Participants.UserID = %s  AND Games.GameID = participants.GameID)t2
                       ON (t1.GameID = t2.GameID);""")

        data_find = (self.get_user(username1)['userID'], self.get_user(username2)['userID'])
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_games(self, user_id, start, end):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_find = ("""SELECT Games.* FROM Games, Participants
                       WHERE Participants.UserID = %s AND Games.GameID = Participants.GameID
                       ORDER BY Games.GameID DESC
                       LIMIT %s,%s""")

        data_find = (user_id, start, end)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_elo_history(self, user_id):
        mycursor = self.mydb.cursor(dictionary=True)

        sql_find = ("""SELECT Games.played, Participants.currELO FROM Games,Participants
                       WHERE Participants.UserID = %s AND Particpants.GameID = Games.GameID""")

        data_find = (self.get_user(user_id)['userID'],)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def count_games(self, user_id, game_mode=-1):
        mycursor = self.mydb.cursor()
        # default count for all games
        if game_mode == -1:
            sql_count = (
                "SELECT COUNT(Games.GameID) FROM Games, Participants WHERE UserID = %s AND Games.GameID = Participants.GameID")
            data_count = (self.get_user_by_id(user_id)['userID'],)
        else:
            sql_count = (
                "SELECT COUNT(Games.GameID) FROM Games, Participants WHERE UserID = %s AND Games.GameMode = %s  AND Games.GameID = Participants.GameID")
            data_count = (self.get_user_by_id(user_id)['userID'], game_mode)

        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()

        return result

    def count_wins(self, user_id, game_mode=-1):
        mycursor = self.mydb.cursor()

        if game_mode == -1:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                                              WHERE UserID = %s AND Games.GameID = Participants.GameID) t1 
                                              WHERE Score = 1;""")
            data_count = (self.get_user_by_id(user_id)['userID'],)
        else:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                               WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID) t1 
                               WHERE Score = 1;""")
            data_count = (self.get_user_by_id(user_id)['userID'], game_mode)

        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_draws(self, user_id, game_mode=-1):
        mycursor = self.mydb.cursor()

        if game_mode == -1:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                                               WHERE UserID = %s AND Games.GameID = Participants.GameID) t1 
                                               WHERE Score = 0.5;""")
            data_count = (self.get_user_by_id(user_id)['userID'],)
        else:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                                WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID) t1 
                                WHERE Score = 0.5;""")
            data_count = (self.get_user_by_id(user_id)['userID'], game_mode)

        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_losses(self, user_id, game_mode=-1):
        mycursor = self.mydb.cursor()

        if game_mode == -1:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                                               WHERE UserID = %s AND Games.GameID = Participants.GameID) t1 
                                               WHERE Score = 0;""")
            data_count = (self.get_user_by_id(user_id)['userID'],)
        else:
            sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                                WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID) t1 
                                WHERE Score = 0;""")
            data_count = (self.get_user_by_id(user_id)['userID'], game_mode)

        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_moves(self, gameID):
        mycursor = self.mydb.cursor()

        sql_count = (
            "SELECT COUNT(Moves.moveID) FROM Games, Moves WHERE Moves.GameID = %s AND Games.GameID = Moves.GameID")

        data_count = (gameID,)
        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_elo_change_in_two_last_games(self, user_id):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT Participants.currELO FROM Games,Participants
                         WHERE Participants.UserID = %s AND Participants.GameID = Games.GameID
                         ORDER BY Games.GameID DESC
                         LIMIT 2""")

        data_find = (user_id,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result


tempDB = ChessDB()
tempDB.create_db()
