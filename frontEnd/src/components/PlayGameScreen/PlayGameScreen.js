import {Component} from "react";
import GameContainer from "./Components/GameContainer"
import Chat from "./Components/Chat"

import P5Wrapper from "react-p5-wrapper"
import sketch from "./Game/Main";
import {getGameInfo, getGameIsInGame} from "../../serverLogic/DataFetcher";
import PlayersInfo from "./Components/PlayersInfo";
import "./PlayGameScreen.css";
import GameButtons from "./Components/GameButtons";
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
    setWhiteScore, setBlackScore
} from "../../redux/actions/gameActions";
import {setIsInGame} from "../../redux/actions/userActions";
import {withRouter} from "react-router-dom"
import {GAME_DEBUGING_MODE} from "../../App";
import {emit} from "../../redux/actions/socketActions";
import GameTimer from "./Components/GameTimer";
import {sleep} from "../../serverLogic/Utils";
import {CSSTransition} from "react-transition-group";
import GameTimersWidget from "./Components/GameTimersWidget";
import TurnIndicator from "./Components/TurnIndicator";

class PlayGameScreen extends Component {

    constructor(props) {
        super(props);

        this.socket = this.props.socket;
        this.state = {
            gameStatus: "Draw",
            showResult: false,
        }
    }

    async fetchGameData(){
        await this.props.dispatch(setLoadingGameInfo(true));
        //check if opponent is in game, if not REROUTE back
        let playerId = this.props.userId;
        if (this.props.gameroomId===undefined){
            let resp= await getGameIsInGame(this.props.userId,this.props.sessionToken);
            if (resp === undefined) return

            //if not in game REROUTE back
            if(!resp.inGame && !GAME_DEBUGING_MODE){
                this.props.dispatch(setIsInGame(false));
                this.props.history.push('/');
                return;
            }
            await this.props.dispatch(setGameId(resp.gameId));
            await this.props.dispatch(setPlayingAs(resp.playingAs));
            await this.props.dispatch(setGameMode(resp.gameMode));
            await this.props.dispatch(setIsInGame(true));
        }

        if(this.props.isInGame){
            this.props.history.push('/play?id=' + this.props.gameId);
            //get game info for game setup
            let resp= await getGameInfo(this.props.gameId,this.props.sessionToken);
            if (resp === undefined) return

            console.log(resp)
            await this.props.dispatch(setGameMode(resp.gameMode));
            await this.props.dispatch(setCurrentFEN(resp.FEN));
            //
            if (this.props.playingAs ==="w"){
                await this.props.dispatch(setOpponentUsername(resp.blackPlayer.username));
                await this.props.dispatch(setOpponentELO(resp.blackPlayer.ELO));
            }else{
                await this.props.dispatch(setOpponentUsername(resp.whitePlayer.username));
                await this.props.dispatch(setOpponentELO(resp.whitePlayer.ELO));
            }
            await this.props.dispatch(setCurrentTurn(resp.currentTurn));
            await this.props.dispatch(setBlackTime(resp.blackTime));
            await this.props.dispatch(setWhiteTime(resp.whiteTime))

            if (resp.gameMode==="1"){
                await this.props.dispatch(setWhiteScore(resp.whiteScore));
                await this.props.dispatch(setBlackScore(resp.blackScore));
            }

            await this.props.dispatch(setLoadingGameInfo(false));
        }

        if (GAME_DEBUGING_MODE) await this.setDebugingGameValues();
    }

    setDebugingGameValues(){
        this.props.dispatch(setPlayingAs('w'));
        this.props.dispatch(setCurrentFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
        this.props.dispatch(setOpponentUsername("YOURSELF"));
    }
    componentDidMount() {
        //style canvas programatically TODO maybe find a more elegant way?

        this.fetchGameData();
        this.socket.on("game_ended", data => {
            if (data === undefined) return;
            this.setState({gameStatus: data.result, showResult: true});
            this.props.dispatch(setIsInGame(false));
            this.props.dispatch(setGameId(""));
        });
    }

    async placeDefenderPiece(FEN,spentPoints){
        const storeState=store.getState();
        let playerId = storeState.user.userId;
        let gameroomId =storeState.game.gameId;

        console.log("SEND OPPONENT DEFENDER");
        let makeMoveEvent ={
            event:'place_defender_piece',
            msg:JSON.stringify({gameroomId, playerId,FEN,spentPoints})
        }

        store.dispatch(emit(makeMoveEvent));
        store.dispatch(flipCurrentTurn());
    }
    async sendMove(move,FEN) {
        const storeState=store.getState();
        let playerId = storeState.user.userId;
        let gameroomId =storeState.game.gameId;

        let makeMoveEvent ={
            event:'make_move',
            msg:JSON.stringify({move, gameroomId, playerId,FEN})
        }

        store.dispatch(emit(makeMoveEvent));
        store.dispatch(flipCurrentTurn());
    }


    render() {
        return (
            <CSSTransition
                in={!this.props.loadingGameInfo}
                timeout={200}
                classNames="PlayGameScreenContainer"
                unmountOnExit
            >
                <div className="PlayGameScreenContainer">
                    <div className={this.props.gameMode==='0'? "PlayGameScreen":"PlayGameScreen chessDefenderGameScreen"} id="PLAY_GAME_SCREEN">
                        {this.state.showResult &&
                        <div className="ResultInfo">
                            <p>&nbsp;{this.state.gameStatus.toUpperCase()}</p>
                            <button disabled={!this.state.showResult} onClick={()=>{this.props.history.push('/')}}>GO BACK</button>
                        </div>
                        }

                        <PlayersInfo/>

                        <Chat/>

                        <GameContainer>
                            <P5Wrapper
                                sketch={sketch}
                                sendMoveToServer={this.sendMove}
                                placeDefenderPiece={this.placeDefenderPiece}
                                playingAs={this.props.playingAs}
                                startingFEN={this.props.currentFEN}
                                currentTurn={this.props.currentTurn}
                                gameMode={this.props.gameMode}
                                whiteScore={this.props.whiteScore}
                                blackScore={this.props.blackScore}
                            />
                        </GameContainer>

                        <div className="Game-info">

                            <GameTimersWidget>
                                <TurnIndicator/>
                            </GameTimersWidget>
                            <GameButtons/>
                        </div>

                    </div>
                </div>
            </CSSTransition>

        );
    }
}

export default connect(mapAllStateToProps)(withRouter(PlayGameScreen));
