import React, {useEffect, useState} from "react";
import P5Wrapper from "react-p5-wrapper"
import sketch, {board} from "./Game/Main";
import {getGameInfo, getGameIsInGame} from "../../serverCommunication/DataFetcher";
import "./PlayGameScreen.css";
import GameButtons from "./Components/GameButton/GameButtons";
import {store} from "../../index";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import {
    setGameId,
    setPlayingAs,
    setCurrentFEN,
    setOpponentELO,
    setOpponentUsername,
    setGameMode,
    setCurrentTurn,
    flipCurrentTurn,
    setBlackTime,
    setWhiteTime,
    setLoadingGameInfo,
    setWhiteScore, setBlackScore, setDrawProposedColor
} from "../../redux/actions/gameActions";
import {setIsInGame} from "../../redux/actions/userActions";
import {useHistory} from "react-router-dom"
import {authorizeSocket, emit} from "../../redux/actions/socketActions";
import FooterHeaderLayout from "../Layout/FooterHeaderLayout";
import {SocketStatus} from "../../serverCommunication/WebSocket";
import GameResult from "./Components/GameResult";
import PlayersInfo from "./Components/PlayersInfo/PlayersInfo";
import GameContainer from "./Components/GameContainer/GameContainer";
import GameTimersWidget from "./Components/GameTimersWidget/GameTimersWidget";
import TurnIndicator from "./Components/TurnIndicator/TurnIndicator";
import Chat from "./Components/Chat/Chat";


function PlayGameScreen({
                            dispatch,
                            socket,
                            userId,
                            sessionToken,
                            isInGame,
                            gameId,
                            playingAs,
                            gameMode,
                            currentFEN,
                            currentTurn,
                            whiteScore,
                            blackScore,
                            loadingGameInfo,
                        }) {
    let [gameResult, setGameResult] = useState('DRAW');
    let [eloChange, setEloChange] = useState(0);
    let [gameEnded, setGameEnded] = useState(false);


    //routing
    const history = useHistory();
    const routeToMain = () => history.push('/');


    useEffect(() => {
        dispatch(authorizeSocket(userId, sessionToken));
        fetchGameData();

        socket.on("game_ended", data => {
            if (data === undefined) return;
            setGameResult(data.result);
            setEloChange(data.eloChange)
            dispatch(setIsInGame(false));
            dispatch(setGameId(""));
            setGameEnded(true);
        });

    }, [])


    let fetchGameData = async () => {
        await dispatch(setLoadingGameInfo(true));

        //check if player is in game, if not REROUTE back
        let resp = await getGameIsInGame(userId, sessionToken);
        if (resp === undefined) return

        //if not in game REROUTE back
        if (resp.inGame == false) {
            dispatch(setIsInGame(false));
            routeToMain();
            return;
        }

        await dispatch(setGameId(resp.gameId));
        await dispatch(setPlayingAs(resp.playingAs));
        await dispatch(setGameMode(resp.gameMode));
        await dispatch(setIsInGame(true));


        if (resp.inGame) {
            //get game info for game setup
            let response = await getGameInfo(gameId, sessionToken);
            if (response === undefined) return

            await dispatch(setGameMode(response.gameMode));
            await dispatch(setCurrentFEN(response.FEN));
            await dispatch(setCurrentTurn(response.currentTurn));
            await dispatch(setBlackTime(response.blackTime));
            await dispatch(setWhiteTime(response.whiteTime));
            await dispatch(setDrawProposedColor(response.drawProposedColor))

            if (resp.playingAs === "w") {
                await dispatch(setOpponentUsername(response.blackPlayer.username));
                await dispatch(setOpponentELO(response.blackPlayer.ELO));

            } else {
                await dispatch(setOpponentUsername(response.whitePlayer.username));
                await dispatch(setOpponentELO(response.whitePlayer.ELO));
            }

            //if defender
            if (response.gameMode === "1") {
                await dispatch(setWhiteScore(response.whiteScore));
                await dispatch(setBlackScore(response.blackScore));
            }

            await dispatch(setLoadingGameInfo(false));
        }
    }

    let placeDefenderPiece = async (FEN, spentPoints) => {
        let storeState = store.getState();
        let playerId = storeState.user.userId;
        let gameroomId = storeState.game.gameId;


        let makeMoveEvent = {
            event: 'place_defender_piece',
            msg: JSON.stringify({gameroomId, playerId, FEN, spentPoints})
        }

        await store.dispatch(emit(makeMoveEvent));
        await store.dispatch(flipCurrentTurn());
        storeState = store.getState();
        store.dispatch(setWhiteScore(storeState.game.whiteScore));
        store.dispatch(setBlackScore(storeState.game.blackScore))
    }

    let sendMove = async (move, FEN) => {
        const storeState = store.getState();
        let playerId = storeState.user.userId;
        let gameroomId = storeState.game.gameId;
        let socketStatus = storeState.socket.status;

        //if socket is not connected, don't allow the move to be made locally
        if (socketStatus !== SocketStatus.authorized) {
            store.dispatch(authorizeSocket(playerId, storeState.user.sessionToken))
            board.set_FEN_by_rejected_move(move.startingSquare, move.targetSquare)
            return;
        }


        let makeMoveEvent = {
            event: 'make_move',
            msg: JSON.stringify({move, gameroomId, playerId, FEN})
        }

        await store.dispatch(emit(makeMoveEvent));
        store.dispatch(flipCurrentTurn());
    }

    return (
        <FooterHeaderLayout>
            <div className="PlayGameScreenContainer">
                <div
                    className={Number(gameMode) === 1 ? "PlayGameScreen chessDefenderGameScreen" : "PlayGameScreen"}
                    id="PLAY_GAME_SCREEN"
                >

                    {gameEnded &&
                    <GameResult
                        gameResult={gameResult}
                        eloChange={eloChange}
                    />
                    }

                    <PlayersInfo/>

                    {!loadingGameInfo &&
                    <>
                        <Chat/>
                        <GameContainer>
                            <P5Wrapper
                                sketch={sketch}
                                sendMoveToServer={sendMove}
                                placeDefenderPiece={placeDefenderPiece}
                                playingAs={playingAs}
                                startingFEN={currentFEN}
                                currentTurn={currentTurn}
                                gameMode={gameMode}
                                whiteScore={whiteScore}
                                blackScore={blackScore}
                            />
                        </GameContainer>
                    </>

                    }

                    <div className="Game-info">
                        <GameTimersWidget>
                            <TurnIndicator/>
                        </GameTimersWidget>
                        <GameButtons/>
                    </div>
                </div>
            </div>
        </FooterHeaderLayout>
    );
}

export default connect(mapAllStateToProps)(PlayGameScreen);
