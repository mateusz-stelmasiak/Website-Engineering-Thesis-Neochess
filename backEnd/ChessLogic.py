import chess
import chess.engine

board = chess.Board()
#engine = chess.engine.SimpleEngine.popen_uci("./StockFish/stockfish_13_win.exe")
#LINUX VESION
engine = chess.engine.SimpleEngine.popen_uci("./StockFish/stockfish_13_linux")
limit = chess.engine.Limit(time=2.0)


def generate_pos_to_stocknot_dict():
    board_letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    pos_to_stocknot_dict = {}
    for i in range(0, 8):
        for j in range(0, 8):
            cur_letter = board_letters[j]
            pos_to_stocknot_dict[i * 8 + j] = cur_letter + str(8 - i)

    return pos_to_stocknot_dict


pos_to_stocknot_dict = generate_pos_to_stocknot_dict()


def convert_pos_to_stockfish_notation(pos):
    if pos not in pos_to_stocknot_dict:
        return False

    return pos_to_stocknot_dict[pos]


def convert_stockfish_notation_to_pos(stock_move):
    start = stock_move[0:2]
    target = stock_move[2:4]
    start_pos = -1
    end_pos = -1
    for pos, stock in pos_to_stocknot_dict.copy().items():
        if stock == start:
            start_pos = pos
        if stock == target:
            end_pos = pos

    return start_pos, end_pos


# returns new fen if valid
def is_valid_move(FEN, startSquare, targetSquare):
    board.set_fen(FEN)
    stockfish_move = convert_pos_to_stockfish_notation(startSquare) + convert_pos_to_stockfish_notation(targetSquare)
    board_move = chess.Move.from_uci(stockfish_move)
    print(board.legal_moves)
    return chess.Move.from_uci(stockfish_move) in board.legal_moves, board_move


def is_checkmate(FEN):
    board.set_fen(FEN)
    return board.is_checkmate()


def update_fen_with_turn_info(FEN, player_to_move):
    separator = ' '
    split_fen = FEN.split(separator)
    split_fen[1] = player_to_move
    return separator.join(split_fen)


def update_FEN_by_AN_move(old_FEN, move):
    board.set_fen(old_FEN)
    board.push(move)
    return board.fen()


def get_best_move(FEN):
    board.set_fen(FEN)
    result = engine.play(board, limit)
    board_move = result.move
    moving_piece_type = board.piece_type_at(board_move.from_square)
    board.push(result.move)

    move_type = "n"
    if board.is_en_passant(board_move): move_type = "CP"
    if board.is_capture(board_move): move_type = "C"
    if board.is_kingside_castling(board_move): move_type = "r"
    if board.is_queenside_castling(board_move): move_type = "R"
    # check for P TYPE, moved to enpassant
    if moving_piece_type == 1 and abs(board_move.to_square - board_move.from_square) == 16:
        move_type = "P"

    start_move = (63 - board_move.from_square) % 64
    target_move = (63 - board_move.to_square) % 64

    move = {
        'startingSquare': start_move,
        'targetSquare': target_move,
        'mtype': move_type
    }

    return board.fen(), move


