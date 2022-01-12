import React, {useEffect, useState} from "react";
import "./FindGameWidget.css"
import TextWithWavyOrnament from "../../CommonComponents/TextWithWavyOrnament";
import {formatTime} from "../../../serverCommunication/Utils"
import useTimer from "../../CommonComponents/Timer";
import Dots from "../../CommonComponents/Dots"
import {useHistory} from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import {connect} from "react-redux";
import {setGameId, setGameMode, setPlayingAs} from "../../../redux/actions/gameActions";
import {setIsInGame} from "../../../redux/actions/userActions";
import {emit} from "../../../redux/actions/socketActions";
import {
    getAvailableGameModes,
} from "../../../serverCommunication/DataFetcher";
import {faChessPawn, faEye} from "@fortawesome/free-solid-svg-icons";
import {faChess} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

//TODO get gamemodes from server
export class GameMode {
    static classic = new GameMode('Classic', 0);
    static defender = new GameMode('Defender', 1);

    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
export const allGameModes = [GameMode.classic, GameMode.defender];

function FindGameWidget({playerId,sessionToken,socket,dispatch}) {
    //main button text
    const buttonTexts = ["FIND A GAME!", "IN QUEUE"];
    const [selectedText, setSelectedText] = useState(0);

    //game mode handling
    const [selectedGameMode,setSelectedGameMode]= useState(-1);
    const [gameModeButtons,setGameModeButtons]=useState();

    //queue info
    const [isInQ, setIsInQ] = useState(false);
    const [playersInQ, setPlayersInQ] = useState(<Dots>loading</Dots>);
    const [scope, setScope] = useState(<Dots>loading</Dots>);
    const {timer, timerRestart} = useTimer(0);

    //routing after having succesfully found a game
    const history = useHistory();
    const routeToNext = (gameId) => history.push('/play?id=' + gameId);


    //styling
    const idleStyle = { color: '#1c534b'}
    const inQStyle = { color: '#e8ece8'}
    const inQStyleGameMode = { color: '#e8ece8'}
    const QInfoStyle = {color: '#69aca1'};


   useEffect(()=>{
       loadAvailableGamemodes();

       //TODO move to socket?
       socket.on("queue_info", data => {
           setPlayersInQ(data.playersInQueue);
       });

       socket.on("update_scope", data => {
           setScope(data.scope);
       });

       socket.on("game_found", data => {
           dispatch(setPlayingAs(data.playingAs));
           dispatch(setGameId(data.gameId));
           dispatch(setGameMode(data.gameMode));
           dispatch(setIsInGame(true));
           routeToNext(data.gameId);
       });

   },[])

    let loadAvailableGamemodes = async ()=>{
        const resp = await  getAvailableGameModes(sessionToken);
        if (resp === undefined || resp.error !== undefined) {
            setGameModeButtons(["ERROR"]);
            return;
        }

        const gameModeButtonsTmp = resp.map(
            (gameMode) => {
                return (
                    <button
                        className="PlayGameWidget-gameModeButton"
                        onClick={()=>{findGame(gameMode.gameModeId)}}
                        style={selectedGameMode===gameMode.gameModeId ? inQStyleGameMode : idleStyle}
                    >
                        {gameMode.gameModeIcon==='chess'? <FontAwesomeIcon icon={faChess}/>:<FontAwesomeIcon icon={faChessPawn}/>}
                        <h1>{gameMode.gameModeTime/60}min</h1>
                        <h2>{gameMode.gameModeName}</h2>
                        <p>{gameMode.gameModeDesc}</p>
                    </button>
                );
        });

        setGameModeButtons(gameModeButtonsTmp);
    }



    let findGame = (gameModeId) => {
        if((isInQ && gameModeId===selectedGameMode) || gameModeId===-1){
            setSelectedText(0);
            leaveQ(selectedGameMode);
            setSelectedGameMode(-1);
            return;
        }

        setSelectedGameMode(gameModeId);
        setSelectedText(1);
        timerRestart();
        joinQ(gameModeId);
    }


    let joinQ = async(gameModeId) => {
        let joinQEvent = {
            event: 'join_queue',
            msg: JSON.stringify({playerId, gameModeId})
        }

        dispatch(emit(joinQEvent));
        setIsInQ(true);
    }

    async function leaveQ(gameModeId) {
        if (!isInQ) return;

        let leaveQEvent = {
            event: 'leave_queue',
            msg: JSON.stringify({playerId, gameModeId})
        }

        dispatch(emit(leaveQEvent));
        setIsInQ(false);
    }


    return (
        <section id="PLAY" className="PlayGameWidget">
            UNFORMATED MESS

            <button className="PlayGameWidget-mainButton"
                    style={isInQ ? inQStyle : idleStyle}
                    onClick={()=>{findGame(-1)}}
            >
                <TextWithWavyOrnament fontSize='2.5rem'>
                    {buttonTexts[selectedText]}
                    {isInQ && <Dots/>}
                </TextWithWavyOrnament>
            </button>


            <div className="GameModes">
                {gameModeButtons}
                <i className={"fa-chess"}/>
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

const mapStateToProps = (state) => {
    return {
        playerId: state.user.userId,
        sessionToken: state.user.sessionToken,
        socket:state.socket.socket
    };
};

export default connect(mapStateToProps)(FindGameWidget);

