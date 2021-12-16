import {
    future_moves,
    future_opponent_moves2,
    Generate_moves,
    Generate_opponent_moves, get_white_king_pos, get_black_king_pos,
} from "./moves";
import {board, playingAs, scalar, size} from "./Main"

//   board.color_to_move === 'w' ? ally_king  = get_black_king_pos() : ally_king = get_white_king_pos();

export function simulate_moves_for_ally(grid, ally_moves) {
    let ally_king;
    board.color_to_move === 'b' ? ally_king = get_black_king_pos(board.grid) : ally_king = get_white_king_pos(board.grid);



    let simulation_grid;
    let opponent_king;
    board.color_to_move === 'w' ? opponent_king = get_white_king_pos(board.grid) : opponent_king = get_black_king_pos(board.grid);
    let temp_grid = grid.slice();
    Generate_moves(temp_grid, 0, "future");
    console.log("nowa paczka");
    console.log(future_moves);
    let future_move;
    let temp_move;
    for (let i = 0; i < future_moves.length; i++) {
        let check_flag = 0;
        simulation_grid = simulate_set_grid_by_move(future_moves[i].StartSquare, future_moves[i].EndSquare, temp_grid,future_moves[i].type);
        Generate_opponent_moves(simulation_grid, "future2",);

        console.log(future_opponent_moves2);
        if(board.color_to_move ==='b')
        {
            ally_king = simulate_black_king_pos(simulation_grid);
            opponent_king = simulate_white_king_pos(simulation_grid);
        }else{
            ally_king = simulate_white_king_pos(simulation_grid);
            opponent_king = simulate_black_king_pos(simulation_grid);
        }
        for (let j = 0; j < future_opponent_moves2.length; j++) {
            future_move = future_opponent_moves2[j];

            if (ally_king === future_move.EndSquare && future_move.type !=='n') {
                check_flag = 1;
            }
        }
        if (check_flag === 0) {
            temp_move = future_moves[i];
            if(board.color_to_move===playingAs) ally_moves.push(temp_move);

        }
        check_flag = 0;

    }



    for (let i = 0; i < future_moves.length; i++) {
        simulation_grid = simulate_set_grid_by_move(future_moves[i].StartSquare, future_moves[i].EndSquare, temp_grid,future_moves[i].type);
        Generate_opponent_moves(simulation_grid, "future2",);
        if(board.color_to_move ==='b')
        {
            ally_king = simulate_black_king_pos(simulation_grid);
            opponent_king = simulate_white_king_pos(simulation_grid);
        }else{
            ally_king = simulate_white_king_pos(simulation_grid);
            opponent_king = simulate_black_king_pos(simulation_grid);
        }
        for (let j = 0; j < future_opponent_moves2.length; j++) {
            future_move = future_opponent_moves2[j];
            if (ally_king === future_move.EndSquare && future_move.type !=='n') {
                find_move_in_moves_for_simulation(future_moves[i], ally_moves)
            }
        }

    }

}

function simulate_white_king_pos(grid){
    for(let i=0;i<grid.length;i++)
    {
        if(grid[i].type==='K')
        {
            return i;
        }
    }
}

function simulate_black_king_pos(grid){
    for(let i=0;i<grid.length;i++)
    {
        if(grid[i].type==='k')
        {
            return i;
        }
    }
}


function simulate_get_taken(piece){
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

function simulate_set_grid_by_move(StartingSquare, TargetSquare, old_grid, type) {
    let simulation_grid = old_grid.map(a => ({...a}));


    if (type === 'C') {
    simulate_get_taken(simulation_grid[TargetSquare]);
    }

    let temp = simulation_grid[StartingSquare];
    simulation_grid[StartingSquare] = simulation_grid[TargetSquare];
    simulation_grid[TargetSquare] = temp;

    return simulation_grid;

}

function find_move_in_moves_for_simulation(move, ally_moves) {
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

