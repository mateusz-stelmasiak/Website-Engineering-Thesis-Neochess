import "./GameTimer.css"
import React, { useEffect, useState} from "react";
import {connect} from "react-redux";
import {classNames, formatTimeMinutes} from "../../../../serverCommunication/Utils";

//time below which the timer becomes red
const LOW_TIME_BOUNDARY = 10;

function GameTimer({currentTurn, playerColor, blackTime, whiteTime, style}) {
    const [timer, setTimer] = useState(600);
    let classes = {
        'active': playerColor === currentTurn,
        'low-time': timer <= LOW_TIME_BOUNDARY,
    };

    //on intialization
    useEffect(() => {
        playerColor === 'w' ? setTimer(Math.floor(whiteTime)) : setTimer(Math.floor(blackTime))
        classes = {
            'active': playerColor === currentTurn,
            'low-time': timer <= LOW_TIME_BOUNDARY,
        };
    }, [blackTime, whiteTime]);

    //everytime turn changes
    useEffect(() => {
        classes = {
            'active': playerColor === currentTurn,
            'low-time': timer <= LOW_TIME_BOUNDARY,
        };
    }, [currentTurn]);

    return (
        <div style={style} className="GameTimer">
            <div className={classNames(classes)}>
                {formatTimeMinutes(timer)}
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        currentTurn: state.game.currentTurn,
        whiteTime: state.game.whiteTime,
        blackTime: state.game.blackTime
    };
};

export default connect(mapStateToProps)(GameTimer);
