import React from "react";
import "./LogRegScreen.css"
import OrbitContainer from "./Components/OrbitContainer/OrbitContainer";
import LoginForm from "./Components/LoginForm";
import RegisterForm from "./Components/RegisterForm/RegisterForm";
import CircleWidget from "../CommonComponents/CircleWidget/CircleWidget";
import FenDisplayingBoard from "../CommonComponents/FENDisplayingBoard/FenDisplayingBoard";
import AboutNeoChess from "./AboutNeoChess";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment} from "@fortawesome/free-solid-svg-icons";


export default function LogRegScreen() {
    let navItems = [
        <>LOGIN</>,
        <>REGISTER</>,
        <>ABOUT</>
    ];

    let gitOptions = [
        <></>
    ]

    let centerViews = [
        <LoginForm/>,
        <RegisterForm/>,
        <AboutNeoChess/>
    ]

    let centerContainer = <CircleWidget
        title={"neoCHESS"}
        navigation={navItems}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views={centerViews}
        renderWithContent={false}
    >
    </CircleWidget>;

    let gitICON =<FontAwesomeIcon icon={faComment}/>

    let routeToGithub = () =>{
        window.history.pushState({page: 1}, "Login", "/login?")
        window.location.replace('https://github.com/mateusz-stelmasiak/NeoChess')
    }
    let outerContainer = <CircleWidget
        title={<div onClick={routeToGithub}>GITHUB<div>{gitICON}</div></div>}
        views={centerViews}
        navigation={gitOptions}
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
