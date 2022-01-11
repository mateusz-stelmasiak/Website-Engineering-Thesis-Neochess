import React from "react";
import FindGameWidget from "./Components/FindGameWidget";
import MatchHistory from "./Components/MatchHistory/MatchHistory";
import Section from "../CommonComponents/Section";
import StatsContainer from "./Components/Stats/StatsContainer"
import RejoinGameWidget from "./Components/MatchHistory/RejoinGameWidget";
import FooterHeaderLayout from "../Layouts/FooterHeaderLayout";

function MainPageScreen() {

    return (
        <FooterHeaderLayout>

            <RejoinGameWidget/>
            <FindGameWidget/>
            <Section section="STATS">
                <StatsContainer/>
                <MatchHistory/>
            </Section>

        </FooterHeaderLayout>
    );
}

export default MainPageScreen

