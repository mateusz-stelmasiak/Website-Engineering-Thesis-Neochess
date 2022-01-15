import * as actions from '../actions/cookieActions'
import ReactPixel from "react-facebook-pixel";
import {cookieTypes} from "../../components/Cookies/CookiesPage"

// Set a Cookie
export function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

export function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

export const cookiesInitialState = {
    consented: getCookie('cookie_consent') ? getCookie('cookie_consent').split(','):['podstawowe'],
    prefOpen:false
}

export default function cookieReducer(state = cookiesInitialState, action) {
    switch (action.type) {
        case actions.ACCEPT_ALL_COOKIES:
            return {...state, consented: cookieTypes};
        case actions.TOOGLE_CONSENT:
            let consentedLocal=state.consented;
            let index = consentedLocal.indexOf(action.payload);
            index !== -1 ? consentedLocal.splice(index, 1) : consentedLocal.push(action.payload);
            return {...state, consented: consentedLocal};
        case actions.UPDATE_BEHAVIOUR:
            let localCons=state.consented;
            let turnOnAnalysis = localCons.includes('analizy');
            turnOnAnalysis ? ReactPixel.grantConsent() : ReactPixel.revokeConsent();
            let consentString=localCons.join(',');
            setCookie('cookie_consent', consentString, 30);
            return state
        case actions.SET_PREFERENCES_OPEN:
            return {...state, prefOpen: action.payload};
        default:
            return state
    }
}
