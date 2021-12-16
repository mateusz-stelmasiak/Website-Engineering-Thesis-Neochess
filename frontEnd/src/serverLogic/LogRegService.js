import {sha256} from "js-sha256";
import {API_URL} from "./APIConfig";
import {handleResponse, fetchWithTimeout, FETCH_DEBUGGING_MODE, authHeader} from "./DataFetcher"
import {store} from "../index";
import {GAME_DEBUGING_MODE} from "../App";
import {disconnectSocket, setSocketStatus} from "../redux/actions/socketActions";
import {SocketStatus} from "./WebSocket";

export async function login(username,password){

    try {
        let hashedPassword=sha256(password);
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, hashedPassword })
        };

        const response = await fetchWithTimeout(API_URL + '/login', requestOptions);
        const respObj = await handleResponse(response);

        if (FETCH_DEBUGGING_MODE)  console.log(respObj);
        return respObj;
    } catch (error) {
        console.log(error);
        console.log(error.name === 'AbortError');
        return {error: 'Network connection error'};
    }
}

export async function register(username,password){
    try {
        let hashedPassword=sha256(password);
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({username,hashedPassword})
        };

        const response = await fetchWithTimeout(API_URL + '/register', requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE)  console.log(respObj);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
        return {error: 'Network connection error'};
    }
}

export async function logout(){
    if (GAME_DEBUGING_MODE) return;


    const storeState=store.getState();
    let userId=storeState.user.userId;
    let sessionToken=storeState.user.sessionToken;

    if(sessionToken=='none' || !userId){
        localStorage.clear();
        sessionStorage.clear();
         window.location.reload(true);
         return;
     }

    try {
        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
        };

        const response = await fetchWithTimeout(API_URL + '/logout?userId='+userId, requestOptions);
        const respBody= await response.text();
        const respObj = JSON.parse(respBody);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);
    } catch (error) {
        console.log(error);
    }

    localStorage.clear();
    sessionStorage.clear()
    store.dispatch(setSocketStatus( SocketStatus.disconnected));
    store.dispatch(disconnectSocket());
    window.location.reload(true); //reload to reroute to loginpage
}





