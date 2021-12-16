import {
    board,
    pixel_positions,
    size,
    playingAs,
    canvas_height,
    canvas_width,
    rows,
    cols,
    Checkboard,
    Checkboard_size,
    pieces_dict,
    myFont,
    Font,
    textures,
    scalar,
    shelf_size, gameMode2_Margin, textsize, gameMode, currentTurn,
} from "./Main";
import Piece from "./Piece";
import {check_if_check, Generate_moves, Generate_opponent_moves, moves} from "./moves";
import CSquare from "./CSquare";
import {forEach} from "react-bootstrap/ElementChildren";


export const default_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
export const default_FEN_Gamemode_2 = "8/8/8/8/8/8/8/8 w - - 0 1";
export default class Board {

    constructor(p5) {
        this.p5 = p5;
        this.grid = [];
        for (let i = 0; i < 64; i++) {
            this.grid.push(new Piece("e", this.p5));
        }

        this.gameMode2_grid = [];
        let i = 0;


        for (var key in pieces_dict) {
            i += 1;
            if (playingAs === 'b') {
                this.gameMode2_grid.push(new Piece(pieces_dict[key], this.p5, Checkboard_size + shelf_size / 2 - size * 0.666, gameMode2_Margin * size * i));
            } else {
                this.gameMode2_grid.push(new Piece(pieces_dict[key].toUpperCase(), this.p5, Checkboard_size + shelf_size / 2 - size * 0.666, gameMode2_Margin * size * i));//dont ask why 0.666
                this.gameMode2_grid[this.gameMode2_grid.length - 1].color = 'w'; //TODO w konstrukotrze koloru nie da sie podac XD
            }

        }
        this.FEN = "";
        this.load_FEN()
        this.color_to_move = "";
        this.lastPawnMoveOrCapture = 0;
        this.lastmove = [-1, -1];
        this.numOfMoves = 1;
        this.check = 0;
        this.enPassant = "-";
        this.SetupState = 0;
        this.waveFunction=0; //used for calculating wave animation timing
    }


    get_pos(i, j) {
        let x;
        let y;
        if (playingAs === 'b') {
            x = Checkboard_size - size - i * size;
            y = Checkboard_size - size - j * size;
        } else {
            x = i * size;
            y = j * size;
        }

        return [x, y]
    }

    set_FEN(FEN) {
        this.FEN = FEN;
    }

    set_FEN_from_grid() {
        let empty_spaces = 0;
        let temp_fen = "";
        for (let i = 0; i < board.grid.length; i++) {
            if (i % 8 === 0 && i !== 0) {
                if (empty_spaces !== 0) {
                    temp_fen += empty_spaces.toString();
                    empty_spaces = 0;
                }
                temp_fen += '/';
            }
            if (board.grid[i].type_letter !== 'e') {
                if (empty_spaces !== 0) {
                    temp_fen += empty_spaces.toString();
                    empty_spaces = 0;
                }
                temp_fen += board.grid[i].type_letter;
            } else {
                empty_spaces++;
            }

        }
        if (empty_spaces !== 0) {
            temp_fen += empty_spaces.toString();
            empty_spaces = 0;
        }

        //TODO
        //sprawdzic czy król sie juz ruszył i wieza czy sie da roszade zrobic i wtedy dopisać ją do fena, tak samo który jest teraz ruch
        //split 2 - roszady
        //split 3 - en passant
        temp_fen += " " + this.color_to_move + " " + this.FEN.split(' ')[2] + " " + this.enPassant + " " + this.lastPawnMoveOrCapture + " " + this.numOfMoves;
        this.FEN = temp_fen;
        console.log("AAAAA " + temp_fen);
        this.load_FEN();
    }

    set_FEN_by_move(StartingSquare, TargetSquare) {


        let temp = board.grid[StartingSquare];
        board.grid[StartingSquare] = board.grid[TargetSquare];
        board.grid[TargetSquare] = temp;
        board.grid[TargetSquare].old_x = pixel_positions[TargetSquare][0];
        board.grid[TargetSquare].old_y = pixel_positions[TargetSquare][1];


        board.change_Turn();
        //print_board2();
        this.set_FEN_from_grid()
    }

    //does the same thing as set_FEN_by_move but also generates moves
    set_FEN_by_rejected_move(StartingSquare, TargetSquare) {
        //TODO highlight rejected position


        let temp = board.grid[StartingSquare];
        board.grid[StartingSquare] = board.grid[TargetSquare];
        board.grid[TargetSquare] = temp;
        board.grid[TargetSquare].old_x = pixel_positions[TargetSquare][0];
        board.grid[TargetSquare].old_y = pixel_positions[TargetSquare][1];

        console.log(board.color_to_move)
        board.change_Turn();
        Generate_opponent_moves(board.grid);
        Generate_moves(board.grid, board.check, "after_opponent");
        //print_board2();
        this.set_FEN_from_grid()
    }

    load_FEN() {
        let split_FEN = this.FEN.split(' ')
        this.color_to_move = split_FEN[1];   //setting color to move from fen
        for (let i = 0; i < 64; i++) {
            this.grid[i] = (new Piece("e", this.p5));
        }

        let fenBoard = split_FEN[0];   // taking only pieces position (FEN.split[0]), discarding game info
        let file = 0;
        let rank = 0;
        for (var i = 0; i < fenBoard.length; i++) {
            let e = fenBoard[i];
            if (e === '/') {
                rank = 0;
                file++;
            } else {
                if (Number.isInteger(Number(e))) {
                    rank += Number(e);
                } else {
                    let temp = this.get_pos(rank, file);
                    this.grid[file * 8 + rank].type = e;
                    this.grid[file * 8 + rank].type_letter = e;
                    e === e.toUpperCase() ? this.grid[file * 8 + rank].color = 'w' : this.grid[file * 8 + rank].color = 'b';
                    this.grid[file * 8 + rank].x = temp[0];
                    this.grid[file * 8 + rank].y = temp[1];
                    this.grid[file * 8 + rank].old_x = temp[0];
                    this.grid[file * 8 + rank].old_y = temp[1];
                    if ((file === 6 && this.grid[file * 8 + rank].color === 'w')||(file === 1 && this.grid[file * 8 + rank].color === 'b')) {
                        this.grid[file * 8 + rank].did_move = 0;
                    }else{
                        this.grid[file * 8 + rank].did_move = 1;
                    }
                    rank++;
                }
            }
        }

    }

    //signals to the player which side of the board he's operating
    highlightBoardSide(side,highlight_color){
        let modifier=0; //decides which side is being drawn, start drawing on sqr 0 for black, sqr 32 for white
        if (side==='w'){ modifier=32;}
        for (let i = modifier; i < board.grid.length-(modifier+board.grid.length/2)%board.grid.length  ; i++) {
            let highlight = pixel_positions[i];
            this.p5.push()
            this.p5.noStroke();
            this.p5.translate(5,5)
            let squareColor = this.p5.color(highlight_color.r, highlight_color.g, highlight_color.b);
            squareColor.setAlpha(48);
            this.p5.fill(squareColor);
            this.p5.rect(highlight[0], highlight[1], size-10, size-10);
            this.p5.pop();

        }
    }

    highlightAroundPieces(side,highlight_color){
        for (let k = 0; k < this.grid.length; k++) {
            let piece = this.grid[k];
            if (piece.color===side){
                this.p5.push()
                let squareColor = this.p5.color(highlight_color.r, highlight_color.g, highlight_color.b);
                squareColor.setAlpha(48);
                this.p5.background(squareColor); // translucent background (creates trails)
                // make a x and y grid of ellipses
                for (let x = 0; x <= this.p5.width; x = x + 30) {
                    for (let y = 0; y <= this.p5.height; y = y + 30) {
                        // starting point of each circle depends on mouse position
                        const xAngle = this.p5.map(this.p5.mouseX, 0, this.p5.width, -4 *  this.p5.PI, 4 *  this.p5.PI , true);
                        const yAngle = this.p5.map(this.p5.mouseY, 0, this.p5.height, -4 *  this.p5.PI , 4 *  this.p5.PI , true);
                        // and also varies based on the particle's location
                        const angle = xAngle * (x / this.p5.width) + yAngle * (y / this.p5.height);

                        // each particle moves in a circle
                        const myX = x + 20 * Math.cos(2 *  this.p5.PI * this.waveFunction  + angle);
                        const myY = y + 20 * Math.sin(2 *  this.p5.PI * this.waveFunction  + angle);

                        this.p5.ellipse(myX, myY, 10); // draw particle
                    }
                    this.p5.pop();
                }
                this.waveFunction = this.waveFunction + 0.01; // update time
            }


        }
    }

    draw_board() {
        let i = 0;
        let dragged_index = -1;
        let dragged_index2 = -1;
        let j = 0;

        if(currentTurn===playingAs){
            let color={r:105,g:172,b:162};
            //this.highlightBoardSide(playingAs,color);
        }

        if(currentTurn===playingAs && this.lastmove[0]!==-1){
            this.p5.push()
            this.p5.noStroke();
            //this.p5.translate(0, 3*size/4);
            this.p5.fill(this.p5.color(108, 169, 82,255/2));
            let startHighlight = pixel_positions[this.lastmove.StartSquare];
            let endHighlight = pixel_positions[this.lastmove.EndSquare];
            this.p5.rect(startHighlight[0],startHighlight[1],size,size)
            this.p5.fill(this.p5.color(108, 169, 82,255/2));
            this.p5.rect(endHighlight[0],endHighlight[1],size,size)
            this.p5.pop();
        }


        for (let i = 0; i < moves.length; i++) {
            let type = moves[i].type;
            if (board.grid[moves[i].StartSquare].dragging) {
                let highlight = pixel_positions[moves[i].EndSquare];
                if (type !== 'C') {
                    this.p5.push()
                    this.p5.translate(size / 2, size / 2);
                    this.p5.noStroke();
                    this.p5.fill(this.p5.color(66, 129, 74));
                    this.p5.circle(highlight[0], highlight[1], size / 3);
                    this.p5.pop();
                } else if (type === 'C') {
                    this.p5.push()
                    //this.p5.translate(size / 2, size / 2);
                    this.p5.stroke(66, 129, 74);
                    this.p5.strokeWeight(-6);
                    this.p5.noFill();
                    this.p5.rect(highlight[0], highlight[1], size, size);
                    this.p5.pop();
                }
            }
        }


        for (let k = 0; k < this.grid.length; k++) {
            let piece = this.grid[k];
            if (piece.type_letter !== 'e') {
                if (piece.drag()) {
                    piece.movePiece();
                    dragged_index = k;
                } else {
                    piece.draw_piece();
                }
                i++;
                if (i % 8 === 0) {      //TODO co to wogole jest to i XDDDDDD
                    i = 0;
                }
            } else {
                i++;
                if (i % 8 === 0) {
                    i = 0;
                }
            }
        }
        if (dragged_index !== -1) {
            this.grid[dragged_index].draw_piece();
        }
        //images "hidden" under pieces, will apear when piece is dragged or when state is low enough
        let rew = 0;
        for (var texture in textures) {
            rew += 1;
            if (playingAs === 'w' && rew % 2 === 1) {
                this.p5.push()
                this.p5.translate(scalar / 2, scalar / 2);
                this.p5.tint(255, 127);
                this.p5.image(textures[texture], Checkboard_size + shelf_size / 2 - size * 0.666, gameMode2_Margin * size * (rew + 1) / 2, size - scalar, size - scalar);
                this.p5.pop()
            } else if (playingAs === 'b' && rew % 2 === 0) {

                this.p5.push()
                this.p5.translate(scalar / 2, scalar / 2);
                this.p5.tint(200, 127);
                this.p5.image(textures[texture], Checkboard_size + shelf_size / 2 - size * 0.666, gameMode2_Margin * size * rew / 2, size - scalar, size - scalar);
                this.p5.pop()

            }


        }
        rew = 0;

        //making pieces for gamemode2 purposes they only appear above the image for setupstate
        if (this.SetupState > -1) {

            this.p5.push();
            this.p5.textFont(Font);
            this.p5.textSize(textsize);
            this.p5.fill(0, 0, 0);
            this.p5.text(this.SetupState.toString(), Checkboard_size + shelf_size / 2 - textsize * 0.833, size);
            this.p5.pop();
            this.GameMode2_checkState()
            for (let z = 0; z < this.gameMode2_grid.length; z++) {

                if (this.gameMode2_grid[z].drag()) {
                    this.gameMode2_grid[z].movePiece();
                    dragged_index2 = z;
                } else {
                    this.gameMode2_grid[z].draw_piece();
                }
                if (dragged_index2 !== -1) {
                    this.gameMode2_grid[dragged_index2].draw_piece();
                }

            }

        } else if (this.SetupState < 0 && this.gameMode2_grid.length === 1) {
            this.gameMode2_grid = [];
        }

    }

    change_Turn() {
        this.color_to_move === 'b' ? this.color_to_move = 'w' : this.color_to_move = 'b';
    }


    GameMode2_checkState() {

        if (this.SetupState < 1 && this.gameMode2_grid.length > 1) {
            this.gameMode2_grid.pop();
        }
        if (this.SetupState < 3 && this.gameMode2_grid.length > 2) {
            this.gameMode2_grid.pop();
        }
        if (this.SetupState < 3 && this.gameMode2_grid.length > 3) {
            this.gameMode2_grid.pop();
            this.gameMode2_grid.pop();
        }
        if (this.SetupState < 5 && this.gameMode2_grid.length > 4) {
            this.gameMode2_grid.pop();
        }
        if (this.SetupState < 9 && this.gameMode2_grid.length > 5) {
            this.gameMode2_grid.pop();
        }

    }


}



