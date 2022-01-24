import "./FenDisplayingBoard.css"
import React, {useEffect, useState} from "react";


export default function FenDisplayingBoard({props}) {
    let board_width = 8;
    let board_height = 8;
    const [squareArray, setSquareArray] = useState(undefined)
    const [FEN, setFEN] = useState("")


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

    let clickSquare = (i)=>{
    }

    let generateBoard = () => {
        let sqrArray = []
        let square = <></>
        for (let i = 0; i < board_width * board_height; i++) {
            let j = (i % board_width)

            let squareClass = "";
            //TODO change to black
            (j%2)=== 0 ? squareClass = "FenDisplayingBoard-square white" : squareClass = "FenDisplayingBoard-square white"

            square = <div className={squareClass} style={squareStyle} onClick={()=>clickSquare(i)}/>
            sqrArray.push(square);
        }
        setSquareArray(sqrArray)
    }

    useEffect(() => {
        generateBoard();
    }, [])


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