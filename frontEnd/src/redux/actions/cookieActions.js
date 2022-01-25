export const UPDATE_BEHAVIOUR= 'UPDATE_BEHAVIOUR'
export const TOOGLE_CONSENT ='TOOGLE_CONSENT';
export const ACCEPT_ALL_COOKIES='ACCEPT_ALL_COOKIES';
export const SET_PREFERENCES_OPEN='SET_PREFERENCES_OPEN'


export const updateBehaviour = () => ({
    type: UPDATE_BEHAVIOUR,
})
export const acceptAllCookies = () => ({
    type: ACCEPT_ALL_COOKIES,
})

export const toogleConsent= (cookieType)=>({
    type: TOOGLE_CONSENT,
    payload: cookieType
})

export const setPreferencesOpen= (isOpen)=>({
    type: SET_PREFERENCES_OPEN,
    payload: isOpen
})