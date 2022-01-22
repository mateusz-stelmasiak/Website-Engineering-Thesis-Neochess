import React from "react";
import CircleWidget from "../../../CommonComponents/CircleWidget/CircleWidget";
import "./SetNewPassword.css";
import SetNewPasswordForm from "./SetNewPasswordForm";
import OrbitContainer from "../OrbitContainer/OrbitContainer";


export default function SetNewPasswordScreen() {
    let centerViews = [
        <SetNewPasswordForm/>
    ]

    let centerContainer =  <CircleWidget
        title={"neoCHESS"}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views = {centerViews}
        renderWithContent = {true}
    >
    </CircleWidget>;

    let outerContainer =  <CircleWidget
        title={""}
        basecolor={"var(--sec-color)"}
        size={'small'}
    >
    </CircleWidget>

    return (
        <div className="setNewPasswordScreen">
            <OrbitContainer
                center={centerContainer}
                outer={outerContainer}
            />
        </div>
    );
}
