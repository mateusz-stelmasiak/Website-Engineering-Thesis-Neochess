// Create Redux action types
export const SET_GAMEID = 'SET_GAMEID'
export const SET_GAMEMODE = 'SET_GAME_MODE'
export const SET_PLAYINGAS = 'SET_PLAYINGAS'
export const SET_CURRENT_FEN= 'SET_CURRENT_FEN'
export const SET_OPPONENT_USERNAME='SET_OPPONENT_USERNAME'
export const SET_OPPONENT_ELO='SET_OPPONENT_ELO'
export const SET_OPPONENT_STATUS = 'SET_OPPONENT_STATUS'
export const FLIP_CURRENT_TURN = 'FLIP_CURRENT_TURN'
export const SET_CURRENT_TURN = 'SET_CURRENT_TURN'
export const SET_WHITE_TIME = 'SET_WHITE_TIME'
export const SET_BLACK_TIME = 'SET_BLACK_TIME'
export const SET_WHITE_SCORE='SET_WHITE_SCORE'
export const SET_BLACK_SCORE='SET_BLACK_SCORE'
export const SET_LOADING_GAME_INFO='SET_LOADING_GAME_INFO'

//SETTERS
export const setGameId = (gameId) => ({
    type: SET_GAMEID,
    payload: gameId,
})

export const setGameMode = (gameMode) => ({
    type: SET_GAMEMODE,
    payload: gameMode,
})
export const setPlayingAs = (playingAs) => ({
    type: SET_PLAYINGAS,
    payload: playingAs,
})
export const setCurrentFEN = (currentFEN) => ({
    type: SET_CURRENT_FEN,
    payload: currentFEN,
})
export const setOpponentUsername = (oppUsername) => ({
    type: SET_OPPONENT_USERNAME,
    payload: oppUsername,
})
export const setOpponentELO = (oppELO) => ({
    type: SET_OPPONENT_ELO,
    payload: oppELO,
})
export const setOpponentStatus = (socketStatus) => ({
    type: SET_OPPONENT_STATUS,
    payload: socketStatus,
})

export const flipCurrentTurn  = () =>({
    type: FLIP_CURRENT_TURN,
})

export const setCurrentTurn  = (turn) =>({
    type: SET_CURRENT_TURN,
    payload: turn,
})

export const setWhiteTime  = (wtime) =>({
    type: SET_WHITE_TIME,
    payload: wtime,
})
export const setBlackTime  = (btime) =>({
    type: SET_BLACK_TIME,
    payload: btime,
})

export const setLoadingGameInfo  = (bool) =>({
    type: SET_LOADING_GAME_INFO,
    payload: bool,
})

export const setWhiteScore  = (wScore) =>({
    type: SET_WHITE_SCORE,
    payload: wScore,
})
export const setBlackScore  = (bScore) =>({
    type: SET_BLACK_SCORE,
    payload: bScore,
})



