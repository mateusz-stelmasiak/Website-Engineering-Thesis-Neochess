import {sha256} from "js-sha256";
import {API_URL} from "./APIConfig";
import {handleResponse, fetchWithTimeout, FETCH_DEBUGGING_MODE, authHeader, getSessionToken} from "./DataFetcher"
import {store} from "../index";
import {GAME_DEBUGING_MODE} from "../App";
import {disconnectSocket, setSocketStatus} from "../redux/actions/socketActions";
import {SocketStatus} from "./WebSocket";

function hashRecoveryCodes(recoveryCodes) {
    let hashedRecoveryCodes = [];
    recoveryCodes.forEach(c => hashedRecoveryCodes.push(sha256(c)))
    return hashedRecoveryCodes
}

export function generateRecoveryCodes() {
    const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*;?";
    let recoveryCodes = [];
    for (let i = 0; i < 16; i++) {
        let code = ""
        for (let j = 0; j < 16; j++) {
            code += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
        }
        recoveryCodes.push(code);
    }
    return recoveryCodes;
}

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
        return {error: 'Network connection error'};
    }
}

export async function getUserData() {
    try {
        const storeState = store.getState();
        const userId = storeState.user.userId;
        const sessionToken = storeState.user.sessionToken;

        if (sessionToken == 'none' || userId===undefined) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
            return;
        }

        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            headers: authHeader(sessionToken),
            timeout: 600000
        }

        const response = await fetchWithTimeout(API_URL + '/getUserDetails?id=' + userId, requestOptions);
        const responseObj = await handleResponse(response)
        if (FETCH_DEBUGGING_MODE) console.log(response);
        return responseObj;
    } catch (error) {

    }
}

export async function deleteUserAccount(password, twoFaCode, isTwoFaEnabled) {
    try {
        const storeState = store.getState();
        const userId = storeState.user.userId;
        const sessionToken = storeState.user.sessionToken;

        const hashedPassword = sha256(password);

        if (sessionToken == 'none' || userId===undefined) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
            return;
        }

        const requestOptions = {
            method: 'DELETE',
            mode: 'cors',
            headers: {
                ...{
                    'Content-Type': 'application/json',
                }, ...authHeader(sessionToken)
            },
            body: JSON.stringify({
                hashedPassword,
                isTwoFaEnabled,
                twoFaCode
            })
        }

        const response = await fetchWithTimeout(API_URL + '/delete?id=' + userId, requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);
        return respObj;
    } catch (error) {

    }
}

export async function updateUser(newPassword, currentPassword, is2FaEnabled, twoFaCode, email, recoveryCodes) {
    try {
        const storeState = store.getState();
        let userId = storeState.user.userId;
        let sessionToken = storeState.user.sessionToken;

        if (sessionToken == 'none' || userId===undefined) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload(true);
            return;
        }

        const hashedNewPassword = newPassword !== "" ? sha256(newPassword) : null;
        const hashedCurrentPassword = sha256(currentPassword);
        const hashedRecoveryCodes = hashRecoveryCodes(recoveryCodes);

        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {
                ...{
                    'Content-Type': 'application/json',
                }, ...authHeader(sessionToken)
            },
            body: JSON.stringify({
                hashedNewPassword,
                hashedCurrentPassword,
                email,
                is2FaEnabled,
                twoFaCode,
                hashedRecoveryCodes
            })
        }

        const response = await fetchWithTimeout(API_URL + '/update?id=' + userId, requestOptions);
        const respObj = await handleResponse(response);

        return respObj;
    } catch (error) {

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

        return responseObj;
    } catch (error) {

    }
}

export async function check2FaCode(code, username, email) {
    try {
        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                email,
                code
            })
        };

        const response = await fetchWithTimeout(API_URL + '/check2Fa', requestOptions);
        const respObj = await handleResponse(response);


        return respObj;

    } catch (error) {

    }
}

export async function sendResetPassword(email) {
    try {
        const requestOptions = {
            method: 'GET',
            mode: 'cors',
            timeout: 600000
        }

        const response = await fetchWithTimeout(API_URL + '/forgotPassword?email=' + email, requestOptions);
        const responseObj = await handleResponse(response);

        if (FETCH_DEBUGGING_MODE) console.log(response);

        return responseObj;
    } catch (error) {
    }
}

export async function setNewPassword(token, newPassword) {
    try {
        const hashedPassword = sha256(newPassword);

        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                token,
                hashedPassword
            })
        }

        const response = await fetchWithTimeout(API_URL + '/reset', requestOptions);
        const respObj = await handleResponse(response);

        if (FETCH_DEBUGGING_MODE) console.log(respObj);

        return respObj;
    } catch (error) {

    }
}

export async function register(username, password, captcha, email, is2FaEnabled, recoveryCodes) {
    try {
        const hashedPassword = sha256(password);
        const hashedRecoveryCodes = hashRecoveryCodes(recoveryCodes);

        const requestOptions = {
            method: 'POST',
            mode: 'cors',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                hashedPassword,
                email,
                is2FaEnabled,
                captcha,
                hashedRecoveryCodes
            })
        };

        const response = await fetchWithTimeout(API_URL + '/register', requestOptions);
        const respObj = await handleResponse(response);
        if (FETCH_DEBUGGING_MODE) console.log(respObj);
        return respObj;
    } catch (error) {

        return {error: 'Network connection error'};
    }
}

export async function logout() {
    if (GAME_DEBUGING_MODE) return;

    const storeState = store.getState();
    let userId = storeState.user.userId;
    let sessionToken = storeState.user.sessionToken;

    if (sessionToken == 'none' || userId===undefined) {
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

    } catch (error) {

    }

    localStorage.clear();
    sessionStorage.clear()
    store.dispatch(setSocketStatus(SocketStatus.disconnected));
    store.dispatch(disconnectSocket());
    window.location.reload(true); //reload to reroute to loginpage
}





