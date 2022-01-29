import CircleWidget from "../CommonComponents/CircleWidget/CircleWidget";
import OrbitContainer from "../LogRegScreen/Components/OrbitContainer/OrbitContainer";
import React from "react";
import InvalidTokenContainer from "./InvalidTokenContainer";
import "./InvalidToken.css"
import {useHistory} from "react-router-dom";


export default function InvalidTokenScreen() {

    const history = useHistory();
    const centerViews = [
        <InvalidTokenContainer/>
    ]

    const centerContainer = <CircleWidget
        title={"neoCHESS"}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views={centerViews}
        renderWithContent={true}
        goBackArrow={<a onClick={() => history.push('/')}>{"< BACK TO MENU >"}</a>}
    >
    </CircleWidget>;

    const outerContainer = <CircleWidget
        title={""}
        basecolor={"var(--sec-color)"}
        size={'small'}
    >
    </CircleWidget>

    return (
        <div className="invalidTokenScreen">
            <OrbitContainer
                center={centerContainer}
                outer={outerContainer}
            />
        </div>
    );
}
