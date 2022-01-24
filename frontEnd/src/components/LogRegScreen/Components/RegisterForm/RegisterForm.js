import React, {useState} from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../../../../serverCommunication/APIConfig";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import {useHistory} from "react-router-dom";
import {connect} from 'react-redux'
import ReCAPTCHA from "react-google-recaptcha";
import {get2FaCode} from "../../../../serverCommunication/DataFetcher";
import {check2FaCode, login, reSentActivationEmail, register} from "../../../../serverCommunication/LogRegService";
import validator from 'validator';
import "./RegisterForm.css";
import "../LoadingComponent.css";


function RegisterForm({dispatch}) {
    //fields in form
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [is2FaEnabled, setIs2FaEnabled] = useState(false);
    const [twoFaCode, setTwoFaCode] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoadingShown, setIsLoadingShown] = useState(false);
    const [isActivateAccountInfoShown, setIsActivateAccountInfoShown] = useState(false);
    const [reSentResult, setReSentResult] = useState("");

    //for checking email requirements
    const [isEmailValid, setIsEmailValid] = useState(false);

    //for checking username requirements
    const minUsernameLength = 4;
    const maxUsernameLength = 15;
    const [usernameContainsWhitespace, setUsernameContainsWhitespace] = useState(false);
    const [isUsernameLongEnough, setIsUsernameLongEnough] = useState(false);
    const [isUsernameTooLong, setIsUsernameTooLong] = useState(false);
    const [isUsernameTaken,] = useState(false);
    const [isValidUsername, setIsValidUsername] = useState(false);

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

    //routing after succesfull register and login
    const history = useHistory();
    const routeToNext = () => history.push('/');

    const catptcha = <ReCAPTCHA
        style={{
            marginLeft: "25px",
            marginTop: "20px"
        }}
        sitekey={process.env.REACT_APP_CAPTCHA_KEY}
        onChange={captchaChange}
        size="normal"
        theme='dark'
    />

    const successColor = 'var(--success-color)';
    const failColor = 'var(--fail-color)';

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

    function checkUsername(username) {
        setUserName(username);
        hasWhiteSpace(username) ? setUsernameContainsWhitespace(true) : setUsernameContainsWhitespace(false);
        username.length >= minUsernameLength ? setIsUsernameLongEnough(true) : setIsUsernameLongEnough(false);
        username.length > maxUsernameLength ? setIsUsernameTooLong(true) : setIsUsernameTooLong(false);

        setIsValidUsername(!usernameContainsWhitespace && isUsernameLongEnough)
    }

    function checkEmail(email) {
        setEmail(email);
        setIs2FaEnabled(false);
        setIsEmailValid(false);

        if (validator.isEmail(email)) {
            setIsEmailValid(true);
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
        let errors = validateData();

        setIs2FaEnabled(false);

        if (errors.length !== 0) {
            setIsLoadingShown(false);
            let errorList = errors.map(error => <li key={error}>{error}</li>);
            setErrorMessage(errorList);

            setTimeout(() => {
                setErrorMessage("")
            }, 5000)

            return;
        }

        //if all data is correct, try to register user
        const resp = await register(username, password, captchaValue, email, is2FaEnabled);
        if (resp === undefined) return;
        if (resp.error !== undefined) {
            setErrorMessage(resp.error);
            return;
        }

        //autologin after successful register
        if (is2FaEnabled) {
            if (twoFaCode !== "" && await CheckTwoFaCode()) {
                await ForwardAfterLogin(await login(username, password, twoFaCode));
            }
        } else {
            await ForwardAfterLogin(await login(username, password, ""));
        }
    }

    async function CheckTwoFaCode() {
        const response = await check2FaCode(twoFaCode, username)

        if (!response['result']) {
            setErrorMessage("Two authentication code is incorrect. Go to login page and try again");
        }

        return response['result'];
    }

    async function ForwardAfterLogin(resp) {
        if (resp.error !== undefined) {
            setErrorMessage(resp.error);
            return;
        }
        setIsActivateAccountInfoShown(true);
        setIsLoadingShown(false);
    }

    function AssignTwoFaCode(value) {
        if (value.length <= 6) {
            setTwoFaCode(value);
        }
    }

    async function reSentEmail() {
        const response = await reSentActivationEmail(email);
        setReSentResult(response['response'] === "OK" ? "Activation email has been successfully resent" :
            `Error occurred while trying to resent activation email: ${response['response']}`);

        setTimeout(() => {
            setReSentResult("")
        }, 2500)
    }

    //captcha
    const [captchaValue, setCaptchaValue] = useState(null);

    function captchaChange(value) {
        setCaptchaValue(value);
    }

    return (
        <div className="LogRegForm">
            <Form>
                <div className="input-wrapper">
                    <Form.Control
                        required
                        placeholder="Username..."
                        type="text"
                        value={username}
                        onChange={(e) => checkUsername(e.target.value)}
                    />
                </div>

                <p>Must be at least
                    <span
                        style={{color: isUsernameLongEnough ? successColor : failColor}}> {minUsernameLength} characters </span>
                    long, and
                    <span style={{color: !usernameContainsWhitespace ? successColor : failColor}}> not contain whitespace</span> characters.
                </p>

                <div className="input-wrapper">
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
                <div className="input-wrapper"
                     style={{background: arePasswordsEqual ? successColor : failColor}}
                >
                    <Form.Control
                        required
                        placeholder="Confirm password..."
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => checkPasswordConfirm(e.target.value)}

                    />
                </div>

                <div className="input-wrapper emailField">
                    <Form.Control
                        required
                        placeholder="e-mail address..."
                        type="text"
                        value={email}
                        onChange={(e) => checkEmail(e.target.value)}
                    />
                </div>

                <div className="infoContainer">
                    <Form.Check
                        className="twoFactorAuth"
                        type="checkbox"
                        label="Use 2-Factor authentication"
                        onChange={(_) => enable2FA()}
                    />

                    {catptcha}


                    {(is2FaEnabled && isEmailValid) &&
                    <>
                        <Form.Control
                            className="twoFaField"
                            required
                            placeholder="2FA code..."
                            type="number"
                            value={twoFaCode}
                            onChange={(e) => AssignTwoFaCode(e.target.value)}
                        />

                        <div style={{
                            display: "flex",
                            alignItems: "center"
                        }}>
                            <img
                                className="twoFaImg"
                                src={`data:image/jpeg;base64,${qrCode}`}
                            />
                        </div>
                    </>}
                </div>

                <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                    <ul>{errorMessage}</ul>
                </div>

                <div>
                    {!is2FaEnabled ? catptcha : null}
                    {errorMessage === "" && isLoadingShown ?
                        <div className="registerLoadingContainer">
                            <p className="registeringProgress">
                                Creating new account...
                            </p>
                            <div className="loader"/>
                        </div> : null}
                    {isActivateAccountInfoShown ?
                        <div className="infoContainer">
                            <p>Please activate your account and then login</p>
                            <p>You can do it by clicking on link sent in given email</p>
                            <div style={{display: "inline-block"}}>
                                <Button onClick={() => history.push("/")}>Go back</Button>
                                <Button onClick={reSentEmail}>Resent activation email</Button>
                            </div>
                            {reSentResult !== "" ? <p>{reSentResult}</p> : null}
                        </div> :
                        <Button onClick={handleSubmit} type="submit">REGISTER</Button>}
                </div>
            </Form>
        </div>
    );
}

export default connect()(RegisterForm)
