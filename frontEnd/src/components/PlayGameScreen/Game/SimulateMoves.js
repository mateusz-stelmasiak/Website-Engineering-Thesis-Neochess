import {
    future_moves,
    future_opponent_moves2,
    generateMoves,
    generateOpponentMoves, getWhiteKingPos, getBlackKingPos,
} from "./moves";
import {board, playingAs, scalar, size} from "./Main"

//   board.color_to_move === 'w' ? ally_king  = get_black_king_pos() : ally_king = get_white_king_pos();

export function simulateMovesForAlly(grid, ally_moves) {
    let ally_king;
    board.colorToMove === 'b' ? ally_king = getBlackKingPos(board.grid) : ally_king = getWhiteKingPos(board.grid);


    let simulation_grid;
    let opponent_king;
    board.colorToMove === 'w' ? opponent_king = getWhiteKingPos(board.grid) : opponent_king = getBlackKingPos(board.grid);
    let temp_grid = grid.slice();
    generateMoves(temp_grid, 0, "future");
    let future_move;
    let temp_move;
    for (let i = 0; i < future_moves.length; i++) {
        let check_flag = 0;
        simulation_grid = simulateSetGridByMove(future_moves[i].StartSquare, future_moves[i].EndSquare, temp_grid, future_moves[i].type);
        generateOpponentMoves(simulation_grid, "future2",);
        if (board.colorToMove === 'b') {
            ally_king = simulateBlackKingPos(simulation_grid);
            opponent_king = simulateWhiteKingPos(simulation_grid);
        } else {
            ally_king = simulateWhiteKingPos(simulation_grid);
            opponent_king = simulateBlackKingPos(simulation_grid);
        }
        for (let j = 0; j < future_opponent_moves2.length; j++) {
            future_move = future_opponent_moves2[j];

            if (ally_king === future_move.EndSquare && future_move.type !== 'n') {
                check_flag = 1;
            }
        }
        if (check_flag === 0) {
            temp_move = future_moves[i];
            if (board.colorToMove === playingAs) ally_moves.push(temp_move);

        }
        check_flag = 0;

    }


    for (let i = 0; i < future_moves.length; i++) {
        simulation_grid = simulateSetGridByMove(future_moves[i].StartSquare, future_moves[i].EndSquare, temp_grid, future_moves[i].type);
        generateOpponentMoves(simulation_grid, "future2",);
        if (board.colorToMove === 'b') {
            ally_king = simulateBlackKingPos(simulation_grid);
            opponent_king = simulateWhiteKingPos(simulation_grid);
        } else {
            ally_king = simulateWhiteKingPos(simulation_grid);
            opponent_king = simulateBlackKingPos(simulation_grid);
        }
        for (let j = 0; j < future_opponent_moves2.length; j++) {
            future_move = future_opponent_moves2[j];
            if (ally_king === future_move.EndSquare && future_move.type !== 'n') {
                simulateFindMove(future_moves[i], ally_moves)
            }
        }
    }
}

function simulateWhiteKingPos(grid) {
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].type === 'K') {
            return i;
        }
    }
}

function simulateBlackKingPos(grid) {
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].type === 'k') {
            return i;
        }
    }
}


function simulateGetTaken(piece) {
    piece.did_move = 0;
    piece.color = "none";
    piece.type = 'e'
    piece.type_letter = 'e';
    piece.dragging = false;
    piece.scaled_size = size - scalar;
    piece.possible_moves = [];
    piece.old_x = piece.x;
    piece.old_y = piece.y;
}

function simulateSetGridByMove(StartingSquare, TargetSquare, old_grid, type) {
    let simulation_grid = old_grid.map(a => ({...a}));


    if (type === 'C') {
        simulateGetTaken(simulation_grid[TargetSquare]);
    }

    let temp = simulation_grid[StartingSquare];
    simulation_grid[StartingSquare] = simulation_grid[TargetSquare];
    simulation_grid[TargetSquare] = temp;

    return simulation_grid;

}

function simulateFindMove(move, ally_moves) {
    let flag = 0;
    for (let i = 0; i < ally_moves.length; i++) {
        if (ally_moves[i].EndSquare === move.EndSquare && ally_moves[i].StartSquare === move.StartSquare) {
            flag = 1;
            ally_moves.splice(i, 1);
            i--;
        }
    }
    if (flag === 0) {
        return -1;
    } else {
        return 1;
    }

}

