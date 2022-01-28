//for gamemode 2
import {board, pixel_positions, placeDefenderPiece, playingAs} from "./Main";
import Piece from "./Piece";
import {store} from "../../../index";
import {setBlackScore, setWhiteScore} from "../../../redux/actions/gameActions";


export let defenderMoves = []

export const points_dict = {
    'k': '0',
    'p': '1',
    'n': '3',
    'b': '3',
    'r': '5',
    'q': '9',
    'K': '0',
    'P': '1',
    'N': '3',
    'B': '3',
    'R': '5',
    'Q': '9'
};

export function add_piece() {
    let added_piece = undefined;

    for (let i = 0; i < board.gameMode2_grid.length; i++) {
        let piece = board.gameMode2_grid[i];
        if (piece.dragging === 1 && piece.type_letter !== 'e' && piece.type_letter !== 'k' && piece.type_letter !== 'K') {
            let Target_Square_position = piece.get_closest_position();
            let TargetSquare = pixel_positions.indexOf(Target_Square_position);
            if (Target_Square_position[0] !== -1 && playingAs === board.color_to_move && Is_On_Good_Square(TargetSquare)) {
                    board.SetupState -= parseInt(points_dict[piece.type_letter], 10);
                    let clonedPiece = new Piece(piece.type_letter, board.p5, 100, 100);
                    clonedPiece.color = piece.color;
                    board.grid[TargetSquare] = clonedPiece;
                    board.set_FEN_from_grid();
                    added_piece = clonedPiece
            }

        }
        if (piece.dragging === 1 && piece.type_letter !== 'e' && board.SetupState === 0) {
            let Target_Square_position = piece.get_closest_position();
            let TargetSquare = pixel_positions.indexOf(Target_Square_position);
            if (Target_Square_position[0] !== -1 && playingAs === board.color_to_move && Is_On_Good_Square(TargetSquare)) {

                let clonedPiece = new Piece(piece.type_letter, board.p5, 100, 100);
                clonedPiece.color = piece.color;
                board.grid[TargetSquare] = clonedPiece;
                board.SetupState = -1;
                board.set_FEN_from_grid();
                added_piece = clonedPiece;
            }


        }
        piece.snap_back();
        piece.dragging = 0;
    }

    if (added_piece) {
        let spent_points = parseInt(points_dict[added_piece.type_letter], 10);
        placeDefenderPiece(board.FEN, spent_points);
        let storeState = store.getState();
        if (playingAs === 'b') {
            store.dispatch(setBlackScore(board.SetupState))
        } else {
            store.dispatch(setWhiteScore(board.SetupState))
        }
        board.change_Turn();
    }

}

function Is_On_Good_Square(TargetSquare) {
    if (board.grid[TargetSquare].type_letter === 'e') {
        if (playingAs === 'b') {
            return TargetSquare < 24;
        } else {
            return TargetSquare > 39;
        }
    } else {
        return false
    }
}

export function generateDefenderMoves(grid){
    defenderMoves = []
        if (playingAs === 'b') {
            for (let i = 0; i < grid.length - 40; i++) {
                if (grid[i].type_letter === 'e') {
                    defenderMoves.push(i)
                }

            }
            console.log(defenderMoves)
        } else {
            for (let i = 40; i < grid.length; i++) {
                if (grid[i].type_letter === 'e') {
                    defenderMoves.push(i)
                }
            }
            console.log(defenderMoves)
        }
}