import io from 'socket.io-client';
import {API_URL} from "./APIConfig";
import {makeOpponentMove, getMove, generateMoves} from "../components/PlayGameScreen/Game/moves";
import {store} from "../index";
import {setSocketStatus} from "../redux/actions/socketActions";
import {
    setBlackScore,
    setBlackTime,
    setCurrentFEN, setDrawProposedColor,
    setOpponentStatus, setWhiteScore,
    setWhiteTime
} from "../redux/actions/gameActions";
import {board} from "../components/PlayGameScreen/Game/Main";
import {toast} from "react-hot-toast";
import {generateDefenderMoves} from "../components/PlayGameScreen/Game/gameMode2_moves";

const socketPath = '';

export class SocketStatus {
    static disconnected = new SocketStatus('disconnected', '#bf3d3b');
    static connecting = new SocketStatus('connecting', '#da8b43');
    static connected = new SocketStatus('connected', '#369257');
    static authorized = new SocketStatus('connected and authorized', '#369257');
    static unknown = new SocketStatus('unknown', '#69aca2');


    constructor(name, color) {
        this.name = name;
        this.color = color;
    }

    static getStatusFromString(status_name) {
        switch (status_name) {
            case 'disconnected':
                return SocketStatus.disconnected;
            case 'connecting':
                return SocketStatus.connecting;
            case 'connected':
                return SocketStatus.connected;
            case 'connected and authorized':
                return SocketStatus.authorized
            default:
                return SocketStatus.unknown;
        }
    }

    toString() {
        return this.name;
    }
}

export default class SocketClient {

    constructor() {
        this.timeout = 250;
        this.socket = null;
        this.is_connected = false;
        this.is_authorized = false;
        this.ping = 1000;
    }

    disconnect() {
        return new Promise((resolve) => {
            this.socket.disconnect(() => {
                this.is_authorized = false;
                this.is_connected = false;
                resolve();
            });
        });
    }

    emit(event, data) {
        if (!this.is_authorized) this.authorize();

        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');
            return this.socket.emit(event, data, (response) => {
                if (response && response.error) {
                    console.error(response.error);
                    return reject(response.error);
                }
                return resolve();
            });
        });
    }

    async authorizeFromDispatch(userId, sessionToken) {
        if (!this.is_authorized) {
            //don't try to auth if user is yet to log in
            if (sessionToken === 'none' || userId === undefined) {
                return;
            }

            let authData = {
                userId: userId,
                sessionToken: sessionToken
            };

            this.socket.emit('authorize', authData);
        }
    }

    //authenticate client's socket
    async authorize() {
        if (!this.is_authorized) {
            const storeState = store.getState();
            let userId = storeState.user.userId;
            let sessionToken = storeState.user.sessionToken;

            //don't try to auth if user is yet to log in
            if (sessionToken === 'none' || userId === undefined) {
                return;
            }

            let authData = {
                userId: userId,
                sessionToken: sessionToken
            };

            this.socket.emit('authorize', authData);
        }
    }

    gameListeners() {
        this.on("make_move_local_ai", data => {
            makeOpponentMove(data.startingSquare,data.targetSquare,data.mType)
        });

        this.on("make_move_local", data => {
            if (data === undefined) return;
            makeOpponentMove(data.startingSquare, data.targetSquare, data.mtype);
        });

        this.on("illegal_move", data => {
            if (data === undefined) return;

            board.setFenByRejectedMove(data.startingSquare, data.targetSquare)
        })

        this.on("make_AI_move_local", data => {
            if (data === undefined) return;
            board.setFenByRejectedMove(data.startingSquare, data.targetSquare)
        })

        this.on("place_defender_piece_local", data => {
            if (data === undefined) return;
            board.FEN = data.FEN;
            board.loadFen();
            store.dispatch(setCurrentFEN(data.FEN))
            store.dispatch(setWhiteScore(data.whiteScore));
            store.dispatch(setBlackScore(data.blackScore));
            generateDefenderMoves(board.grid);
        });

        this.on('update_opponents_socket_status', data => {
            if (data === undefined) return;

            let opp_status = SocketStatus.getStatusFromString(data.status)
            store.dispatch(setOpponentStatus(opp_status))
        });

        this.on('update_timers', data => {
            if (data === undefined) return;
            store.dispatch(setWhiteTime(data.whiteTime))
            store.dispatch(setBlackTime(data.blackTime))
        });

        this.on("draw_response", data => {
            if (data === undefined) return;
            if (data.accepted == false) {
                toast.error("Draw proposal declined");
            }
            store.dispatch(setDrawProposedColor(null));
        })

    }

    authListeners() {
        this.on('authorized', () => {
            this.is_authorized = true;
            store.dispatch(setSocketStatus(SocketStatus.authorized));
        });
        this.on('unauthorized', () => {
            this.is_authorized = false;
            window.location.reload(true); //reload to reroute to loginpage
        });
    }


    //custom event handler, executes given function on event
    on(event, fun) {
        // //do not double register events
        // if (this.socket && this.socket._callbacks && this.socket._callbacks['$'+event] !==undefined){
        //     return
        // }

        return new Promise((resolve, reject) => {
            if (!this.socket) return reject('No socket connection.');
            this.socket.on(event, fun);
            resolve();
        });
    }

    //establishes the connect with the websocket and also ensures constant reconnection if connection closes
    connect = () => {
        this.socket = io.connect(API_URL, {path: socketPath});
        let that = this;
        let connectInterval;
        store.dispatch(setSocketStatus(SocketStatus.connecting));

        this.socket.on('disconnect', (reason) => {

            this.is_connected = false
            this.is_authorized = false;
            store.dispatch(setSocketStatus(SocketStatus.disconnected));
            that.timeout = that.timeout + that.timeout; //increment retry interval
            //call check function after timeout
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
        });

        this.socket.on('connect', () => {
            this.is_connected = true;
            store.dispatch(setSocketStatus(SocketStatus.connected));
            that.timeout = 500; // reset timer to 250 on open of websocket connection
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
            this.authorize();
        });

        this.socket.on('connect_error', (reason) => {


            this.is_connected = false;
            this.is_authorized = false;
            store.dispatch(setSocketStatus(SocketStatus.disconnected));
            that.timeout = that.timeout + that.timeout; //increment retry interval
            //call check function after timeout
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
        });

        this.authListeners();
        this.gameListeners();
    };

    //connect to check if the connection is closed, if so attempts to reconnect
    check = () => {
        //check if websocket instance is closed, if so call `connect` function.
        if (!this.socket || this.is_connected === false) this.connect();
    };
}
