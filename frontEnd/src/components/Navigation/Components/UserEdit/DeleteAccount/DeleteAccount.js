import Form from "react-bootstrap/Form";
import "../UserEdit.css";
import "./DeleteAccount.css";
import React, {useState} from "react";
import {connect} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import {deleteUserAccount} from "../../../../../serverLogic/LogRegService";
import {store} from "../../../../../index";
import {disconnectSocket, setSocketStatus} from "../../../../../redux/actions/socketActions";
import {SocketStatus} from "../../../../../serverLogic/WebSocket";
import {useHistory} from "react-router-dom";

function DeleteAccount(props) {
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteResult, setDeleteResult] = useState("")

    const togglePasswordVisiblity = () => {
        setPasswordShown(!passwordShown);
    };

    const history = useHistory();
    const eye = <FontAwesomeIcon icon={faEye}/>;

    async function onDeleteClicked(event) {
        event.preventDefault()
        if (password !== "") {
            const response = await deleteUserAccount(password)
            if (response['response'] === "OK") {
                setDeleteResult("Account has been successfully deleted");
                setTimeout(() => {
                    setDeleteResult("")

                    localStorage.clear();
                    sessionStorage.clear()
                    store.dispatch(setSocketStatus(SocketStatus.disconnected));
                    store.dispatch(disconnectSocket());
                    window.location.reload(true); //reload to reroute to loginpage

                    history.push('/')
                }, 4000);
            } else {
                setErrorMessage(response['response'])
            }
        } else {
            setErrorMessage("Password cannot be empty")
        }

        setTimeout(() => {
            setErrorMessage("")
        }, 3000)
    }

    return <>
        <div className="DeleteAccountContainer">
            <Button onClick={onDeleteClicked} type="submit">DELETE ACCOUNT</Button>
            <div className="pass-wrapper mt2">
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
                >
                    {eye}
                </i>
            </div>
            {deleteResult !== "" ? <p>{deleteResult}</p> : null}
            <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                <ul>{errorMessage}</ul>
            </div>
        </div>
    </>
}

export default connect()(DeleteAccount)
