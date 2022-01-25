import "./FenDisplayingBoard.css"
import React, {useEffect, useState} from "react";
import {faChessPawn,faChessBishop,faChessRook,faChessKnight,faChessKing,faChessQueen} from "@fortawesome/free-solid-svg-icons";
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
        'width': '22rem',
        'height': '22rem',
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

    let whiteFigureStyle = {
        'color':'white',
    }

    let blackFigureStyle = {
        'color':'black'
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

        return  isBlack ? "FenDisplayingBoard-square black" : "FenDisplayingBoard-square white"
    }

    let loadFEN = (FEN) => {
        let sqrArray = []
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
            }
            else
            {
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
                            className={getSquareClass(column,row)}
                            style={squareStyle}
                            onClick={() => clickSquare(i)}
                        >
                            <span className="FenDisplayingBoard-pieceContainer" style={e === e.toUpperCase() ? whiteFigureStyle:blackFigureStyle}>
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
