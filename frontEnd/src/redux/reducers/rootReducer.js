import {combineReducers} from 'redux'
import "./userReducer"
import userInfoReducer from "./userReducer";
import gameInfoReducer from "./gameReducer"
import socketReducer from "./socketReducer"

//all reducers combined
const rootReducer = combineReducers({
    user: userInfoReducer,
    game: gameInfoReducer,
    socket:socketReducer,
})


export default rootReducer;


// Map Redux state to React component props
export const mapAllStateToProps = (state) => {
    return {
        socket: state.socket.socket,
        socketStatus:state.socket.status,
        sessionToken: state.user.sessionToken,
        userId: state.user.userId,
        username: state.user.username,
        elo: state.user.elo,
        isInGame: state.user.isInGame,
        gameId: state.game.gameId,
        gameMode: state.game.gameMode,
        playingAs: state.game.playingAs,
        currentFEN: state.game.currentFEN,
        currentTurn:state.game.currentTurn,
        opponentUsername: state.game.opponentUsername,
        opponentElo:  state.game.opponentElo,
        opponentsStatus: state.game.opponentsStatus,
        loadingGameInfo: state.game.loadingGameInfo,
        whiteScore:state.game.whiteScore,
        blackScore:state.game.blackScore
    };
};
