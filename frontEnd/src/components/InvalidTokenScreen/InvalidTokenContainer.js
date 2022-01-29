import {useHistory, useLocation} from "react-router-dom";
import React, {useEffect} from "react";
import "./InvalidToken.css";


export default function InvalidTokenContainer({dispatch}) {
    let {search} = useLocation();
    const token = (new URLSearchParams(search)).get('token')

    //routing after successfully setting new password
    const history = useHistory();
    const routeToNext = () => history.push('/');

    useEffect(() => {
        if (token === null) {
            routeToNext();
        }
    }, [])

    return <>
        <h1 className="InvalidTokenEntrance">Invalid token</h1>
        <div className="InvalidTokenContainer p">
            <p>Provided token is invalid or it has expired</p>
            <br/>
            <p>Your request cannot be completed</p>
            <br/>
            <p>Please request new token for your request and try again</p>
        </div>
        <p className="ProvidedToken">Provided token:</p>
        <div className="Token">{token}</div>
    </>
}
