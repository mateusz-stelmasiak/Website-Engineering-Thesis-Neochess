import React, {Component, useEffect, useState} from 'react';
import "./Header.css";
import ProfileWidget from "./Components/ProfileWidget"
import {useHistory, useLocation} from "react-router-dom";

//buttons on different subpages
let pathMenuItems =
    {
        "/": ["STATS","HISTORY", "PLAY"],
    };

export default function Header(props) {
    let [currentMenuItems, setCurrentMenuItems] = useState([]);
    const location = useLocation();
    const history = useHistory();
    const routeToMain = () => history.push('/');


    useEffect(() => {
        let menuItemsList = [];

        if (pathMenuItems[location.pathname]) {
            menuItemsList = pathMenuItems[location.pathname].map(item => {
                return (<button key={item} onClick={() => scrollToSection(item)}>
                    {item}
                </button>);
            });
        }
        else
        {
            menuItemsList.push(<button key={"MAIN MENU"} onClick={routeToMain}>{"MAIN MENU"}</button>)
        }

        setCurrentMenuItems(menuItemsList);
    }, [location])

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
