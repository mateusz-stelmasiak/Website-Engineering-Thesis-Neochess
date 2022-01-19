import React from "react";
import FindGameWidget from "./Components/FindGame/FindGameWidget";
import MatchHistory from "./Components/MatchHistory/MatchHistory";
import Section from "../CommonComponents/Section/Section";
import StatsContainer from "./Components/Stats/StatsContainer"
import RejoinGameWidget from "./Components/MatchHistory/RejoinGameWidget";
import Blink from 'react-blink-text';
import TextFlashComponent from "../CommonComponents/TextFlashComponent";
import NavBar from "../Navigation/NavBar/NavBar";
import UserEditForm from "../Navigation/Components/UserEdit/UserEdit";

function MainPageScreen() {
    return (
        <div>
            <RejoinGameWidget/>
            <FindGameWidget/>
            <UserEditForm/>
            <Section section="STATS">
                <StatsContainer/>
                <MatchHistory/>
            </Section>
        </div>
    );
}

export default MainPageScreen

