import React, {useEffect, useState} from "react";
import "./FindGameWidget.css"
import {useHistory} from "react-router-dom";
import {connect} from "react-redux";
import {faChessPawn, faChess, faCaretLeft, faCaretRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {toast} from "react-hot-toast";
import useTimer from "../../../CommonComponents/Timer";
import Dots from "../../../CommonComponents/Dots/Dots";
import {setGameId, setGameMode, setPlayingAs} from "../../../../redux/actions/gameActions";
import {setIsInGame} from "../../../../redux/actions/userActions";
import {getAvailableGameModes} from "../../../../serverCommunication/DataFetcher";
import {emit} from "../../../../redux/actions/socketActions";
import {formatTime} from "../../../../serverCommunication/Utils";
import Form from "react-bootstrap/Form";
import FenDisplayingBoard from "../../../CommonComponents/FENDisplayingBoard/FenDisplayingBoard";


function FindGameWidget({playerId, sessionToken, socket, isInGame, dispatch}) {
    //main button text
    const buttonTexts = ["choose a game mode", <>in queue<Dots/></>, "choose a position"];
    const [selectedText, setSelectedText] = useState(0);

    //game mode handling
    const [currGameMode, setCurrGameMode] = useState(-1);
    const [gameModeButtons, setGameModeButtons] = useState(undefined);

    //positions vars
    const [positions, setPositions] = useState(undefined);
    const [positionsLoading, setPositionsLoading] = useState(true)
    const [posStartingScore, setPosStartingScore] = useState(30)
    const [currPage, setCurrPage] = useState(0);
    const [shownPositions, setShownPositions] = useState(undefined);
    const [maxPage, setMaxPage] = useState(1)
    let perPage = 4; //positions per page
    const iconLeft = <FontAwesomeIcon icon={faCaretLeft}/>;
    const iconRight = <FontAwesomeIcon icon={faCaretRight}/>;

    //queue info
    const [isInQ, setIsInQ] = useState(false);
    const [playersInQ, setPlayersInQ] = useState(<Dots>loading</Dots>);
    const [scope, setScope] = useState(<Dots>loading</Dots>);
    const {timer, timerRestart} = useTimer(0);

    //single player defender

    //routing after having succesfully found a game
    const history = useHistory();
    const routeToNext = (gameId) => history.push('/play?id=' + gameId);

    //styling
    const idleStyle = {color: 'var(--primary-color-dark)'}
    const inQStyle = {color: 'var(--sec-color)', filter: 'drop-shadow(0 0 10rem var(--sec-color))'}

    const inQGameModeTextStyle = {color: 'var(--sec-color-dark)'}

    useEffect(() => {
        leaveQ(currGameMode);
        setCurrGameMode(-1);
        loadAvailableGamemodes();

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
            leaveQ(currGameMode);
            routeToNext(data.gameId);
        });

        socket.on("positions_info", data => {
            setPositions(data);
            let maxPage = Math.ceil(data.length / perPage)
            setMaxPage(maxPage);
            setCurrPage(0);
            showPage(data, 0);
            setPositionsLoading(false)
        })

        // Anything in here is fired on component unmount.
        return () => {
            leaveQ(currGameMode);
        }
    }, [])

    let loadAvailableGamemodes = async () => {
        setCurrGameMode(-1);

        //try to read gamemodes from cache
        let cachedGames = sessionStorage.getItem('gameModes');
        if (cachedGames) {
            cachedGames = JSON.parse(cachedGames);
            setGameModeButtons(cachedGames);
        }

        let resp = await getAvailableGameModes(sessionToken);
        if (resp === undefined || resp.error !== undefined) {
            setGameModeButtons(["ERROR"]);
            return;
        }
        setGameModeButtons(resp);
        //cache
        sessionStorage.setItem('gameModes', JSON.stringify(resp));
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

        //Positions game mode
        if (gameModeId === 2) {
            setSelectedText(2);
            console.log(positions)
            if (positions === undefined) getPositionsInfo();
            return;
        }

        setSelectedText(1);
        timerRestart();
        joinQ(gameModeId);
    }

    let getPositionsInfo = () => {
        setPositionsLoading(true)
        let getPositionsEvent = {
            event: 'get_positions_info',
            msg: JSON.stringify({playerId})
        }
        dispatch(emit(getPositionsEvent));
        setIsInQ(false);
    }

    let updatePosStartingScore = (newScore) => {
        if (newScore > 99) return
        setPosStartingScore(newScore);
    }


    let joinSinglePlayerGame = (gameModeId, positionId) => {
        let joinSingleEvent = {
            event: 'join_single_player',
            msg: JSON.stringify({playerId, gameModeId, positionId, posStartingScore})
        }
        dispatch(emit(joinSingleEvent));
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

    let scrollToTop = () => {
        const yOffset = -300;
        const section = document.getElementById('positionsContainer');
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

        if (typeof section !== 'undefined' && section !== null) {
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }

    let flipPage = (direction) => {
        let newPage = (currPage + direction) % maxPage;
        if (newPage < 0) newPage = maxPage - 1;
        setCurrPage(newPage);
        showPage(positions, newPage);
        scrollToTop()
    }



    let showPage = (positions, pageNumber) => {
        let minIndex = pageNumber * perPage;
        let maxIndex = (pageNumber + 1) * perPage

        let shownP = positions.map(
            (position, index) => {
                if (index >= minIndex && index < maxIndex) {
                    return (
                        <span
                            key={"position" + index}
                            onClick={() => joinSinglePlayerGame(2, index)}
                        >
                    <FenDisplayingBoard FEN={position}/>
                    </span>
                    )
                }
                return <></>
            }
        );
        setShownPositions(shownP)
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
                    (gameMode, index) => {
                        return (
                            <button
                                key={index}
                                className="FindGameWidget-gameModeButton"
                                onClick={() => {
                                    findGame(gameMode.gameModeId)
                                }}
                                style={gameMode.gameModeId === 1 ? {'marginTop': '2rem'} :
                                    gameMode.gameModeId === currGameMode && gameMode.gameModeId === 1
                                        ?
                                        {'marginTop': '1rem'}
                                        :
                                        (gameMode.gameModeId === currGameMode ? inQGameModeTextStyle : idleStyle)

                                }

                            >

                                {
                                    gameMode.gameModeMultiplayer == true ?
                                        <FontAwesomeIcon icon={faChess}
                                                         style={gameMode.gameModeId === currGameMode ? inQStyle : idleStyle}/>
                                        :
                                        <FontAwesomeIcon icon={faChessPawn}
                                                         style={gameMode.gameModeId === currGameMode ? inQStyle : idleStyle}/>
                                }
                                <h1 style={gameMode.gameModeId === currGameMode ? inQGameModeTextStyle : idleStyle}>{gameMode.gameModeName}</h1>
                            </button>
                        );
                    })
                }
            </div>

            {currGameMode === 2 &&
            <div id={'positionsContainer'} className="FindGameWidget-positionsContainer">
                <div className="scoreInput">
                    <h2>Starting score</h2>
                    <Form.Control
                        required
                        placeholder="score"
                        type="number"
                        value={posStartingScore}
                        onChange={(e) => updatePosStartingScore(e.target.value)}
                    />
                </div>
                {!positionsLoading &&
                <>
                    <div className="positionList">
                        {shownPositions}
                    </div>
                    <div className="positionList-pages">
                        <button id='prev' onClick={() => flipPage(-1)}>{iconLeft}</button>
                        <span>{currPage + 1}/{maxPage}</span>
                        <button id='next' onClick={() => flipPage(1)}>{iconRight}</button>
                    </div>
                </>
                }


            </div>
            }

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
