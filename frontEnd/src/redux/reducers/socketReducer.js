// Import all actions
import * as actions from '../actions/socketActions'
import SocketClient, {SocketStatus} from "../../serverCommunication/WebSocket";

export const socketInitialState = {
    socket: new SocketClient(),
    status: SocketStatus.disconnected,
};

export default function socketReducer(state = socketInitialState, action) {
    switch (action.type){
        case actions.DISCONNECT_SOCKET:
            state.socket.disconnect();
            return {...state}
        case actions.UPDATE_SOCKET:
            return {...state, socket:action.payload}
        case actions.SET_SOCKET_STATUS:
            return {...state, status:action.payload}
        case actions.AUTHORIZE_SOCKET:
            state.socket.authorizeFromDispatch(action.payload.userId,action.payload.sessionToken)
            return state
        case actions.EMIT:
            if (state.socket.is_authorized) state.socket.emit(action.payload.event,action.payload.msg)
            return state
        default:
            return state
    }
}
