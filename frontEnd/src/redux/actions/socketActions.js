// Create Redux action types
export const UPDATE_SOCKET = 'UPDATE_SOCKET'
export const SET_SOCKET_STATUS = 'SET_SOCKET_STATUS'
export const EMIT= 'EMIT'
export const DISCONNECT_SOCKET= 'DISCONNECT_SOCKET'

//SETTERS
export const updateSocket = (socket) => ({
    type: UPDATE_SOCKET,
    payload: socket,
})

export const disconnectSocket = () => ({
    type: DISCONNECT_SOCKET,
})

export const setSocketStatus = (socketStatus) => ({
    type: SET_SOCKET_STATUS,
    payload: socketStatus,
})


export const emit = (eventAndmsg) => ({
    type: EMIT,
    payload: eventAndmsg,
})



