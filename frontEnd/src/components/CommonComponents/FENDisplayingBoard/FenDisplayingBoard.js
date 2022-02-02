import "./FenDisplayingBoard.css"
import React, {useEffect, useState} from "react";
import {
    faChessPawn,
    faChessBishop,
    faChessRook,
    faChessKnight,
    faChessKing,
    faChessQueen
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function FenDisplayingBoard({FEN}) {
    let board_width = 8;
    let board_height = 8;
    const [squareArray, setSquareArray] = useState(undefined)

    let boardSize = board_width * board_height
    let squareBoard = board_width === board_height
    let percent = (100 / board_width)
    let maxMargin = percent / (board_width - 1)

    let squareSize = "" + Number(percent - maxMargin) + "%";

    let squareStyle = {
        'width': squareSize,
        'height': squareSize,
    }

    let boardStyle = {
        'width': '19rem',
        'height': '19rem',
        'backgroundColor': 'var(--body-color)'
    }

    let pieceIcons = {
        'K': <FontAwesomeIcon icon={faChessKing}/>,
        'P': <FontAwesomeIcon icon={faChessPawn}/>,
        'N': <FontAwesomeIcon icon={faChessKnight}/>,
        'B': <FontAwesomeIcon icon={faChessBishop}/>,
        'R': <FontAwesomeIcon icon={faChessRook}/>,
        'Q': <FontAwesomeIcon icon={faChessQueen}/>
    }

    let example_FENS = ["", "", "", "", "", "", "", "", "", "", ""]
    let FEN_DICT = {
        'n': "nnPPPnnn/nqnPPnqn/nqqnPnqn/nqqqnnqn/nqnqqnqn/nqnnqqqn/nqnPnqqn/nnnPPnnn w - - 0 1",
        'e': "PPnnnnnP/PPnnnnnP/1PnnPPPP/PPnnnnPP/PPnnnnPP/PPnnPPPP/PPnnnnnP/PPnnnnnP w - - 0 1",
        'o': "PPnnnnPP/PnnppnnP/nnPPP1nn/npPPPPpn/npPPPPpn/nn1PPPnn/PnnppnnP/PPnnnnPP w - - 0 1"
    }

    let randomLetter = function () {
        let keys = Object.keys(FEN_DICT);
        return keys[ keys.length * Math.random() << 0];
    };
    let MAX_FEN_DICT = 2
    let cycleFENS = (FENS) => {
        //use for array
        // let min = Math.ceil(0);
        // let max = Math.floor(MAX_FEN_DICT);
        // let random = Math.floor(Math.random() * (max - min)) + min;
        // !FENS ? loadFEN(chosen) :loadFEN(chosen)

        let randomLtr= randomLetter()
        let chosen= FEN_DICT[randomLtr]
        !FENS ? loadFEN(chosen) :loadFEN(chosen)
    }

    let whiteFigureStyle = {
        'color': 'white',
    }

    let blackFigureStyle = {
        'color': 'black'
    }

    let clickSquare = (i) => {
    }

    let getSquareClass = (rank, file) => {
        let parityFlag = rank % 2
        let isBlack

        if (((rank * board_width) + file) % 2 === 0) {
            isBlack = parityFlag === 0
        } else {
            isBlack = parityFlag !== 0
        }

        return isBlack ? "FenDisplayingBoard-square black" : "FenDisplayingBoard-square white"
    }

    let loadFEN = (FEN) => {
        let sqrArray = []
        setSquareArray(undefined)

        let square = <></>

        let split_FEN = FEN.split(' ')
        let fenBoard = split_FEN[0];   // taking only pieces position (FEN.split[0]), discarding game info
        let row = 0;
        let column = 0;

        for (let i = 0; i < fenBoard.length; i++) {
            let e = fenBoard[i];
            if (e === '/') {
                column = 0;
                row++;
            } else {
                if (Number.isInteger(Number(e))) {

                    for (let z = 0; z < Number(e); z++) {
                        square =
                            <div
                                key={i}
                                className={getSquareClass(column, row)}
                                style={squareStyle}
                                onClick={() => clickSquare(i)}
                            />
                        sqrArray.push(square);
                        column++
                    }

                } else {

                    square =
                        <div
                            key={i}
                            className={getSquareClass(column, row)}
                            style={squareStyle}
                            onClick={() => clickSquare(i)}
                        >
                            <span className="FenDisplayingBoard-pieceContainer"
                                  style={e === e.toUpperCase() ? whiteFigureStyle : blackFigureStyle}>
                                {pieceIcons[e.toUpperCase()]}
                            </span>

                        </div>
                    sqrArray.push(square);
                    column++
                }
            }
        }

        setSquareArray(sqrArray)
    }


    useEffect(() => {
        if (!FEN) {
            cycleFENS()
            setInterval(cycleFENS, 500)
            return
        }

        loadFEN(FEN)
    }, [FEN])

    return (
        <div className="FenDisplayingBoard">
            <div className="FenDisplayingBoard-content" style={boardStyle}>
                <div className="FenDisplayingBoard-container">
                    {squareArray}
                </div>
            </div>
        </div>
    );
}
