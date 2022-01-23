import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import "./TurnIndicator.css"
import Blink from "react-blink-text";


function TurnIndicator ({currentTurn,playingAs}){
    const playerTurnStyle = "var(--primary-color-dark)";
    const opponentTurnStyle = "var(--primary-color-dark)";

    return (
      <div className="TurnIndicator">
          <h1 >Playing as <span>{playingAs ==='w'? 'WHITE':'BLACK'}</span></h1>
          {currentTurn ===playingAs ?
              <Blink color={playerTurnStyle} text={"It's your turn now!"} fontSize='20'/>
          :
              <span style={{color:opponentTurnStyle}}>It's opponent's turn!</span>
          }


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
