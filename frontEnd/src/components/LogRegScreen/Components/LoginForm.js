import React, {useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./LogRegForm.css";
import "../../../serverLogic/APIConfig.js"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from 'react-router-dom';
import {login, logout} from "../../../serverLogic/LogRegService"
import {connect} from 'react-redux'
import {setSessionToken, setUserElo, setUserId, setUsername} from "../../../redux/actions/userActions";
import Dots from "../../CommonComponents/Dots";

function LoginForm({dispatch}) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
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
        setFeedback(<span>Logging in<Dots/></span>);
        let resp = await login(username, password)

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


    return (

        <div className="LogRegForm">

            <Form onSubmit={HandleSubmit}>

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

                <div className="response">
                        {errorMessage !== "" ? <span className="errorMessage">{errorMessage}</span> :
                            feedBack!=="" && <span className="feedbackMessage">{feedBack}</span>  }
                </div>


                <Button type="submit">LOGIN</Button>
            </Form>
        </div>
    );
}

// Connect Redux to React
export default connect()(LoginForm)