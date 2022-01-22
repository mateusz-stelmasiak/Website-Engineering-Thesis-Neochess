import React from "react";
import CircleWidget from "./Components/OrbitContainer/CircleWidget";
import "./LogRegScreen.css"
import OrbitContainer from "./Components/OrbitContainer/OrbitContainer";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";
import ForgotPasswordForm from "./Components/ForgotPassword/ForgotPasswordForm";
import SetNewPasswordForm from "./Components/SetNewPassword/SetNewPasswordForm";


export default function LogRegScreen() {
    let navItems = [
        <>LOGIN</>,
        <>REGISTER</>,
        <>WATCH</>
    ];

    let centerViews = [
        <LoginForm/>,
        <RegisterForm/>,
        <h2>NOT YET IMPLEMENTED</h2>
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
