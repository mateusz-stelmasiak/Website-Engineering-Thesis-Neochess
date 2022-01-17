import {sha256} from "js-sha256";
import {API_URL} from "./APIConfig";
import {handleResponse, fetchWithTimeout, FETCH_DEBUGGING_MODE, authHeader, getSessionToken} from "./DataFetcher"
import {store} from "../index";
import {GAME_DEBUGING_MODE} from "../App";
import {disconnectSocket, setSocketStatus} from "../redux/actions/socketActions";
import {SocketStatus} from "./WebSocket";

export async function login(username, password, two_fa_code) {

    try {
        let hashedPassword = sha256(password);
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({username, hashedPassword, two_fa_code})
        };

        const response = await fetchWithTimeout(API_URL + '/login', requestOptions);
        const respObj = await handleResponse(response);

        if (FETCH_DEBUGGING_MODE) console.log(respObj);
        return respObj;
    } catch (error) {
        console.log(error);
        console.log(error.name === 'AbortError');
        return {error: 'Network connection error'};
    }
}

export async function reSentActivationEmail(data) {
    try {
        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            timeout: 600000
        }

        const response = await fetchWithTimeout(API_URL + '/resent?data=' + data, requestOptions);
        const responseObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return responseObj;

    } catch (error) {
        console.log(error)
    }
}

export async function check2FaCode(code, username) {
    try {
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                code
            })
        };

        const response = await fetchWithTimeout(API_URL + '/check2Fa', requestOptions);
        const respObj = await handleResponse(response);

        if (FETCH_DEBUGGING_MODE) console.log(respObj);

        return respObj;

    } catch (error) {
        console.log(error);
    }
}

export async function sendResetPasswordRequest(email) {
    try {
        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            timeout: 600000
        }

        const response = await fetchWithTimeout(API_URL + '/resetPasswordRequest?email=' + email, requestOptions);
        const responseObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return responseObj;

    } catch (error) {
        console.log(error)
    }
}

export async function register(username, password, email, is2FaEnabled) {
    try {
        let hashedPassword = sha256(password);
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                hashedPassword,
                email,
                is2FaEnabled
            })
        };

        const response = await fetchWithTimeout(API_URL + '/register', requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);
        return respObj;
    } catch (error) {
        console.log(error.name === 'AbortError');
        return {error: 'Network connection error'};
    }
}

export async function logout() {
    if (GAME_DEBUGING_MODE) return;

    const storeState = store.getState();
    let userId = storeState.user.userId;
    let sessionToken = storeState.user.sessionToken;

    if (sessionToken == 'none' || !userId) {
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

        const response = await fetchWithTimeout(API_URL + '/logout?userId=' + userId, requestOptions);
        const respBody = await response.text();
        const respObj = JSON.parse(respBody);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);
    } catch (error) {
        console.log(error);
    }

    localStorage.clear();
    sessionStorage.clear()
    store.dispatch(setSocketStatus(SocketStatus.disconnected));
    store.dispatch(disconnectSocket());
    window.location.reload(true); //reload to reroute to loginpage
}





