import Form from "react-bootstrap/Form";
import "./DeleteAccount.css";
import React, {useState} from "react";
import {connect} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import {store} from "../../../../../index";
import {disconnectSocket, setSocketStatus} from "../../../../../redux/actions/socketActions";
import {useHistory} from "react-router-dom";
import {deleteUserAccount} from "../../../../../serverCommunication/LogRegService";
import {SocketStatus} from "../../../../../serverCommunication/WebSocket";
import {Modal} from "react-bootstrap";


function DeleteAccount(props) {
    const [password, setPassword] = useState("");
    const [passwordShown, setPasswordShown] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteResult, setDeleteResult] = useState("");
    const [twoFaCode, setTwoFaCode] = useState("");
    const [showConfirmInfo, setShowConfirmInfo] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(!passwordShown);
    };

    const history = useHistory();
    const eye = <FontAwesomeIcon icon={faEye}/>;

    async function onDeleteClicked(event) {
        event.preventDefault()

        setShowConfirmInfo(false);

        if (password !== "") {
            const response = await deleteUserAccount(password, twoFaCode, props.is2FaEnabled)

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
        <Modal
            show={showConfirmInfo}
            backdrop="static"
            keyboard={false}
            centered={true}
            dialogClassName="modal"
        >
            <Modal.Header>
                <Modal.Title>Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                You requested account removal.
                <br/>
                <br/>
                This operation cannot be undone and you will not be able to login at this account anymore.
                <br/>
                <br/>
                Please confirm account removal by clicking one of the buttons below.
                <br/>
                <br/>
            </Modal.Body>
            <Modal.Footer>
                <div className="AccountDeleteButtons">
                    <Button
                        variant="primary"
                        onClick={onDeleteClicked}
                    >I CONFIRM account removal</Button>
                    <Button
                        variant="primary"
                        onClick={() => setShowConfirmInfo(false)}
                    >I REFUSE account removal</Button>
                </div>
            </Modal.Footer>
        </Modal>

        <div className="DeleteAccountContainer">
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
            {props.is2FaEnabled ?
                <Form.Control
                    className="TwoFaCodeInput"
                    required
                    placeholder="2FA code..."
                    type="text"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value)}
                /> : null}
            <p>{deleteResult}</p>
            <Button onClick={() => setShowConfirmInfo(true)} type="submit">DELETE ACCOUNT</Button>
        </div>
        <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
            <ul>{errorMessage}</ul>
        </div>
    </>
}

export default connect()(DeleteAccount)
