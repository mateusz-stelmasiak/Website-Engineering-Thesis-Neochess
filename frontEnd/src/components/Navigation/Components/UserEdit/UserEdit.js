import "./UserEdit.css";
import {connect} from "react-redux";
import Form from "react-bootstrap/Form";
import React, {useEffect, useState} from "react";
import validator from "validator";
import Button from "react-bootstrap/Button";
import "../../../CommonComponents/CircleWidget/CircleWidget.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {get2FaCode} from "../../../../serverLogic/DataFetcher";
import {
    check2FaCode,
    logout,
    updateUser
} from "../../../../serverLogic/LogRegService";
import DeleteAccount from "./DeleteAccount/DeleteAccount";

function UserEditForm(props) {
    //fields in form
    const [username, setUserName] = useState(props.username?.toString());
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState(props.email.toString());
    const [is2FaEnabled, setIs2FaEnabled] = useState(!!Number(props.is2FaEnabled));
    const [twoFaCode, setTwoFaCode] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoadingShown, setIsLoadingShown] = useState(false);

    //for checking email requirements
    const [isEmailValid, setIsEmailValid] = useState(true);

    //for checking username requirements
    const minUsernameLength = 4;
    const maxUsernameLength = 15;
    const [usernameContainsWhitespace, setUsernameContainsWhitespace] = useState(false);
    const [isUsernameLongEnough, setIsUsernameLongEnough] = useState(true);
    const [isUsernameTooLong, setIsUsernameTooLong] = useState(false);
    const [isUsernameTaken,] = useState(false);
    const [isValidUsername, setIsValidUsername] = useState(true);

    //for checking password requirments
    const minPassLength = 6;
    const maxPassLength = 50;
    const [isPasswordLongEnough, setIsPasswordLongEnough] = useState(true);
    const [isPasswordTooLong, setIsPasswordTooLong] = useState(false);
    const [passwordContainsUppercase, setPasswordContainsUppercase] = useState(true);
    const [passwordContainsNumber, setPasswordContainsNumber] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);

    //for checking conf password
    const [arePasswordsEqual, setArePasswordsEqual] = useState(true);

    //controlling showPass behaiour
    const [passwordShown, setPasswordShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(!passwordShown);
    };

    const eye = <FontAwesomeIcon icon={faEye}/>;

    const successColor = 'var(--success-color)';
    const failColor = 'var(--fail-color)';

    useEffect(async () => {
        setQrCode((await get2FaCode(email))['qr_code']);
    }, [])

    //checks for all errors in data
    function validateData() {
        if (isValidUsername && isValidPassword) return "";

        let errors = []
        if (!isUsernameLongEnough) errors.push("username too short");
        if (isUsernameTooLong) errors.push("username too long")
        if (usernameContainsWhitespace) errors.push("username with whitespace");
        if (isUsernameTaken) errors.push("username taken");
        if (!isPasswordLongEnough) errors.push("password too short");
        if (isPasswordTooLong) errors.push("password too long");
        if (!passwordContainsUppercase) errors.push("password without upperCase");
        if (!passwordContainsNumber) errors.push("password without a number");
        if (!arePasswordsEqual) errors.push("passwords don't match");
        if (!isEmailValid) errors.push("email is incorrect");

        return errors;
    }

    function hasNumber(string) {
        return /\d/.test(string);
    }

    function hasUppercase(string) {
        return /[A-Z]/.test(string);
    }

    function hasWhiteSpace(string) {
        return /[\s]/.test(string);
    }

    function checkPassword(pass) {
        setPassword(pass);
        confirmPassword === pass ? setArePasswordsEqual(true) : setArePasswordsEqual(false);
        pass.length >= minPassLength ? setIsPasswordLongEnough(true) : setIsPasswordLongEnough(false)
        pass.length > maxPassLength ? setIsPasswordTooLong(true) : setIsPasswordTooLong(false)
        hasNumber(pass) ? setPasswordContainsNumber(true) : setPasswordContainsNumber(false)
        hasUppercase(pass) ? setPasswordContainsUppercase(true) : setPasswordContainsUppercase(false)

        setIsValidPassword(
            isPasswordLongEnough
            && passwordContainsNumber
            && passwordContainsUppercase
            && arePasswordsEqual
        )
    }

    function checkPasswordConfirm(confPassword) {
        setConfirmPassword(confPassword);
        if (confPassword.length === 0) {
            setArePasswordsEqual(false);
            return;
        }
        confPassword === password ? setArePasswordsEqual(true) : setArePasswordsEqual(false);
    }

    function checkUsername(username) {
        setUserName(username);
        hasWhiteSpace(username) ? setUsernameContainsWhitespace(true) : setUsernameContainsWhitespace(false);
        username.length >= minUsernameLength ? setIsUsernameLongEnough(true) : setIsUsernameLongEnough(false);
        username.length > maxUsernameLength ? setIsUsernameTooLong(true) : setIsUsernameTooLong(false);
        setIsValidUsername(!usernameContainsWhitespace && isUsernameLongEnough)
    }

    function checkEmail(email) {
        setEmail(email);
        if (validator.isEmail(email)) {
            setIsEmailValid(true)
        } else {
            setIsEmailValid(false)
        }
    }

    async function enable2FA() {
        if (is2FaEnabled) {
            setIs2FaEnabled(false)
        } else {
            setIs2FaEnabled(true)
            setQrCode((await get2FaCode(email))['qr_code']);
        }
    }

    async function handleSubmit(event) {
        setIsLoadingShown(true)
        event.preventDefault();
        //reset error message
        setErrorMessage("");

        //check if all data matches requirments
        const errors = validateData();

        if (errors.length !== 0) {
            setIsLoadingShown(false);
            const errorList = errors.map(error => <li key={error}>{error}</li>);
            setErrorMessage(errorList);
            setTimeout(() => {
                setErrorMessage("")
            }, 5000)
            return;
        }

        //if all data is correct, try to update user
        const resp = await updateUser(username, password, is2FaEnabled, twoFaCode, email)
        if (resp === undefined) return;
        if (resp.error !== undefined) {
            setErrorMessage(resp.error);
            return;
        }
        setTimeout(async () => {
            await logout();
        }, 4000)
    }

    async function CheckTwoFaCode() {
        const response = await check2FaCode(twoFaCode, username)

        if (!response['result']) {
            setErrorMessage("Two authentication code is incorrect. Go to login page and try again");
        }

        return response['result'];
    }

    function AssignTwoFaCode(value) {
        if (value.length <= 6) {
            setTwoFaCode(value);
        }
    }

    return <>
        <div className="UserEditForm">
            <h1>USER: {username}</h1>
            <Form>
                <Form.Control
                    required
                    placeholder="Username..."
                    type="text"
                    value={username}
                    onChange={(e) => checkUsername(e.target.value)}
                />

                <p>Must be at least
                    <span
                        style={{color: isUsernameLongEnough ? successColor : failColor}}> {minUsernameLength} characters </span>
                    long, and
                    <span style={{color: !usernameContainsWhitespace ? successColor : failColor}}> not contain whitespace</span> characters.
                </p>

                <div className="pass-wrapper mt2">
                    <Form.Control
                        required
                        placeholder="New password..."
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
                    placeholder="Confirm new password..."
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => checkPasswordConfirm(e.target.value)}
                    style={{background: arePasswordsEqual ? successColor : failColor}}
                />

                <Form.Control
                    className="emailField"
                    required
                    placeholder="e-mail address..."
                    type="text"
                    value={email}
                    onChange={(e) => checkEmail(e.target.value)}
                />
                <div style={{marginTop: "25px", display: "flex"}}>
                    <div>
                        <Form.Check
                            type="checkbox"
                            label="Use 2-Factor authentication"
                            onChange={(_) => enable2FA()}
                            checked={is2FaEnabled}
                        />
                        {is2FaEnabled ?
                            <>
                                <Form.Control
                                    className="twoFaForm"
                                    required
                                    placeholder="2FA code..."
                                    type="number"
                                    value={twoFaCode}
                                    onChange={(e) => AssignTwoFaCode(e.target.value)}
                                />

                                <img
                                    className="twoFaImg"
                                    src={`data:image/jpeg;base64,${qrCode}`}
                                />
                            </> : null}
                        <Button
                            onClick={handleSubmit} type="submit"
                            style={{marginLeft: "20px"}}
                        >Submit</Button>
                    </div>
                    <DeleteAccount/>
                </div>

                <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                    <ul>{errorMessage}</ul>
                </div>
                {errorMessage === "" && isLoadingShown ?
                    <div className="registerLoadingContainer">
                        <p className="registeringProgress">
                            UPDATING USER
                        </p>
                        <div className="loader"/>
                    </div> : null}
            </Form>
        </div>
    </>
}

export default connect()(UserEditForm)
