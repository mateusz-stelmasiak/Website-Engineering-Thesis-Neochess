import React from "react";
import CircleWidget from "../../../../CommonComponents/CircleWidget/CircleWidget";
import "./SetNewPassword.css";
import SetNewPasswordForm from "./SetNewPasswordForm";
import OrbitContainer from "../../../../LogRegScreen/Components/OrbitContainer/OrbitContainer";
import {useHistory} from "react-router-dom";


export default function SetNewPasswordScreen() {
    const history = useHistory();
    const centerViews = [
        <SetNewPasswordForm/>
    ]

    const centerContainer =  <CircleWidget
        title={"neoCHESS"}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views = {centerViews}
        renderWithContent = {true}
        goBackArrow={<a onClick={() => history.push('/')}>{"< BACK TO MENU >"}</a>}
    >
    </CircleWidget>;

    const outerContainer =  <CircleWidget
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
