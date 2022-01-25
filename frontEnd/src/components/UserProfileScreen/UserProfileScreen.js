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
    const [email, setEmail] = useState(undefined);
    const [is2FaEnabled, setIs2FaEnabled] = useState(undefined);
    const [accCreated, setAccCreated] = useState(undefined);
    const [accountCreatedTime, setAccountCreatedTime] = useState(undefined);
    const [accountUpdatedTime, setAccountUpdatedTime] = useState(undefined);

    useEffect(async () => {
        const response = (await getUserData())
        console.log(response)
        setEmail(response['Email'])
        setIs2FaEnabled(response['2FA'])
        setAccCreated(response['Joined'])
        setAccountUpdatedTime(response['UpdatedAt'])
        setAccountCreatedTime(response['CreatedAt'])
    }, [])

    const are_fields_correct = () => {
        return props.username !== undefined &&
            email !== undefined &&
            is2FaEnabled !== undefined &&
            accCreated !== undefined&&
            accountCreatedTime !==undefined &&
            accountUpdatedTime !==undefined
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
                        <span className="container">
                            <h3>Username</h3>
                            <span>{are_fields_correct() ? props.username: <Dots>loading</Dots>}</span>
                        </span>
                        <span className="container">
                            <h3>Account created</h3>
                            <span>{are_fields_correct() ? accountCreatedTime: <Dots>loading</Dots>}</span>
                        </span>
                        <span className="container">
                            <h3>Account updated</h3>
                            <span>{are_fields_correct() ? accountUpdatedTime: <Dots>loading</Dots>}</span>
                        </span>
                        <span className="container">
                            <h3>Email address</h3>
                            <span>{are_fields_correct() ? email: <Dots>loading</Dots>}</span>
                        </span>
                    </div>
                    <FenDisplayingBoard/>
                </div>
            </Section>
            <Section id="UserProfileEdition">
                {are_fields_correct() &&
                <UserEditForm
                    username={props.username}
                    email={email}
                    is2FaEnabled={is2FaEnabled}
                />}
            </Section>
        </FooterHeaderWithMarginsLayout>
    );
}

export default connect(mapAllStateToProps)(UserProfileScreen);
