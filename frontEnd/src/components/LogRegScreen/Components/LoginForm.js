import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LogRegForm.css";
import "../../../serverCommunication/APIConfig.js"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from 'react-router-dom';
import {check2FaCode, login, logout, reSentActivationEmail} from "../../../serverCommunication/LogRegService"
import {connect} from 'react-redux'
import {setSessionToken, setUserElo, setUserId, setUsername} from "../../../redux/actions/userActions";
import ForgotPasswordForm from "../../Header/Components/AccountManagement/ForgotPassword/ForgotPasswordForm";
import {toast} from "react-hot-toast";
import "./ActivateAccountPopup.css"


function LoginForm({dispatch}) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState("");
    const [isTwoFaUsed, setIsTwoFaUsed] = useState(false);
    const [isAccountActivated, setIsAccountActivated] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [feedBack, setFeedback] = useState("");
    const [forgotPassword, setForgotPassword] = useState(false);

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

        if (response['twoFa'] && twoFaCode !== "" || !isTwoFaUsed) {
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
        } else {
            setErrorMessage("Two authentication code cannot be empty")
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
        const response = await check2FaCode(twoFaCode, username, "")

        if (!response['response']) {
            setErrorMessage("Two authentication code is incorrect");
        }

        return response['response'];
    }


    function AssignTwoFaCode(value) {
        if (value.length <= 6) {
            setTwoFaCode(value);
        }
    }

    let dismissToast = (toastId) => {
        toast.dismiss(toastId)
        setIsAccountActivated(true)
    }

    let resentEmail = (username, toastId) => {
        dismissToast(toastId)
        reSentActivationEmail(username)
    }

    useEffect(() => {
        //toast activate account popup
        if (isAccountActivated === false) {
            let toastDuration = 4000;

            toast.custom((t) => (
                    <div className="ActivateAccountPopup">
                        <div className="ActivateAccountPopup-text">
                            <span>Account has not been activated!</span>
                            <span id="secText">click the link in email to activate</span>
                        </div>

                        <div className="ActivateAccountPopup-buttons">
                            <button id="resend" onClick={() => resentEmail(username, t.id)}>RESEND EMAIL</button>
                            <button id="dismiss" onClick={() => dismissToast(t.id)}>DISMISS</button>
                        </div>
                    </div>),
                {
                    duration: 4000
                });

            //set account activated to false after disapears
            setTimeout(() => setIsAccountActivated(true), toastDuration)
        }

    }, [isAccountActivated])


    return (
        <>
            {!forgotPassword ?
                <div className="LogRegForm">
                    <Form>
                        <div className="input-wrapper">
                            <Form.Control
                                required
                                placeholder="Username..."
                                type="text"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>

                        <div className="input-wrapper">
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

                        {isTwoFaUsed &&
                        <div className="input-wrapper">
                            <Form.Control
                                className="twoFaField"
                                required
                                placeholder="2FA code..."
                                type="text"
                                value={twoFaCode}
                                onChange={(e) => setTwoFaCode(e.target.value)}
                            />
                        </div>
                        }

                        <div className="response">
                            {errorMessage !== "" ? <span className="errorMessage">{errorMessage}</span> :
                                feedBack !== "" && <span className="feedbackMessage">{feedBack}</span>}
                        </div>

                        <div className="loginContainer">
                            <Button onClick={HandleSubmit} type="submit">LOGIN</Button>
                            <a
                                className="forgotPassword"
                                onClick={() => setForgotPassword(true)}
                            >
                                Forgot password?
                            </a>
                        </div>


                    </Form>
                </div>
                :
                <ForgotPasswordForm/>
            }
        </>);
}

// Connect Redux to React
export default connect()(LoginForm)
