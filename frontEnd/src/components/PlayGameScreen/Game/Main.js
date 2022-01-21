import Board, {default_FEN, default_FEN_Gamemode_2} from "./board";
import {
    check_if_check,
    count_squares_to_edge, Generate_opponent_moves,
    Generate_moves,
    make_a_move, generate_pos_to_stocknot_dict
} from "./moves";
import CSquare from "./CSquare";
import myFont from '../../../assets/fonts/Montserrat/Montserrat-Regular.ttf'
import {add_piece} from "./gameMode2_moves";
import {store} from "../../../index";


export var Font;
export var pos_to_stocknot_dict = [];
export const max_canvas_size = 720;
export var canvas_width = 720;
export var canvas_height = canvas_width;
export var shelf_size = canvas_width / 3;
export var game_mode_defender_width = canvas_width + shelf_size;
export var Checkboard_size = canvas_height
export var size = Checkboard_size / 8
export var Checkboard = [];
export const pieces_dict = {King: 'k', Pawn: 'p', Knight: 'n', Bishop: 'b', Rook: 'r', Queen: 'q'};
export const textures = {};
export const scalar = 5;
export var pixel_positions = [];
export const rows = Math.floor(Checkboard_size / size);
export const cols = Math.floor(Checkboard_size / size);
export var board;
export var canvas;
export var gameMode2_Margin = 1.1
export var textsize = size / 1.5;

function importAll(r) {
    let images = {};
    r.keys().map((item, index) => {
        return images[item.replace('./', '')] = r(item);
    });
    return images;
}


const images = importAll(require.context('./Pieces', false, /\.(png|jpe?g|svg)$/));
export let playingAs;
export let sendMoveToServer;
export let gameMode;
let startingFEN;
export let placeDefenderPiece;
export let whiteScore;
export let blackScore;
export let currentTurn;


export default function sketch(p5) {

    p5.myCustomRedrawAccordingToNewPropsHandler = (props) => {
        if (props.gameMode) {
            gameMode = props.gameMode;
        }
        if (props.playingAs) {
            playingAs = props.playingAs;
        }
        if (props.sendMoveToServer) {
            sendMoveToServer = props.sendMoveToServer;
        }
        if (props.startingFEN) {
            startingFEN = props.startingFEN
        }
        if (props.placeDefenderPiece) {
            placeDefenderPiece = props.placeDefenderPiece;
        }
        if (props.whiteScore!==undefined) {
            whiteScore = props.whiteScore;
        }
        if (props.blackScore!==undefined) {
            blackScore = props.blackScore;
        }
        if (props.currentTurn) {
            currentTurn = props.currentTurn;
        }
    }


    p5.preload = function () {
        Font = p5.loadFont(myFont);
        for (let key in pieces_dict) {
            let value = pieces_dict[key];
            textures[value.toUpperCase()] = p5.loadImage(images['w' + value + ".png"]['default']);
            textures[value] = p5.loadImage(images[value + ".png"]['default']);
        }
    }

    p5.mousePressed = function () {
        for (let i = 0; i < board.grid.length; i++) {
            let piece = board.grid[i];
            if (piece.isIntersecting()) {
                piece.dragging = 1;
            }
        }


        if (gameMode === '1' && board.SetupState > -1) {
            for (let i = 0; i < board.gameMode2_grid.length; i++) {
                let piece = board.gameMode2_grid[i];
                if (piece.isIntersecting()) {
                    piece.dragging = 1;
                }
            }
        }

    }
    p5.mouseReleased = function () {
        if (gameMode === '1' && board.SetupState > -1) {
            add_piece();
        }
        make_a_move();
        if (board.SetupState === -1) {
            Generate_opponent_moves(board.grid);
            check_if_check();
            Generate_moves(board.grid, board.check, "released");
        }
    }

    function calculatePixelPositions() {
        pixel_positions = [];
        Checkboard = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let square = new CSquare(i, j, size, p5);
                Checkboard.push(square);
                if (playingAs === 'b') {
                    pixel_positions.push([Checkboard_size - size - j * size, Checkboard_size - size - i * size]);
                } else {
                    pixel_positions.push([j * size, i * size]);
                }
            }
        }
    }

    p5.setup = function () {
        board = new Board(p5);
        generate_pos_to_stocknot_dict();

        if (gameMode === "1") {
            canvas_width = game_mode_defender_width;
        }
        canvas = p5.createCanvas(canvas_width, canvas_height, p5.WEBGL);
        if (gameMode === '0') {
            if (startingFEN !== undefined) {
                board.FEN = startingFEN
            } else {
                board.FEN = default_FEN;
            }

        } else {
            if (startingFEN !== undefined) {
                board.FEN = startingFEN;
            } else {
                board.FEN = default_FEN_Gamemode_2;
            }

            if(blackScore!==undefined && whiteScore!==undefined){
                playingAs==='w' ? board.SetupState=whiteScore : board.SetupState=blackScore;
            }
            else{
                board.SetupState=50;
            }
        }

        board.load_FEN();
        calculatePixelPositions();
        count_squares_to_edge();
        Generate_moves(board.grid, board.check, "setup");
        canvas.style('width', '100%');
        canvas.style('height', '100%');
        readjustCanvas(); //weird but fixes canvas always setting up as game defender DO NOT TOUCH
    };

    function readjustCanvas() {
        shelf_size = canvas_width / 3;
        //full screen mode
        let resizeTo = p5.windowWidth;
        //for screen widths bigger then max size, set to max size
        if (p5.windowWidth > max_canvas_size) resizeTo = max_canvas_size;


        canvas_width = resizeTo;
        if (gameMode === "1") {
            canvas_width = canvas_width + 50 + canvas_width / 3;
        }

        canvas_height = resizeTo;
        Checkboard_size = canvas_height;
        size = Checkboard_size / 8;
        //resize piece textures
        board.grid.forEach((piece) => {
                piece.scaled_size = size - scalar;
            }
        )
        let i = 0
        board.gameMode2_grid.forEach((piece) => {
                i += 1
                piece.scaled_size = size - scalar;
                piece.x = Checkboard_size + shelf_size / 2 - size * 0.666
                piece.y = gameMode2_Margin * size * i
                piece.old_x = Checkboard_size + shelf_size / 2 - size * 0.666
                piece.old_y = gameMode2_Margin * size * i
            }
        )
        textsize = size / 1.5

        canvas.resize(canvas_width, canvas_height);
        calculatePixelPositions();
        board.load_FEN();
        canvas.style('width', '100%');
        canvas.style('height', '100%');
    }

    p5.windowResized = function () {
        readjustCanvas();
    }

    p5.draw = function () {
        p5.background(255);
        p5.translate(-canvas_width / 2, -canvas_height / 2);

        for (let i = 0; i < Checkboard.length; i++) {
            Checkboard[i].drawSquares();
        }
        board.draw_board();

    };


};
