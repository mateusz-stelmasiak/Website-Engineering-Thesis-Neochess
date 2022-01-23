import "./UserProfileScreen.css"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import Section from "../Layout/Section/Section";
import SectionTitle from "../Layout/Section/SectionTitle";
import FooterHeaderWithMarginsLayout from "../Layout/FooterHeaderWithMarginsLayout";
import UserEditForm from "../Header/Components/UserEdit/UserEdit";
import {useEffect, useState} from "react";
import {getUserData} from "../../serverCommunication/LogRegService";


function UserProfileScreen(props) {
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
        <FooterHeaderWithMarginsLayout>
            <Section>
                <SectionTitle>MANAGE ACCOUNT</SectionTitle>
            </Section>
            {are_fields_correct() ?
                <UserEditForm
                    username={username}
                    email={email}
                    is2FaEnabled={is2FaEnabled}
                /> : null}
        </FooterHeaderWithMarginsLayout>
    );
}

export default connect(mapAllStateToProps)(UserProfileScreen);
