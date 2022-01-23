from datetime import date
import mysql.connector
import RatingSystem

# to account for time difference due to timezones (in hh:mm:ss)
server_time_difference = '02:00:00'


class ChessDB:

    def __init__(self):
        # self.mydb = mysql.connector.connect(host="localhost", user="root", password="Pudzian123", database="ChessDB1")
        self.mydb = mysql.connector.connect(host="serwer1305496.home.pl", user="13748919_neochess",
                                            password="YhuuFd6Z",
                                            database="13748919_neochess")

    def __del__(self):
        self.mydb.close()

    def create_db(self):
        mycursor = self.mydb.cursor()

        mycursor.execute('''create table if not exists Games
                             (GameID integer primary key AUTO_INCREMENT, 
                             win_type varchar(100), 
                             played DATETIME,
                             GameMode int not null DEFAULT 0);''')

        mycursor.execute('''create table if not exists Users
                            (userID integer primary key AUTO_INCREMENT,
                            Username varchar(64) unique not null, 
                            Password varchar(64) not null, 
                            Country varchar(64), 
                            Joined DATE not null,
                            ELO int not null DEFAULT ''' + str(RatingSystem.starting_ELO) + ''', 
                            ELODeviation int not null DEFAULT ''' + str(RatingSystem.starting_ELO_deviation) + ''',
                            ELOVolatility FLOAT not null DEFAULT ''' + str(
            RatingSystem.starting_ELO_volatility) + ''' );''')

        mycursor.execute('''CREATE table if not exists Participants
                            (ParticipantID integer primary key AUTO_INCREMENT, 
                            GameID INTEGER  not null,
                            UserID Integer not null,
                            Foreign key (GameID) references  Games(GameID) on delete cascade,
                            Foreign key (UserID) references  Users(UserID) on delete cascade, 
                            Score FLOAT not null, 
                            Color varchar(32) not null,
                            currELO int not null);''')

        mycursor.execute('''create table if not exists Moves
                            (MoveID integer primary key AUTO_INCREMENT,
                            GameID INTEGER  not null,
                            ParticipantID INTEGER  not null,
                            Foreign key (GameID) references  Games(GameID) on delete cascade,
                            Foreign key (ParticipantID) references Participants(ParticipantID) on delete cascade, 
                            move_order integer not null, 
                            Move varchar(100) not null);''')

        mycursor.close()

    def get_curr_date_time(self):
        mycursor = self.mydb.cursor()
        date = "SELECT ADDTIME(CURRENT_TIMESTAMP(), '" + server_time_difference + "') AS Today"
        mycursor.execute(date)

        return mycursor.fetchone()[0]

    def get_curr_date(self):
        mycursor = self.mydb.cursor()
        date = "SELECT CURRENT_DATE() AS Today"
        mycursor.execute(date)

        return mycursor.fetchone()[0]

    def add_user(self, Username, Password, Country, Elo, ELO_dv, ELO_v):
        mycursor = self.mydb.cursor()

        sql_user = ("INSERT INTO Users "
                    "(Username, Password, Country, Joined, ELO,ELODeviation,ELOVolatility) "
                    "VALUES (%s, %s, %s, %s, %s,%s,%s)")

        date = self.get_curr_date()
        data_user = (Username, Password, Country, date, Elo, ELO_dv, ELO_v)
        mycursor.execute(sql_user, data_user)
        self.mydb.commit()
        mycursor.close()

    # gdzie moves to lista list gdzie move = (Color, move_order, move)
    def add_game(self, w_id, w_score, b_id, b_score, win_type, moves, game_mode_id):
        mycursor = self.mydb.cursor()

        sql_game = ("INSERT INTO Games "
                    "(win_type, played,GameMode) "
                    "VALUES (%s, %s,%s)")

        date = self.get_curr_date_time()
        data_game = (win_type, date, game_mode_id)
        mycursor.execute(sql_game, data_game)
        game_id = mycursor.lastrowid

        sql_participant = ("INSERT INTO Participants"
                           "(GameID, UserID, Score, Color, currELO)"
                           "VALUES(%s, %s, %s, %s, %s)")

        white_user = self.get_user_by_id(w_id)
        black_user = self.get_user_by_id(b_id)

        data_participant = (game_id, white_user[0], w_score, "White", white_user[5])
        mycursor.execute(sql_participant, data_participant)
        data_participant = (game_id, black_user[0], b_score, "Black", black_user[5])
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
        ELO_change = ELO_before - new_ELO

        sql_update = ("""UPDATE Users SET ELO = %s,ELODeviation = %s,ELOVolatility =%s WHERE UserID = %s""")
        data_update = (new_ELO, new_ELO_dv, new_ELO_v, user_id)
        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()

        return ELO_change

    def update_password(self, new_password, Username):
        mycursor = self.mydb.cursor()

        sql_update = ("""UPDATE Users SET Password = %s WHERE UserID = %s""")

        data_update = (new_password, self.get_user(Username)[0])
        mycursor.execute(sql_update, data_update)
        self.mydb.commit()
        mycursor.close()

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

    def get_user(self, Username):
        mycursor = self.mydb.cursor()

        sql_find = ("SELECT * FROM Users WHERE Users.Username = %s")

        data_find = (Username,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_user_by_id(self, userId):
        mycursor = self.mydb.cursor()

        sql_find = ("SELECT * FROM Users WHERE Users.userID = %s")

        data_find = (userId,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_participant(self, Color, GameID):
        mycursor = self.mydb.cursor()

        if Color == 'w' or Color == "W":
            Color = "White"

        if Color == 'b' or Color == 'B':
            Color = "Black"

        sql_find = ("""SELECT t1.*, Users.Username FROM (SELECT * FROM Participants WHERE Color = %s AND GameID = %s)t1, Users
                               WHERE t1.UserID = Users.UserID""")

        data_find = (Color, GameID)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def get_moves(self, GameID):
        mycursor = self.mydb.cursor()

        sql_find = ("SELECT * FROM Moves WHERE Moves.GameID = %s")

        data_find = (GameID,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_games_two(self, Username1, Username2):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT t1.* FROM (SELECT Games.*,participants.UserID FROM Games,participants
                       WHERE Participants.UserID = %s AND Games.GameID = participants.GameID)t1
                       INNER JOIN (SELECT Games.*,participants.UserID FROM Games,Participants
                       WHERE Participants.UserID = %s  AND Games.GameID = participants.GameID)t2
                       ON (t1.GameID = t2.GameID);""")

        data_find = (self.get_user(Username1)[0], self.get_user(Username2)[0])
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_games(self, UserID, Start, End):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT Games.* FROM Games, Participants
                       WHERE Participants.UserID = %s AND Games.GameID = Participants.GameID
                       ORDER BY Games.GameID DESC
                       LIMIT %s,%s""")

        data_find = (UserID, Start, End)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def get_EloHistory(self, Username):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT Games.played, Participants.currELO FROM Games,Participants
                       WHERE Participants.UserID = %s AND Particpants.GameID = Games.GameID""")

        data_find = (self.get_user(Username)[0],)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result

    def count_games(self, user_id, game_mode=0):
        mycursor = self.mydb.cursor()

        sql_count = (
            "SELECT COUNT(Games.GameID) FROM Games, Participants WHERE UserID = %s AND Games.GameMode = %s  AND Games.GameID = Participants.GameID")

        data_count = (self.get_user_by_id(user_id)[0], game_mode)
        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_wins(self, user_id, game_mode=0):
        mycursor = self.mydb.cursor()

        sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                        WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID) t1 
                        WHERE Score = 1;""")

        data_count = (self.get_user_by_id(user_id)[0], game_mode)
        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_draws(self, user_id, game_mode=0):
        mycursor = self.mydb.cursor()

        sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID,Score FROM Games, Participants
                     WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID)t1
                     WHERE Score = 0.5""")

        data_count = (self.get_user_by_id(user_id)[0], game_mode)
        mycursor.execute(sql_count, data_count)
        result = mycursor.fetchone()
        mycursor.close()
        return result

    def count_losses(self, user_id, game_mode=0):
        mycursor = self.mydb.cursor()

        sql_count = ("""SELECT COUNT(t1.GameID) FROM (SELECT Games.GameID, Score FROM Games, Participants 
                         WHERE UserID = %s AND Games.GameMode = %s AND Games.GameID = Participants.GameID)t1
                         WHERE Score = 0""")

        data_count = (self.get_user_by_id(user_id)[0], game_mode)
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

    def get_ELO_change_in_two_last_games(self, userId):
        mycursor = self.mydb.cursor()

        sql_find = ("""SELECT Participants.currELO FROM Games,Participants
                         WHERE Participants.UserID = %s AND Participants.GameID = Games.GameID
                         ORDER BY Games.GameID DESC
                         LIMIT 2""")

        data_find = (userId,)
        mycursor.execute(sql_find, data_find)
        result = mycursor.fetchall()
        mycursor.close()
        return result


tempDB = ChessDB()
tempDB.create_db()
# print(tempDB.count_losses("PainTrain"))
