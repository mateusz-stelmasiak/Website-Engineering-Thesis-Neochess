import React from "react";
import logo from "../../../assets/logo.png";

import "./LogoWidget.css";


export default function LogoWidget(){
    return (
        <div className="logo NavProfile" >
            <img src={logo} alt="website-logo"/>
            <div className="logo-texts">
                <h1>Chess Defence</h1>
                <h3>PLAY CHESS ONLINE NOW!</h3>
            </div>
        </div>
    );
}
