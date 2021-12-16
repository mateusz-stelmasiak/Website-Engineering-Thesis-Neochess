// Import all actions
import * as actions from '../actions/gameActions'
import {SocketStatus} from "../../serverLogic/WebSocket";


export const gameInitialState = {
    gameId: sessionStorage.getItem('gameId'),
    gameMode: -1,
    playingAs: sessionStorage.getItem('playingAs'),
    currentFEN: '',
    opponentUsername:sessionStorage.getItem('opponentUsername'),
    opponentElo: sessionStorage.getItem('opponentElo'),
    chatHistory:sessionStorage.getItem('chatHistory'),
    opponentsStatus: SocketStatus.unknown,
    currentTurn:sessionStorage.getItem('currentTurn'),
    whiteTime:'420',
    blackTime:'420',
    loadingGameInfo:true,
    whiteScore:'0',
    blackScore:'0'
};

export default function gameInfoReducer(state = gameInitialState, action) {
    switch (action.type){
        case actions.SET_PLAYINGAS:
            sessionStorage.setItem('playingAS',action.payload)
            return {...state, playingAs:action.payload}
        case actions.SET_GAMEID:
            sessionStorage.setItem('gameId',action.payload)
            return {...state, gameId:action.payload}
        case actions.SET_GAMEMODE:
            return {...state, gameMode:action.payload}
        case actions.SET_CURRENT_FEN:
            return {...state, currentFEN:action.payload}
        case actions.SET_OPPONENT_USERNAME:
            sessionStorage.setItem('opponentUsername',action.payload)
            return {...state, opponentUsername:action.payload}
        case actions.SET_OPPONENT_ELO:
            sessionStorage.setItem('opponentELO',action.payload)
            return {...state, opponentElo:action.payload}
        case actions.SET_OPPONENT_STATUS:
            sessionStorage.setItem('opponentsStatus',action.payload)
            return {...state, opponentsStatus:action.payload}
        case actions.SET_CURRENT_TURN:
            sessionStorage.setItem('currentTurn',action.payload)
            return {...state, currentTurn:action.payload}
        case actions.FLIP_CURRENT_TURN:
            let nextTurn;
            state.currentTurn == 'w' ? nextTurn='b':nextTurn='w';
            sessionStorage.setItem('currentTurn',nextTurn)
            return {...state, currentTurn:nextTurn}
        case actions.SET_WHITE_TIME:
            return {...state, whiteTime:action.payload}
        case actions.SET_BLACK_TIME:
            return {...state, blackTime:action.payload}
        case actions.SET_BLACK_SCORE:
            return {...state, blackScore:action.payload}
        case actions.SET_WHITE_SCORE:
            return {...state, whiteScore:action.payload}
        case actions.SET_LOADING_GAME_INFO:
            return {...state, loadingGameInfo:action.payload}
        default:
            return state
    }
}
