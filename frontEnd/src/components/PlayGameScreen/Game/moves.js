import {board, gameMode, pixel_positions, playingAs, pos_to_stocknot_dict, sendMoveToServer} from "./Main";
import {simulate_moves_for_ally} from "./SimulateMoves";


export var opponent_moves = [];
export var moves = [];
export var future_opponent_moves = [];
export var future_opponent_moves2 = [];
export var future_moves = [];
export var future_moves2 = [];


class move {
    constructor(starting_square, ending_square, type) {
        this.StartSquare = starting_square;
        this.EndSquare = ending_square;
        this.type = arguments.length === 3 ? type : "n";
        // typy ruchow R - roszada dluga, r - roszada krotka , C - capture, P - pion wysuniety do en passant
        //CP - zbicie przez en passant
    }
}

const Directions = [8, -8, -1, 1, 7, -7, 9, -9]; //down up left right, down left, up left, down right, up right
const Numbers_of_squares_to_edge = [];

export function count_squares_to_edge() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let Up = 7 - j;
            let Down = j;
            let Right = 7 - i;
            let Left = i;

            let matrix_to_index = j * 8 + i;

            Numbers_of_squares_to_edge[matrix_to_index] =
                [Up, Down, Left, Right, Math.min(Up, Left), Math.min(Down, Right), Math.min(Up, Right), Math.min(Down, Left)];
        }

    }

}


export function Generate_moves(grid, check, gtype) {
    let ally_moves = [];

    console.log("playingsas" + playingAs)
    for (let startSquare = 0; startSquare < 64; startSquare++) {
        let p = grid[startSquare];
        if (p.color === board.color_to_move && check === 0 && board.color_to_move === playingAs) { //TODO removed  && board.color_to_move === playingAs for now
            let type = p.type_letter;
            if (type === 'b' || type === 'r' || type === 'q' || type === 'B' || type === 'R' || type === 'Q') {
                Get_long_moves(startSquare, p, grid, ally_moves);
            } else if (type === 'p' || type === 'P') {
                Get_Pawn_moves(startSquare, p, grid, ally_moves);
            } else if (type === 'n' || type === 'N') {
                Get_Knight_moves(startSquare, p, grid, ally_moves);
            }
        }


    }
    for (let startSquare = 0; startSquare < 64; startSquare++) {
        let p = grid[startSquare];
        if (p.color === board.color_to_move) {
            let type = p.type_letter;
            if (type === 'k' || type === 'K') {
                Get_king_moves(startSquare, p, grid, ally_moves);
            }

        }
    }

    if (gtype !== "future" && gtype !== "future2") {
        simulate_moves_for_ally(board.grid, ally_moves);
        // simulate_moves_for_opponent(board.grid,ally_moves);
    }
    if (check === 1 && ally_moves.length === 0) {

        if (check === 1 && ally_moves.length === 0 && board.color_to_move === playingAs) {
            console.log("tu szachmat");
        }


    }
    if (board.check === 1 && ally_moves.length !== 0) {
        board.check = 0;
    }
    if (gtype === "future") {
        future_moves = ally_moves;
    } else if (gtype === "future2") {
        future_moves2 = ally_moves;
    } else {
        moves = ally_moves;
    }
    if (playingAs !== board.color_to_move)
    {
        moves = [];
    }

}


export function Generate_opponent_moves(grid, gtype) { //used for checks
    let topponent_moves = [];

    for (let startSquare = 0; startSquare < 64; startSquare++) {
        let p = grid[startSquare];
        if (p.color !== board.color_to_move) {
            let type = p.type_letter;
            if (type === 'b' || type === 'r' || type === 'q' || type === 'B' || type === 'R' || type === 'Q') {
                Get_long_moves(startSquare, p, grid, topponent_moves);
            } else if (type === 'p' || type === 'P') {
                Get_Pawn_moves(startSquare, p, grid, topponent_moves);
            } else if (type === 'k' || type === 'K') {
                Get_king_moves(startSquare, p, grid, topponent_moves);
            } else if (type === 'n' || type === 'N') {
                Get_Knight_moves(startSquare, p, grid, topponent_moves);
            }
        }

    }
    if (gtype === "future") {
        future_opponent_moves = topponent_moves;
    } else if (gtype === "future2") {
        future_opponent_moves2 = topponent_moves;
    } else {
        opponent_moves = topponent_moves;
    }
}


function Get_Pawn_moves(startSquare, piece, grid, t_moves) {
    let Squares_to_end = Numbers_of_squares_to_edge[startSquare][0];
    //TODO can go up to tak naprawde ile jeest do konca krawedzi squarow muszE to zmienic xD
    piece.color === 'w' ? Squares_to_end = Numbers_of_squares_to_edge[startSquare][1] : Squares_to_end = Numbers_of_squares_to_edge[startSquare][0];
    let Target = 0;
    if (Squares_to_end > 1 && piece.did_move === 0) {
        for (let i = 0; i < 2; i++) {
            piece.color === 'w' ? Target = startSquare + Directions[1] * (i + 1) : Target = startSquare + Directions[0] * (i + 1)
            let Piece_on_Target = grid[Target];
            if (Piece_on_Target.type_letter !== 'e') {
                break;
            } else {
                if (i === 0) {
                    t_moves.push(new move(startSquare, Target));
                } else {
                    t_moves.push(new move(startSquare, Target, 'P'));
                }

            }

        }
    } else if (Squares_to_end > 0 && piece.did_move === 1) {
        piece.color === 'w' ? Target = startSquare + Directions[1] : Target = startSquare + Directions[0];
        let Piece_on_Target = grid[Target];
        if (Piece_on_Target.type_letter === 'e') {
            t_moves.push(new move(startSquare, Target));
        }
    }


//5 i 7
    //EN PASSEANT
    if (board.lastmove.type === 'P') {
        let Target = board.lastmove.EndSquare;
        let numbers_to_edge;        //TODO napraw zeby nie dalo sie bić z rogów planszy XD
        piece.color === 'w' ? numbers_to_edge = Numbers_of_squares_to_edge[startSquare][2] : numbers_to_edge = Numbers_of_squares_to_edge[startSquare][3];
        if (Math.abs(startSquare - Target) === 1) {
            piece.color === 'w' ? Target = Target + Directions[1] : Target = Target + Directions[0];
            t_moves.push(new move(startSquare, Target, 'CP'));
        }
    }


    //bicie pionow oponenta
    if (Squares_to_end > 0) {
        piece.color === 'w' ? Target = startSquare + Directions[5] : Target = startSquare + Directions[4];
        let Piece_on_Target = grid[Target];

        if (Piece_on_Target.type_letter !== 'e' && Piece_on_Target.color !== piece.color && Numbers_of_squares_to_edge[startSquare][2] > 0) {

            t_moves.push(new move(startSquare, Target, 'C'));

        }
        piece.color === 'w' ? Target = startSquare + Directions[7] : Target = startSquare + Directions[6];
        Piece_on_Target = grid[Target];
        if (Piece_on_Target.type_letter !== 'e' && Piece_on_Target.color !== piece.color && Numbers_of_squares_to_edge[startSquare][3] > 0) {

            t_moves.push(new move(startSquare, Target, 'C'));

        }
    }


}


function check_if_promotion(piece, targetsquare) {
    let is_on_last_square;
    piece.color === 'w' ? is_on_last_square = Numbers_of_squares_to_edge[targetsquare][1] : is_on_last_square = Numbers_of_squares_to_edge[targetsquare][0];

    if (is_on_last_square === 0) {
        if (piece.color === 'w') {
            piece.type = 'Q';
            piece.type_letter = 'Q';
        } else {
            piece.type = 'q';
            piece.type_letter = 'q';
        }
    }
}

function is_square_save(targetSquare) {
    for (let i = 0; i < opponent_moves.length; i++) {
        if (opponent_moves[i]['EndSquare'] === targetSquare && opponent_moves[i].type !== 'n') {
            return -1
        }
    }
    return 1
}

function Get_king_moves(startSquare, piece, grid, t_moves) {
    //TODO
    //Jak juz bede mial all to musze sprawdzac czy krol nie chce sie ruszyc na czyjes miejsce
    for (let i = 0; i < Directions.length; i++) {
        if (Numbers_of_squares_to_edge[startSquare][i] > 0) {
            let Target = startSquare + Directions[i];
            let Piece_on_Target = grid[Target];
            if (!(Piece_on_Target.type_letter !== 'e' && Piece_on_Target.color === piece.color)) {
                if (is_square_save(Target) === 1) {

                    t_moves.push(new move(startSquare, Target));

                    if (Piece_on_Target.color !== piece.color && Piece_on_Target.type_letter !== 'e') {

                        t_moves[t_moves.length - 1].type = 'C';

                    }
                }
            }
        }
    }


    if (piece.did_move === 0) {
        let target = startSquare + Directions[3] * 3;
        let Piece_on_Target = grid[target];
        if (Piece_on_Target!=undefined && Piece_on_Target.type_letter !== 'e' && Piece_on_Target.did_move === 0) {
            //roszada krótka
            if (grid[startSquare + Directions[3] * 2].type_letter === 'e' && grid[startSquare + Directions[3]].type_letter === 'e')

                t_moves.push(new move(startSquare, target - 1, 'r'));

        }

        //roszada dluga

        target = startSquare + Directions[2] * 4;
        Piece_on_Target = grid[target];
        if (Piece_on_Target!=undefined && Piece_on_Target.type_letter !== 'e' && Piece_on_Target.did_move === 0) {
            if (grid[startSquare + Directions[2] * 2].type_letter === 'e' && grid[startSquare + Directions[2]].type_letter === 'e'
                && grid[startSquare + Directions[2] * 3].type_letter === 'e') {

                t_moves.push(new move(startSquare, target + 2, 'R'));

            }
        }


    }
    //

}


function Get_Knight_moves(startSquare, piece, grid, t_moves) {
    //TODO
    //to mozna skrocic forem, ale trzeba dac te *2+1 *2-1 etc do jakiegos dictonary i tez iterowac zzz dodaj tutaj tez move type C jak bedzie bicie, ale to jak juz zrobisz for
    if (Numbers_of_squares_to_edge[startSquare][0] > 1 && Numbers_of_squares_to_edge[startSquare][3] > 0) {
        let Target = startSquare + Directions[0] * 2 + 1;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));

            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';


            }

        }
    }

    if (Numbers_of_squares_to_edge[startSquare][0] > 1 && Numbers_of_squares_to_edge[startSquare][2] > 0) {
        let Target = startSquare + Directions[0] * 2 - 1;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));

            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';

            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][0] > 0 && Numbers_of_squares_to_edge[startSquare][3] > 1) {
        let Target = startSquare + Directions[0] + 2;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';

            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][0] > 0 && Numbers_of_squares_to_edge[startSquare][2] > 1) {
        let Target = startSquare + Directions[0] - 2;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';


            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][1] > 1 && Numbers_of_squares_to_edge[startSquare][3] > 0) {
        let Target = startSquare + Directions[1] * 2 + 1;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';


            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][1] > 1 && Numbers_of_squares_to_edge[startSquare][2] > 0) {
        let Target = startSquare + Directions[1] * 2 - 1;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';

            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][1] > 0 && Numbers_of_squares_to_edge[startSquare][2] > 1) {
        let Target = startSquare + Directions[1] - 2;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';

            }
        }
    }

    if (Numbers_of_squares_to_edge[startSquare][1] > 0 && Numbers_of_squares_to_edge[startSquare][3] > 1) {
        let Target = startSquare + Directions[1] + 2;
        let Piece_on_target = grid[Target];
        if (!(Piece_on_target.type_letter !== 'e' && Piece_on_target.color === piece.color)) {

            t_moves.push(new move(startSquare, Target));


            if (Piece_on_target.type_letter !== 'e' && Piece_on_target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';


            }
        }
    }
}


function Get_long_moves(startSquare, piece, grid, t_moves) {
    let Start = 0;
    let End = 8;
    if (piece.type_letter === 'b' || piece.type_letter === 'B') {
        Start = 4;
    } else if (piece.type_letter === 'R' || piece.type_letter === 'r') {
        End = 4;
    }

    for (let i = Start; i < End; i++) {
        // Loop we wszystkie kierunki i przez wszystkie mozliwe pola aż do krawędzi lub napotkania oponenta
        for (let j = 0; j < Numbers_of_squares_to_edge[startSquare][i]; j++) {
            let Target = startSquare + Directions[i] * (j + 1);  // poruszanie sie o offset (taki fajny myk na 1d tablicy)
            let Piece_on_Target = grid[Target];

            //zablokowany przez zioma:
            if (Piece_on_Target.type_letter !== 'e' && Piece_on_Target.color === piece.color) {
                break;
            }

            t_moves.push(new move(startSquare, Target));


            //przez oponenta
            if (Piece_on_Target.type_letter !== 'e' && Piece_on_Target.color !== piece.color) {

                t_moves[t_moves.length - 1].type = 'C';


                break;
            }
        }
    }
}

function get_move(StartSquare, TargetSquare) {
    for (let i = 0; i < moves.length; i++) {
        if (moves[i].StartSquare === StartSquare && moves[i].EndSquare === TargetSquare) {
            return moves[i];
        }
    }
    return board.lastmove;
}

function check_move(StartSquare, TargetSquare) {
    for (let i = 0; i < moves.length; i++) {
        if (moves[i].StartSquare === StartSquare && moves[i].EndSquare === TargetSquare) {
            return moves[i];
        }
    }
    return -1;
}

export function get_pixel_position_from_pixel_positon_array(pos) { //thanks javascript
    let position;
    for (let i = 0; i < pixel_positions.length; i++) {
        if (pos[0] === pixel_positions[i][0] && pos[1] === pixel_positions[i][1]) {
            position = pixel_positions[i]
            break;
        }
    }
    return position
}

export function Distance_between_points(x1, y1, x2, y2) {
    let y = x2 - x1;
    let x = y2 - y1;

    return Math.sqrt(x * x + y * y);
}

export function check_if_check() {

    let enemyKingPos;

    board.color_to_move === 'w' ? enemyKingPos = get_white_king_pos(board.grid) : enemyKingPos = get_black_king_pos(board.grid);


    for (let i = 0; i < opponent_moves.length; i++) {
        if (enemyKingPos === opponent_moves[i]['EndSquare']) {
            board.check = 1;
        }
    }


}


export function make_opponents_move(StartingSquare, TargetSquare, mType) {
    let piece = board.grid[StartingSquare];

    if (board.color_to_move === 'b') {
        board.numOfMoves += 1;
    }
    board.lastPawnMoveOrCapture += 1;
    if (mType === 'P') {
        let EP_target2;
        piece.color === 'w' ? EP_target2 = TargetSquare + Directions[0] : EP_target2 = TargetSquare + Directions[1];
        board.enPassant = pos_to_stocknot_dict[EP_target2];
    } else {
        board.enPassant = '-';
    }
    //TODO zbijanko + moze case z tego zrob
    if (mType === 'R' || mType === 'r') {
        let Target;
        let rook_pos;
        mType === 'r' ? Target = StartingSquare + 2 : Target = StartingSquare - 2;
        board.change_Turn();

        board.set_FEN_by_move(StartingSquare, Target, true); //przenies krola
        piece.snap();

        mType === 'r' ? rook_pos = StartingSquare + 3 : rook_pos = StartingSquare - 4;
        mType === 'r' ? Target = rook_pos - 2 : Target = rook_pos + 3;
        board.set_FEN_by_move(rook_pos, Target, true); // przenies  wieze

        board.grid[Target].did_move = 1;
        board.grid[Target].snap_back();

    } else {
        if (mType === 'C') {
            board.lastPawnMoveOrCapture = 0;
            board.grid[TargetSquare].get_taken();
        } else if (mType === 'CP') {
            let EP_target;
            piece.color === 'w' ? EP_target = TargetSquare + Directions[0] : EP_target = TargetSquare + Directions[1];
            board.grid[EP_target].get_taken();
            board.lastPawnMoveOrCapture = 0;

        }

        if (piece.type_letter === 'p' || piece.type_letter === 'P') {
            check_if_promotion(piece, TargetSquare);
            board.lastPawnMoveOrCapture = 0;
        }
        //kolejnosc wazna

        board.set_FEN_by_move(StartingSquare, TargetSquare, true);
        console.log(board.FEN);
        piece.snap_back();
    }
    piece.did_move = 1;
    moves = [];
    opponent_moves = [];
    board.lastmove = new move(StartingSquare, TargetSquare, mType);
    Generate_opponent_moves(board.grid);
    check_if_check();
    Generate_moves(board.grid, board.check, "after_opponent");
}

export function generate_pos_to_stocknot_dict() {
    let board_letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    let a;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let cur_letter = board_letters[j]
            a = 8 - i;
            pos_to_stocknot_dict[i * 8 + j] = cur_letter + a.toString();
        }
    }

}



export function make_a_move() {
    for (let i = 0; i < board.grid.length; i++) {
        let piece = board.grid[i];
        if (piece.dragging === 1 && piece.type_letter !== 'e') {
            let Target_Square_position = piece.get_closest_position();
            let Starting_Square_position = [piece.old_x, piece.old_y]

            let StartingSquare = pixel_positions.indexOf(get_pixel_position_from_pixel_positon_array(Starting_Square_position)); //TODO optymalizacja robie to drugi raz w set fen by move!!!
            let TargetSquare = pixel_positions.indexOf(Target_Square_position);

            if (Target_Square_position[0] !== Starting_Square_position[0] || Target_Square_position[1] !== Starting_Square_position[1]) {
                let move = check_move(StartingSquare, TargetSquare);
                if (move !== -1) {
                    board.lastmove = get_move(StartingSquare, TargetSquare); //fix
                    if (board.color_to_move === 'b') {
                        board.numOfMoves += 1;
                    }
                    board.lastPawnMoveOrCapture += 1;
                    //TODO zbijanko + moze case z tego zrob
                    if (move.type === 'P') {
                        let EP_target2;
                        piece.color === 'w' ? EP_target2 = TargetSquare + Directions[0] : EP_target2 = TargetSquare + Directions[1];
                        board.enPassant = pos_to_stocknot_dict[EP_target2];
                    } else {
                        board.enPassant = '-';
                    }

                    if (move.type === 'R' || move.type === 'r') {
                        let Target;
                        let rook_pos;
                        move.type === 'r' ? Target = StartingSquare + 2 : Target = StartingSquare - 2;
                        board.change_Turn();

                        board.set_FEN_by_move(StartingSquare, Target, true); //przenies krola
                        piece.snap();

                        move.type === 'r' ? rook_pos = StartingSquare + 3 : rook_pos = StartingSquare - 4;
                        move.type === 'r' ? Target = rook_pos - 2 : Target = rook_pos + 3;
                        board.set_FEN_by_move(rook_pos, Target, true); // przenies  wieze

                        board.grid[Target].did_move = 1;
                        board.grid[Target].snap_back();


                    } else {
                        if (move.type === 'C') {
                            board.lastPawnMoveOrCapture = 0;
                            board.grid[TargetSquare].get_taken();
                        } else if (move.type === 'CP') {
                            let EP_target;
                            piece.color === 'w' ? EP_target = TargetSquare + Directions[0] : EP_target = TargetSquare + Directions[1];
                            board.grid[EP_target].get_taken();
                            board.lastPawnMoveOrCapture = 0;

                        }

                        if (piece.type_letter === 'p' || piece.type_letter === 'P') {
                            check_if_promotion(piece, TargetSquare);
                            board.lastPawnMoveOrCapture = 0;
                        }
                        //kolejnosc wazna
                        console.log(move);
                        board.set_FEN_by_move(StartingSquare, TargetSquare, true);
                        console.log(board.FEN);

                        piece.snap();
                    }
                    piece.did_move = 1;
                    moves = [];
                    opponent_moves = [];

                    if(gameMode!==1 || board.SetupState===-1){
                        let data = {
                            'startingSquare': StartingSquare,
                            'targetSquare': TargetSquare,
                            'mtype': move.type
                        }
                        sendMoveToServer(data, board.FEN);
                    }


                } else {
                    piece.snap_back();
                }
            } else {
                piece.snap();
            }
            piece.dragging = 0;


        }
    }
}

export function get_white_king_pos() {
    for (let i = 0; i < board.grid.length; i++) {
        if (board.grid[i].type_letter === 'K') {
            return board.grid[i].get_grid_pos()
        }
    }
    return -1;
}

export function get_black_king_pos(gride) {
    for (let i = 0; i < gride.length; i++) {
        if (gride[i].type_letter === 'k') {
            return gride[i].get_grid_pos()
        }
    }
    return -1;
}