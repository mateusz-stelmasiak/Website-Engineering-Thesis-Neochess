import React, {useEffect, useState} from "react";
import FindGameWidget from "./Components/FindGame/FindGameWidget";
import MatchHistory from "./Components/MatchHistory/MatchHistory";
import Section from "../CommonComponents/Section/Section";
import StatsContainer from "./Components/Stats/StatsContainer"
import RejoinGameWidget from "./Components/MatchHistory/RejoinGameWidget";
import Blink from 'react-blink-text';
import TextFlashComponent from "../CommonComponents/TextFlashComponent";
import NavBar from "../Navigation/NavBar/NavBar";
import UserEditForm from "../Navigation/Components/UserEdit/UserEdit";
import {getUserData} from "../../serverLogic/LogRegService";

function MainPageScreen() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [is2FaEnabled, setIs2FaEnabled] = useState(undefined);

    useEffect(async () => {
        const response = (await getUserData())['response']

        setUsername(response['Username'])
        setEmail(response['Email'])
        setIs2FaEnabled(response['2FA'])
    }, [])

    const are_fields_correct = () => {
        return username !== ""
            && email !== ""
            && is2FaEnabled !== undefined
    }

    return (
        <div>
            <RejoinGameWidget/>
            <FindGameWidget/>
            {are_fields_correct() ?
                <UserEditForm
                    username={username}
                    email={email}
                    is2FaEnabled={is2FaEnabled}
                /> : null}
            <Section section="STATS">
                <StatsContainer/>
                <MatchHistory/>
            </Section>
        </div>
    );
}

export default MainPageScreen

