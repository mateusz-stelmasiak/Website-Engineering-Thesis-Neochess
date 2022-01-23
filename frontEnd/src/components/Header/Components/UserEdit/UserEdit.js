import "./UserEdit.css";
import {connect} from "react-redux";
import Form from "react-bootstrap/Form";
import React, {useEffect, useState} from "react";
import validator from "validator";
import Button from "react-bootstrap/Button";
import "../../../CommonComponents/CircleWidget/CircleWidget.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import DeleteAccount from "./DeleteAccount/DeleteAccount";
import SectionTitle from "../../../CommonComponents/SectionTitle/SectionTitle";
import {get2FaCode} from "../../../../serverCommunication/DataFetcher";
import {logout, updateUser} from "../../../../serverCommunication/LogRegService";

function UserEditForm(props) {
    //fields in form
    const [newPassword, setNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [areEmailsEqual, setAreEmailsEqual] = useState(false);

    const [is2FaEnabled, setIs2FaEnabled] = useState(!!Number(props.is2FaEnabled));
    const [twoFaCode, setTwoFaCode] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoadingShown, setIsLoadingShown] = useState(false);

    //for checking email requirements
    const [isEmailValid, setIsEmailValid] = useState(false);

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

    useEffect(async () => {
        setQrCode((await get2FaCode(props.email))['qr_code']);
    }, [])

    //checks for all errors in data
    function validateData() {
        let errors = []
        if (!isPasswordLongEnough) errors.push("password too short");
        if (isPasswordTooLong) errors.push("password too long");
        if (!passwordContainsUppercase) errors.push("password without upperCase");
        if (!passwordContainsNumber) errors.push("password without a number");
        if (!arePasswordsEqual) errors.push("passwords don't match");
        return errors;
    }

    function hasNumber(string) {
        return /\d/.test(string);
    }

    function hasUppercase(string) {
        return /[A-Z]/.test(string);
    }

    function checkNewPassword(pass) {
        setNewPassword(pass);
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
        confPassword === newPassword ? setArePasswordsEqual(true) : setArePasswordsEqual(false);
    }

    function checkEmailConfirm(confEmail) {
        setConfirmEmail(confEmail)
        if (confEmail.length === 0) {
            setAreEmailsEqual(false);
            return;
        }
        confEmail === email ? setAreEmailsEqual(true) : setAreEmailsEqual(false);
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
            setQrCode((await get2FaCode(props.email))['qr_code']);
        }
    }

    async function handleEmailChange(event) {
        event.preventDefault()
        if (!isEmailValid) {
            setErrorMessage("Given email is invalid")
            setTimeout(() => {
                setErrorMessage("")
            }, 5000)
            return;
        }

        await handleSubmit(event);
    }

    async function handlePasswordChange(event) {
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

        await handleSubmit(event)
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (currentPassword !== "") {
            setIsLoadingShown(true)
            //if all data is correct, try to update user
            const response = await updateUser(newPassword, currentPassword, is2FaEnabled, twoFaCode, email)
            if (response === undefined) return;
            if (response.error !== undefined) {
                setErrorMessage(response.error);
                return;
            }
            if (response['response'] === "OK") {
                setTimeout(async () => {
                    await logout();
                }, 4000)
            } else {
                setErrorMessage(response['response']);
            }
        } else {
            setErrorMessage("Current password cannot be empty");
        }

        setIsLoadingShown(false);

        setTimeout(() => {
            setErrorMessage("");
        }, 3750);
    }

    function AssignTwoFaCode(value) {
        if (value.length <= 6) {
            setTwoFaCode(value);
        }
    }

    return <>
        <div className="UserEditForm">
            <h1 className="UserAccountDetailsLabel">USER: {props.username}</h1>
            <Form>
                <div className="EditFormContainer">
                    <div className="PasswordEmailContainer">
                        <div className="PasswordContainer">
                            <div className="pass-wrapper mt2">
                                <Form.Control
                                    style={{marginBottom: "25px"}}
                                    required
                                    placeholder="Current password..."
                                    type={passwordShown ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <i
                                    onClick={togglePasswordVisiblity}
                                    style={{color: passwordShown ? 'var(--primary-color)' : 'var(--body-color)'}}
                                >
                                    {eye}
                                </i>
                            </div>
                            <div className="pass-wrapper mt2">
                                <Form.Control
                                    required
                                    placeholder="New password..."
                                    type={passwordShown ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => checkNewPassword(e.target.value)}
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
                                <span
                                    style={{color: passwordContainsNumber ? successColor : failColor}}> a number</span> and
                                an
                                <span
                                    style={{color: passwordContainsUppercase ? successColor : failColor}}> uppercase letter</span>.
                            </p>

                            <Form.Control
                                required
                                placeholder="Confirm new password..."
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => checkPasswordConfirm(e.target.value)}
                                style={{background: arePasswordsEqual ? successColor : failColor}}
                            />
                            <Button
                                className="ButtonStyle"
                                onClick={handlePasswordChange} type="submit"
                            >Change password</Button>
                        </div>
                        <div className="EmailAddressContainer">
                            <Form.Control
                                className="emailField"
                                required
                                placeholder="New e-mail address..."
                                type="text"
                                value={email}
                                onChange={(e) => checkEmail(e.target.value)}
                            />
                            <Form.Control
                                className="emailField"
                                required
                                placeholder="Confirm new e-mail address..."
                                type="text"
                                value={confirmEmail}
                                style={{background: areEmailsEqual ? successColor : failColor}}
                                onChange={(e) => checkEmailConfirm(e.target.value)}
                            />
                            <Button
                                className="ButtonStyle"
                                onClick={handleEmailChange} type="submit"
                            >Change email</Button>
                        </div>
                    </div>
                    <div className="TwoFaDeleteContainer">
                        <div className="TwoFaContainer">
                            <Form.Check
                                type="checkbox"
                                label="Use 2-Factor authentication"
                                onChange={(_) => enable2FA()}
                                checked={is2FaEnabled}
                            />
                            {is2FaEnabled ?
                                <>
                                    {!props.is2FaEnabled ?
                                        <Form.Control
                                            className="twoFaForm"
                                            required
                                            placeholder="2FA code..."
                                            type="number"
                                            value={twoFaCode}
                                            onChange={(e) => AssignTwoFaCode(e.target.value)}
                                        /> : null}
                                    <img
                                        className="twoFaImg"
                                        src={`data:image/jpeg;base64,${qrCode}`}
                                        alt="qr_code"
                                    />
                                </> : null}
                            <Button
                                onClick={handleSubmit} type="submit"
                                style={{marginLeft: "20px"}}
                            >Change 2FA</Button>
                        </div>
                        <DeleteAccount
                            is2FaEnabled={props.is2FaEnabled}
                        />
                    </div>
                </div>
                <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                    <ul>{errorMessage}</ul>
                </div>
                {errorMessage === "" && isLoadingShown ?
                    <div className="updateLoadingContainer">
                        <p className="updateProgress">
                            UPDATING USER
                        </p>
                        <div className="loader"/>
                    </div> : null}
            </Form>
        </div>
    </>
}

export default connect()(UserEditForm)