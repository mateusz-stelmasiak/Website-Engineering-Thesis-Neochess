import React, {useEffect, useState} from "react";
import "./FindGameWidget.css"
import {formatTime} from "../../../serverCommunication/Utils"
import useTimer from "../../CommonComponents/Timer";
import Dots from "../../CommonComponents/Dots"
import {useHistory} from "react-router-dom";
import {connect} from "react-redux";
import {setGameId, setGameMode, setPlayingAs} from "../../../redux/actions/gameActions";
import {setIsInGame} from "../../../redux/actions/userActions";
import {emit} from "../../../redux/actions/socketActions";
import {
    getAvailableGameModes,
} from "../../../serverCommunication/DataFetcher";
import {faChessPawn, faChess} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Tooltip} from "react-bootstrap";
import {toast} from "react-hot-toast";


function FindGameWidget({playerId, sessionToken, socket, isInGame, dispatch}) {
    //main button text
    const buttonTexts = ["choose a game mode", <>in queue<Dots/></>];
    const [selectedText, setSelectedText] = useState(0);

    //game mode handling
    const [currGameMode, setCurrGameMode] = useState(-1);
    const [gameModeButtons, setGameModeButtons] = useState(undefined);

    //queue info
    const [isInQ, setIsInQ] = useState(false);
    const [playersInQ, setPlayersInQ] = useState(<Dots>loading</Dots>);
    const [scope, setScope] = useState(<Dots>loading</Dots>);
    const {timer, timerRestart} = useTimer(0);

    //routing after having succesfully found a game
    const history = useHistory();
    const routeToNext = (gameId) => history.push('/play?id=' + gameId);


    //styling
    const idleStyle = {color: 'var(--primary-color-dark)'}
    const inQStyle = {color: 'var(--sec-color)'}

    const inQGameModeTextStyle = {color: 'var(--sec-color-dark)'}

    useEffect(() => {
        leaveQ(currGameMode);
        setCurrGameMode(-1);
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

        // Anything in here is fired on component unmount.
        return () => {
            leaveQ(currGameMode);
        }
    }, [])


    let loadAvailableGamemodes = async () => {
        setCurrGameMode(-1);

        //try to read gamemodes from cache
        let cachedGames = sessionStorage.getItem('gameModes');
        if (cachedGames){
            cachedGames = JSON.parse(cachedGames);
            console.log(cachedGames);
            setGameModeButtons(cachedGames);
            return;
        }

        let resp = await getAvailableGameModes(sessionToken);
        if (resp === undefined || resp.error !== undefined) {
            setGameModeButtons(["ERROR"]);
            return;
        }

        setGameModeButtons(resp);

        //cache
        sessionStorage.setItem('gameModes',JSON.stringify(resp));
    }


    const findGame = (gameModeId) => {
        //already in game
        if (isInGame === true) {
            toast.error("Already in game!");
            return;
        }

        //selecting gamemode -1 => deselecting all gamemodes
        if (gameModeId === -1) {
            setSelectedText(0);
            leaveQ(currGameMode);
            setCurrGameMode(-1);
            return;
        }

        //reselecting the same mode
        if (isInQ === true && (gameModeId === currGameMode)) {
            return;
        }


        leaveQ(currGameMode);
        setCurrGameMode(gameModeId);
        setSelectedText(1);
        timerRestart();
        joinQ(gameModeId);
    }


    let joinQ = async (gameModeId) => {
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
        <section id="PLAY" className="FindGameWidget">

            <hr/>
            <div className="FindGameWidget-mainText">
                <h1>FIND A GAME</h1>
                <h2 style={isInQ ? inQStyle : idleStyle}>{buttonTexts[selectedText]}</h2>
            </div>
            <hr/>

            <div className="FindGameWidget-gameModes">
                {gameModeButtons && gameModeButtons.map(
                    (gameMode) => {
                        return (
                            <button
                                className="FindGameWidget-gameModeButton"
                                onClick={() => {
                                    findGame(gameMode.gameModeId)
                                }}
                                style={gameMode.gameModeId === currGameMode ? inQGameModeTextStyle : idleStyle}
                            >
                                {gameMode.gameModeIcon === 'chess' ? <FontAwesomeIcon icon={faChess}
                                                                                      style={gameMode.gameModeId === currGameMode ? inQStyle : idleStyle}/> :
                                    <FontAwesomeIcon icon={faChessPawn}
                                                     style={gameMode.gameModeId === currGameMode ? inQStyle : idleStyle}/>}
                                <h1  style={gameMode.gameModeId === currGameMode ? inQGameModeTextStyle : idleStyle}>{gameMode.gameModeName}</h1>
                            </button>
                        );
                    })
                }
            </div>


            {isInQ &&
            <div className="QInfo">
                <ul>
                    <li key="QInfo-wait-time"><span>Wait time:</span> {formatTime(timer)}</li>
                    <li key="QInfo-players-inQ"><span>Players in queue:</span> {playersInQ}</li>
                    <li key="QInfo-scope"><span>Scope:</span> +-{scope}</li>
                </ul>

                <button className="QInfo-leave" onClick={() => {
                    findGame(-1)
                }}>
                    LEAVE QUEUE
                </button>
            </div>
            }


        </section>

    );
}

const mapStateToProps = (state) => {
    return {
        playerId: state.user.userId,
        sessionToken: state.user.sessionToken,
        socket: state.socket.socket,
        isInGame: state.user.isInGame,
    };
};

export default connect(mapStateToProps)(FindGameWidget);

