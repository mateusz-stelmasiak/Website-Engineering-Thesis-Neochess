import CircleWidget from "../CommonComponents/CircleWidget/CircleWidget";
import OrbitContainer from "../LogRegScreen/Components/OrbitContainer/OrbitContainer";
import React from "react";
import InvalidTokenContainer from "./InvalidTokenContainer";
import "./InvalidToken.css"


export default function InvalidTokenScreen() {
    let centerViews = [
        <InvalidTokenContainer/>
    ]

    let centerContainer = <CircleWidget
        title={"neoCHESS"}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views={centerViews}
        renderWithContent={true}
    >
    </CircleWidget>;

    let outerContainer = <CircleWidget
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
