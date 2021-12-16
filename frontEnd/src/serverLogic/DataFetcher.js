import {API_URL} from "./APIConfig";
import {logout} from "./LogRegService"
import {store} from "../index";
import {setSessionToken} from "../redux/actions/userActions";

export const FETCH_DEBUGGING_MODE= true;

export async function getSessionToken() {
    try {
        const storeState=store.getState();
        let userId=storeState.user.userId;

        if(userId===null) return {status:400};

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            timeout: 1000000,
            credentials: 'include'
        };

        const response = await fetchWithTimeout(API_URL + '/refresh_session?userId='+userId, requestOptions);
        const respBody= await response.text();
        const respObj = JSON.parse(respBody);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);

        //save gotten session token to store
        if(response.status===200){
            await store.dispatch(setSessionToken(respObj.sessionToken));
            return respObj;
        }

        //invalid refresh token
        logout();
        return respObj;

    } catch (error) {
        console.log(error);
        console.log(error.name === 'AbortError');
        return undefined;
    }
}

export async function getMatchHistory(userId,sessionToken) {

    try {
        //if session token expired/is not available, try getting a new one
        if(sessionToken==='none'){
           let resp= await getSessionToken();
           sessionToken= resp.sessionToken;
        }


        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
            timeout: 1000000
        };

        const response = await fetchWithTimeout(API_URL + '/match_history?userId=' + userId, requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
    }
}

export async function getGameIsInGame(userId,sessionToken){
    try {
        //if session token expired/is not available, try getting a new one
        if(sessionToken==='none'){
            let resp= await getSessionToken();
            sessionToken= resp.sessionToken;
        }

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
            timeout: 6000
        };

        const response = await fetchWithTimeout(API_URL + '/is_in_game?userId=' + userId, requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
    }
}

export async function getGameInfo(gameRoomId, sessionToken) {
    try {
        //if session token expired/is not available, try getting a new one
        if(sessionToken==='none'){
            let resp= await getSessionToken();
            sessionToken= resp.sessionToken;
        }

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
            timeout: 6000
        };

        const response = await fetchWithTimeout(API_URL + '/get_game_info?gameRoomId='+gameRoomId, requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
    }
}

export async function getPlayerStats(userId,sessionToken) {
    try {
        //if session token expired/is not available, try getting a new one
        if(sessionToken==='none'){
            let resp= await getSessionToken();
            sessionToken= resp.sessionToken;
        }

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
            timeout: 600000
        };

        const response = await fetchWithTimeout(API_URL + '/player_stats?userId=' + userId, requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
    }
}

//prevent networkerrors from crashing fetch requests
export async function fetchWithTimeout(resource, options) {
    const {timeout = 8000} = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);

    if( response===false || response ===undefined){
        return {error: 'Network connection error'};
    }
    return response;
}

//returns an HTTP Authorization header containing the Json Web Token (JWT) of the currently logged in user
export function authHeader(sessionToken) {
    // return authorization header with jwt token
    if (sessionToken) {
        return {'Authorization': sessionToken};
    } else {
        return {'Authorization': 'none'};
    }
}

export function handleResponse(response) {
    if(response.status ===401){
        //try getting a new session token
        getSessionToken().then((response)=>{
            if(response.status===200) return;
            logout();
        })
    }

    return response.text().then(text => {
        const data = text && JSON.parse(text);
        return data;
    });
}