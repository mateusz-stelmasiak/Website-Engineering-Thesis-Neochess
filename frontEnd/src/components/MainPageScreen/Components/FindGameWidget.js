import React, {useContext, useEffect, useState} from "react";
import "./FindGameWidget.css"
import TextWithWavyOrnament from "../../CommonComponents/TextWithWavyOrnament";
import {formatTime} from "../../../serverLogic/Utils"
import useTimer from "../../CommonComponents/Timer";
import Dots from "../../CommonComponents/Dots"
import {useHistory} from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import {connect} from "react-redux";
import {setGameId, setGameMode, setPlayingAs} from "../../../redux/actions/gameActions";
import {mapAllStateToProps} from "../../../redux/reducers/rootReducer";
import {setIsInGame} from "../../../redux/actions/userActions";

export class GameMode {
    static classic = new GameMode('Classic', 0);
    static defender = new GameMode('Defender', 1);

    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}

export const allGameModes = [GameMode.classic, GameMode.defender];

function FindGameWidget({userId,socket,dispatch}) {

    const playerId =userId //;
    const [playersInQ, setPlayersInQ] = useState("loading...");
    const buttonTexts = ["FIND A GAME!", "IN QUEUE"];
    const [mainButtonText, setMainButtonText] = useState(buttonTexts[0]);

    const [isInQ, setIsInQ] = useState(false);
    const [scope, setScope] = useState(50);
    const {timer, timerRestart} = useTimer(0);

    //styling
    const idleStyle = {
        background: 'linear-gradient(90deg, rgba(200,199,199,1) 30%, rgba(254,254,254,1) 100%)',
        color: '#1c534b'
    }

    const inQStyle = {
        background: 'rgba(218,139,67,1)',
        color: '#e8ece8'
    }

    const inQStyleGameMode = {
        background: 'var(--primary-color-dark)',
        color: '#e8ece8'
    }

    const QInfoStyle = {
        color: '#69aca1'
    };

    //gamemodes handling
    const [selectedGameMode,setSelectedGameMode]= useState(-1);
    const gameModeButtons = allGameModes.map(
        (mode) => {
            return (
                <button
                    className="PlayGameWidget-gameModeButton"
                    onClick={()=>{findGame(mode.id)}}
                    style={selectedGameMode===mode.id ? inQStyleGameMode : idleStyle}
                >
                    {mode.name}
                </button>
            );
        });


    //routing after having succesfully found a game
    const history = useHistory();
    const routeToNext = (gameId) => history.push('/play?id=' + gameId);

    let componentMounted = true;


    function findGame(gameModeId) {

        if((isInQ && gameModeId===selectedGameMode) || gameModeId===-1){
            setMainButtonText(buttonTexts[0]);
            leaveQ(selectedGameMode);
            setIsInQ(false);
            setSelectedGameMode(-1);
            return;
        }

        setSelectedGameMode(gameModeId);
        setIsInQ(true);
        setMainButtonText(buttonTexts[1]);
        //restart the timer
        timerRestart();
        joinQ(gameModeId);
    }

    useEffect(() => {
        socket.on("queue_info", data => {
            console.log(data);
            if (componentMounted) setPlayersInQ(data.playersInQueue);
        });

        socket.on("update_scope", data => {
            console.log(data);
            if (componentMounted) setScope(data.scope);
        });

        socket.on("game_found", data => {
            console.log("GAME_FOUND")
            dispatch(setPlayingAs(data.playingAs));
            dispatch(setGameId(data.gameId));
            dispatch(setGameMode(data.gameMode));
            dispatch(setIsInGame(true));
            routeToNext(data.gameId)
        });

        return () => { // This code runs when component is unmounted
            componentMounted = false; // (4) set it to false if we leave the page
        }
    }, []);


    async function joinQ(gameModeId) {
        //check for socket connection, if none exists, connect
        if (!socket.is_connected) return;
        await socket.emit("join_queue", JSON.stringify({playerId, gameModeId}));
    }

    async function leaveQ(gameModeId) {
        if (!socket.is_connected || !isInQ) return;
        await socket.emit("leave_queue", JSON.stringify({playerId, gameModeId}));
    }


    return (
        <section id="PLAY" className="PlayGameWidget">
            <button className="PlayGameWidget-mainButton"
                    style={isInQ ? inQStyle : idleStyle}
                    onClick={()=>{findGame(-1)}}
            >
                <TextWithWavyOrnament fontSize='2.5rem'>
                    {mainButtonText}
                    {isInQ && <Dots/>}
                </TextWithWavyOrnament>
            </button>


            <div className="GameModes">
                {gameModeButtons}
            </div>


            <CSSTransition
                in={isInQ}
                timeout={200}
                classNames="QInfo"
                unmountOnExit
            >
            <ul className="QInfo">
                <li key="QInfo-wait-time"><span style={QInfoStyle}>Wait time:</span> {formatTime(timer)}</li>
                <li key="QInfo-players-inQ"><span style={QInfoStyle}>Players in queue:</span> {playersInQ}</li>
                <li key="QInfo-scope"><span style={QInfoStyle}>Scope:</span> +-{scope}</li>
            </ul>
        </CSSTransition>


        </section>

    );
}



export default connect(mapAllStateToProps)(FindGameWidget)
