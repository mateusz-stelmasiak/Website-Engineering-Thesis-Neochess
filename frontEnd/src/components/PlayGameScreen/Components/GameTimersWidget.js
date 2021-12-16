import "./GameTimersWidget.css"
import React, {Component, useEffect, useState} from "react";
import {connect} from "react-redux";
import useTimer from "../../CommonComponents/Timer";
import GameTimer from "./GameTimer";


function GameTimersWidget({playingAs,children}) {
    const [whiteOrder, setWhiteOrder] = useState(-1)
    const [blackOrder, setBlackOrder] = useState(-1)

    //on intialization
    useEffect(() => {
        if (playingAs == 'w') {
            setWhiteOrder(2);
            setBlackOrder(0);
            return;
        }
        setWhiteOrder(0);
        setBlackOrder(2);
    }, [playingAs]);


    return (
        <div className="GameTimersWidget">
            <GameTimer style={{'order': whiteOrder}} playerColor='w'/>
            {children}
            <GameTimer style={{'order': blackOrder}} playerColor='b'/>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        playingAs: state.game.playingAs,
    };
};

export default connect(mapStateToProps)(GameTimersWidget);