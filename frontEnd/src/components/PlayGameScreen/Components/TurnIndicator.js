import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import "./TurnIndicator.css"
import Blink from "react-blink-text";
import {board} from "../Game/Main";

function TurnIndicator ({currentTurn,playingAs}){
    const [turnIndicatorText,setTurnIndicatorText]= useState("It's your turn now!")
    const [turnStyle,setCurrentTurnStyle]= useState()
    const playerTurnStyle = "rgb(228 137 57)";
    const opponentTurnStyle = "rgb(140 162 173)";

    //changes on current turn change
    useEffect(()=>{
        setTurnIndicatorText("It's opponent's turn!");
        setCurrentTurnStyle(opponentTurnStyle);
        if(currentTurn===playingAs){
            let color={r:228,g:137,b:57};
            if(board){ board.highlightBoardSide(playingAs,color )}

            setTurnIndicatorText("It's your turn now!");
            setCurrentTurnStyle(playerTurnStyle);
        }

    },[currentTurn])


    return (
      <div className="TurnIndicator">
          <h1 >Playing as <span>{playingAs ==='w'? 'WHITE':'BLACK'}</span></h1>

          <Blink color={turnStyle} text={turnIndicatorText}fontSize='20'/>
      </div>
    );
}

const mapStateToProps = (state) => {
    return {
        playingAs:state.game.playingAs,
        currentTurn: state.game.currentTurn
    };
};
export default connect(mapStateToProps)(TurnIndicator);
