import React from "react";
import CircleWidget from "../CommonComponents/CircleWidget";
import "./LogRegScreen.css"
import OrbitContainer from "../OrbitContainer/OrbitContainer";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm";
import ForgotPasswordForm from "./Components/ForgotPassword/ForgotPasswordForm";
import SetNewPasswordForm from "./Components/SetNewPassword/SetNewPasswordForm";


export default function LogRegScreen() {
    let navItems = [
        <>LOGIN</>,
        <>REGISTER</>,
        <>WATCH</>,
        <>RESET</>,
        <>SET</>
    ];

    let centerViews = [
        <LoginForm/>,
        <RegisterForm/>,
        <h2>NOT YET IMPLEMENTED</h2>,
        <ForgotPasswordForm/>,
        <SetNewPasswordForm/>
    ]

    let centerContainer =  <CircleWidget
        title={"neoCHESS"}
        navigation={navItems}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views = {centerViews}
        renderWithContent = {false}
    >
    </CircleWidget>;

    let outerContainer =  <CircleWidget
        title={""}
        basecolor={"var(--sec-color)"}
        size={'small'}
    >
    </CircleWidget>

    return (
        <div className="LogRegScreen">
            <OrbitContainer
                center={centerContainer}
                outer={outerContainer}
            />
        </div>
    );
}
