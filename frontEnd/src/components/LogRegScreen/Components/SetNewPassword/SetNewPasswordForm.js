import Form from "react-bootstrap/Form";
import React, {useEffect, useState} from "react";
import Button from "react-bootstrap/Button";
import {connect} from "react-redux";
import "./SetNewPassword.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {useHistory, useLocation} from "react-router-dom";
import {setNewPassword} from "../../../../serverCommunication/LogRegService";


function SetNewPasswordForm({dispatch}) {
    let { search } = useLocation();
    const token = (new URLSearchParams(search)).get('token')

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [newPasswordRequestResult, setNewPasswordRequestResult] = useState("");

    //for checking password requirments
    const minPassLength = 6;
    const maxPassLength = 50;
    const [isPasswordLongEnough, setIsPasswordLongEnough] = useState(false);
    const [isPasswordTooLong, setIsPasswordTooLong] = useState(false);
    const [passwordContainsUppercase, setPasswordContainsUppercase] = useState(false);
    const [passwordContainsNumber, setPasswordContainsNumber] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState(false);

    //for checking conf password
    const [arePasswordsEqual, setArePasswordsEqual] = useState(false);

    //controlling showPass behaiour
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePasswordVisiblity = () => {
        setPasswordShown(!passwordShown);
    };
    const eye = <FontAwesomeIcon icon={faEye}/>;

    const successColor = 'var(--success-color)';
    const failColor = 'var(--fail-color)';

    //routing after successfully setting new password
    const history = useHistory();
    const routeToNext = () => history.push('/');

    useEffect(() => {
        if (token === null) {
            routeToNext();
        }
    }, [])

    function hasNumber(string) {
        return /\d/.test(string);
    }

    function hasUppercase(string) {
        return /[A-Z]/.test(string);
    }

    function checkPassword(pass) {
        setPassword(pass);
        confirmPassword === pass ? setArePasswordsEqual(true) : setArePasswordsEqual(false);

        pass.length >= minPassLength ? setIsPasswordLongEnough(true) : setIsPasswordLongEnough(false)
        pass.length > maxPassLength ? setIsPasswordTooLong(true) : setIsPasswordTooLong(false)
        hasNumber(pass) ? setPasswordContainsNumber(true) : setPasswordContainsNumber(false)
        hasUppercase(pass) ? setPasswordContainsUppercase(true) : setPasswordContainsUppercase(false)

        setIsValidPassword(isPasswordLongEnough && passwordContainsNumber && passwordContainsUppercase && arePasswordsEqual)
    }

    function checkPasswordConfirm(confPassword) {
        setConfirmPassword(confPassword);
        if (confPassword.length === 0) {
            setArePasswordsEqual(false);
            return;
        }
        confPassword === password ? setArePasswordsEqual(true) : setArePasswordsEqual(false);
    }

    function ValidateData() {
        let errors = []

        if (!isPasswordLongEnough) errors.push("password too short");
        if (isPasswordTooLong) errors.push("password too long");
        if (!passwordContainsUppercase) errors.push("password without upperCase");
        if (!passwordContainsNumber) errors.push("password without a number");
        if (!arePasswordsEqual) errors.push("passwords don't match");

        return errors;
    }

    async function SetNewPassword(event) {
        event.preventDefault();
        //reset error message
        setErrorMessage("");

        //check if all data matches requirments
        let errors = ValidateData();

        if (errors.length !== 0) {
            let errorList = errors.map(error => <li key={error}>{error}</li>);
            setErrorMessage(errorList);

            setTimeout(() => {
                setErrorMessage("")
            }, 5000)

            return;
        }

        const response = await setNewPassword(token, password);

        if (response['error'] === undefined) {
            setNewPasswordRequestResult(response['response'] === 'OK' ? "Password has been successfully changed" :
                `Error occurred while creating password: ${response['response']}`)

            setTimeout(() => {
                setNewPasswordRequestResult("");
                routeToNext();
            }, 5000);
        } else {
            setErrorMessage(response['error'])
        }
    }

    return (
        <div className="SetNewPasswordForm">
            <h1 className="SetNewPasswordEntrance">SET NEW PASSWORD</h1>
            <Form>
                <div className="pass-wrapper mt2">
                    <Form.Control
                        required
                        placeholder="Password..."
                        type={passwordShown ? "text" : "password"}
                        value={password}
                        onChange={(e) => checkPassword(e.target.value)}
                    />
                    <i
                        onClick={togglePasswordVisiblity}
                        style={{color: passwordShown ? 'var(--primary-color)' : 'var(--body-color)'}}
                    >
                        {eye}
                    </i>
                </div>
                <p>Must be at least
                    <span
                        style={{color: isPasswordLongEnough ? successColor : failColor}}> {minPassLength} characters </span> long,
                    include
                    <span style={{color: passwordContainsNumber ? successColor : failColor}}> a number</span> and an
                    <span style={{color: passwordContainsUppercase ? successColor : failColor}}> uppercase letter</span>.
                </p>

                <Form.Control
                    required
                    placeholder="Confirm password..."
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => checkPasswordConfirm(e.target.value)}
                    style={{background: arePasswordsEqual ? successColor : failColor}}
                />

                <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                    <ul>{errorMessage}</ul>
                </div>

                <Button onClick={SetNewPassword}>Set new password</Button>
                {newPasswordRequestResult !== "" ? <p>{newPasswordRequestResult}</p> : null}
            </Form>
        </div>
    );
}

export default connect()(SetNewPasswordForm)
