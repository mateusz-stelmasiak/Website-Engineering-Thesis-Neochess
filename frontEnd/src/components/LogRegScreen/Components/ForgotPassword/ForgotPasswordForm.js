import Form from "react-bootstrap/Form";
import React, {useState} from "react";
import validator from "validator";
import Button from "react-bootstrap/Button";
import {connect} from "react-redux";
import "./ForgotPasswordForm.css";
import {sendResetPasswordRequest} from "../../../../serverLogic/LogRegService";


function ForgotPasswordForm({dispatch}) {
    const [email, setEmail] = useState("");
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [confirmedEmail, setConfirmedEmail] = useState("");
    const [areEmailsEqual, setAreEmailEqual] = useState(false);
    const [passwordRequestResult, setPasswordRequestResult] = useState("")

    const [errorMessage, setErrorMessage] = useState("");

    const successColor = 'var(--success-color)';
    const failColor = 'var(--fail-color)';

    function ValidateData() {
        let errors = []

        if (!areEmailsEqual) errors.push("emails are not equal");
        if (!isEmailValid) errors.push("incorrect email");

        return errors;
    }

    function CheckEmail(email) {
        setEmail(email);

        if (validator.isEmail(email)) {
            setIsEmailValid(true)
        } else {
            setIsEmailValid(false)
        }
    }

    async function SendResetPassword() {
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

        let response = await sendResetPasswordRequest(email)
        if (response === undefined) return;
        if (response.error !== undefined) {
            setErrorMessage(response.error);
            return;
        }

        setPasswordRequestResult(response['result'] === "ok" ? "Reset password email has been successfully sent" :
            `Error occurred while trying to send password reset message: ${response['result']}`);

        setTimeout(() => {
            setPasswordRequestResult("")
        }, 2500)
    }

    function CheckEmailConfirm(confEmail) {
        setConfirmedEmail(confEmail);
        if (confEmail.length === 0) {
            setAreEmailEqual(false);
            return;
        }

        confEmail === email ?
            setAreEmailEqual(true) :
            setAreEmailEqual(false);
    }

    return (
        <div className="ForgotPasswordForm">
            <h1 className="ForgotPasswordEntrance">FORGOT PASSWORD</h1>
            <Form>
                <Form.Control
                    required
                    placeholder="e-mail address..."
                    type="text"
                    value={email}
                    onChange={(e) => CheckEmail(e.target.value)}
                />

                <Form.Control
                    required
                    placeholder="Confirm e-mail address..."
                    type="text"
                    value={confirmedEmail}
                    onChange={(e) => CheckEmailConfirm(e.target.value)}
                    style={{background: areEmailsEqual ? successColor : failColor}}
                />

                <div style={{display: errorMessage !== "" ? 'flex' : 'none'}} className="errorMessage">
                    <ul>{errorMessage}</ul>
                </div>

                <Button onClick={SendResetPassword}>Send reset password email</Button>
                {passwordRequestResult !== "" ? <p>{passwordRequestResult}</p> : null}
            </Form>
        </div>
    )
}

export default connect()(ForgotPasswordForm)
