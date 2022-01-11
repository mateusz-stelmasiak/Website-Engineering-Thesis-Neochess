import React, {Component, useEffect, useState} from 'react';
import "./Header.css";
import ProfileWidget from "./Components/ProfileWidget"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import {logout} from "../../serverLogic/LogRegService";
import {useHistory, useLocation} from "react-router-dom";

//buttons on different subpages
let pathMenuItems =
    {
        "/":["STATS", "PLAY"],
        "/play":["TEST"],
        "/profile":["BACK"]
    };

export default function Header(props) {

    let [currentMenuItems,setCurrentMenuItems]=useState([]);
    const location = useLocation();
    const history = useHistory();
    const routeToMain = () => history.push('/');



    useEffect(()=>{

        let menuItemsList= pathMenuItems[location.pathname].map(item =>{
            if (item==="BACK"){
                return(
                    <button key={item} onClick={routeToMain}>
                        {item}
                    </button>
                )
            }
            return (<button key={item} onClick={() => scrollToSection(item)}>
                    {item}
                </button>);
        });

        setCurrentMenuItems(menuItemsList);

    },[location])

    let scrollToSection = (sectionID) => {
        let section = document.getElementById(sectionID);
        if (typeof section !== 'undefined' && section !== null) {
            section.scrollIntoView({behavior: 'smooth'});
        }
    }

    return (
        <header>
            <ProfileWidget/>

            <div className="buttons-container">
                {currentMenuItems}
            </div>

        </header>
    );

}
