import React from "react";
import FindGameWidget from "./Components/FindGameWidget";
import MatchHistory from "./Components/MatchHistory/MatchHistory";
import Section from "../CommonComponents/Section";
import StatsContainer from "./Components/Stats/StatsContainer"
import RejoinGameWidget from "./Components/MatchHistory/RejoinGameWidget";
import Blink from 'react-blink-text';
import TextFlashComponent from "../CommonComponents/TextFlashComponent";
import NavBar from "../Navigation/NavBar";

function MainPageScreen() {

    return (
        <div>

            <RejoinGameWidget/>
            <FindGameWidget/>
            <Section section="STATS">
                <StatsContainer/>
                <MatchHistory/>
            </Section>
        </div>
    );
}

export default MainPageScreen

