import React from "react";
import "./LogRegScreen.css"
import OrbitContainer from "../Components/OrbitContainer/OrbitContainer";
import LoginForm from "../Components/LoginForm";
import RegisterForm from "../Components/RegisterForm/RegisterForm";
import CircleWidget from "../../CommonComponents/CircleWidget/CircleWidget";
import AboutNeoChess from "../AboutNeoChess/AboutNeoChess";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../assets/neochess-logo.png";


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
        title={<><img src={logo} alt="Logo"/><span>neoCHESS</span>
            <hr/>
        </>}
        navigation={navItems}
        basecolor={"var(--primary-color)"}
        secColor={"var(--sec-color)"}
        size={'large'}
        views={centerViews}
        renderWithContent={false}
    >
    </CircleWidget>;

    let gitICON = <FontAwesomeIcon icon={faComment}/>

    let routeToGithub = () => {
        window.history.pushState({page: 1}, "Login", "/login?")
        window.location.replace('https://github.com/mateusz-stelmasiak/NeoChess')
    }
    let outerContainer = <CircleWidget
        title={<div onClick={routeToGithub}>GITHUB
            <div>{gitICON}</div>
        </div>}
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
