import "./UserProfileScreen.css"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import Section from "../Layout/Section/Section";
import SectionTitle from "../Layout/Section/SectionTitle";
import FooterHeaderWithMarginsLayout from "../Layout/FooterHeaderWithMarginsLayout";
import UserEditForm from "../Header/Components/UserEdit/UserEdit";
import React, {useEffect, useState} from "react";
import {getUserData} from "../../serverCommunication/LogRegService";
import Dots from "../CommonComponents/Dots/Dots";
import FenDisplayingBoard from "../CommonComponents/FENDisplayingBoard/FenDisplayingBoard";


function UserProfileScreen(props) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [is2FaEnabled, setIs2FaEnabled] = useState(undefined);

    useEffect(async () => {
        const response = (await getUserData())['response']
        console.log('curr data')
        console.log(response)
        setUsername(response['Username'])
        setEmail(response['Email'])
        setIs2FaEnabled(response['2FA'])
    }, [])

    const are_fields_correct = () => {
        return username !== ""
            && email !== ""
            && is2FaEnabled !== undefined
    }

    let glowingStyle = {
        'all': 'unset',
        'display': 'block',
        'textAlign': 'center',
        'fontWeight': 'bold',
        'fontSize': 'min(3em, 5vw)',
        'animation': 'text_glow 5s infinite',
        'color': 'var(--sec-color)'
    }

    let sectionStyle = {
        'display': 'flex',
        'alignItems': 'flex-start',
        'flexDirection': 'row',
        'columnGap': '3rem',
        'justifyContent': 'space-between',
        'alignContent': 'space-between',
        'width': '70%'
    }

    let containerStyle = {
        'display': 'flex',
        'alignItems': 'flex-start',
        'flexDirection': 'column',
        'rowGap': '2rem',
        'flexWrap': 'wrap',
        'color': 'var(--text-color)',
    }

    return (
        <FooterHeaderWithMarginsLayout className="UserProfileScreen">
            <SectionTitle>MANAGE ACCOUNT</SectionTitle>
            <Section id="UserProfileScreen">
                <div style={sectionStyle} className="CurrentInfo-container">
                    <div style={containerStyle}>
                        <h1 style={glowingStyle}>CURRENT INFO</h1>
                        <span className="container"><h3>Username</h3><span>{props.username}</span></span>
                        <span className="container"><h3>Acc created</h3><span><Dots>loading</Dots></span></span>
                        <span className="container"><h3>Email address</h3><span><Dots>loading</Dots></span></span>
                    </div>
                    <FenDisplayingBoard/>
                </div>
            </Section>
            <Section id="UserProfileEdition">
                {are_fields_correct() ?
                    <UserEditForm
                        username={username}
                        email={email}
                        is2FaEnabled={is2FaEnabled}
                    /> : null}
            </Section>
        </FooterHeaderWithMarginsLayout>
    );
}

export default connect(mapAllStateToProps)(UserProfileScreen);
