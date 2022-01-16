import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LogRegForm.css";
import "../../../serverLogic/APIConfig.js"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from 'react-router-dom';
import {check2FaCode, login, logout, reSentActivationEmail} from "../../../serverLogic/LogRegService"
import {connect} from 'react-redux'
import {setSessionToken, setUserElo, setUserId, setUsername} from "../../../redux/actions/userActions";
import Dots from "../../CommonComponents/Dots";

function LoginForm({dispatch}) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState("");
    const [isTwoFaUsed, setIsTwoFaUsed] = useState(false);
    const [isAccountActivated, setIsAccountActivated] = useState(true);
    const [reSentResult, setReSentResult] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [feedBack, setFeedback] = useState("");
    const togglePasswordVisiblity = () => {
        setPasswordShown(!passwordShown);
    };
    const eye = <FontAwesomeIcon icon={faEye}/>;

    //routing after succesfull login
    const history = useHistory();
    const routeToNext = () => history.push('/');


    //if this component is mounted the user must be logedout
    function componentDidMount() {
        logout();
    }

    async function HandleSubmit(event) {
        event.preventDefault();
        //reset error message
        setErrorMessage("");

        const response = await login(username, password, "")

        if (response['error'] === undefined) {
            setIsAccountActivated(response['accountActivated'])

            if (response['accountActivated']) {
                setIsTwoFaUsed(response['twoFa'])

                if (response['twoFa']) {
                    if (twoFaCode !== "" && await CheckTwoFaCode()) {
                        await ForwardAfterLogin(await login(username, password, twoFaCode));
                    }
                } else {
                    await ForwardAfterLogin(response);
                }
            }
        } else {
            setErrorMessage(response['error'])
        }
    }

    async function ForwardAfterLogin(resp) {
        if (resp.error !== undefined) {
            setErrorMessage(resp.error);
            return;
        }

        dispatch(setUserId(resp.userId));
        dispatch(setUsername(username));
        dispatch(setUserElo(resp.userElo));
        dispatch(setSessionToken(resp.sessionToken));
        routeToNext();
    }

    async function CheckTwoFaCode() {
        const response = await check2FaCode(twoFaCode, username)

        if (!response['result']) {
            setErrorMessage("Two authentication code is incorrect");
        }

        return response['result'];
    }

    async function reSentEmail() {
        const response = await reSentActivationEmail(username);
        setReSentResult(response['result'] === "ok" ? "Activation email has been successfully resent" :
            `Error occurred while trying to resent activation email: ${response['result']}`);

        setTimeout(() => {
            setReSentResult("")
        }, 2500)
    }

    function AssignTwoFaCode(value) {
        if (value.length <= 6) {
            setTwoFaCode(value);
        }
    }

    return (
        <div className="LogRegForm">
            <Form>
                <Form.Control
                    required
                    placeholder="Username..."
                    type="text"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                />

                <div className="pass-wrapper">
                    <Form.Control
                        required
                        placeholder="Password..."
                        type={passwordShown ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <i
                        onClick={togglePasswordVisiblity}
                        style={{color: passwordShown ? 'var(--primary-color)' : 'var(--body-color)'}}
                    >{eye}</i>
                </div>

                {isTwoFaUsed ?
                    <Form.Control
                        className="twoFaField"
                        required
                        placeholder="2FA code..."
                        type="number"
                        value={twoFaCode}
                        onChange={(e) => AssignTwoFaCode(e.target.value)}
                    /> : null}

                <div className="response">
                    {errorMessage !== "" ? <span className="errorMessage">{errorMessage}</span> :
                        feedBack !== "" && <span className="feedbackMessage">{feedBack}</span>}
                </div>
                {isAccountActivated ?
                    <Button onClick={HandleSubmit} type="submit">LOGIN</Button> :
                    <div className="notActivatedAccountContainer">
                        <p>Account has not been activated</p>
                        <p>You can activate your account by clicking on link sent in email while registration</p>
                        <Button onClick={reSentEmail} type="submit">Resent activation email</Button>
                        {reSentResult !== "" ? <p>{reSentResult}</p> : null}
                    </div>}
            </Form>
        </div>
    );
}

// Connect Redux to React
export default connect()(LoginForm)
