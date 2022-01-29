import Board from "./board";
import {Generate_moves, moves} from "./moves";


export function tests() {
    let test_board = new Board()
    test_board.FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    test_board.load_FEN();
    test_board.color_to_move = 'w'
    console.log(test_board.grid)
    Generate_moves(test_board.grid,test_board.check)
    console.log(moves)
}