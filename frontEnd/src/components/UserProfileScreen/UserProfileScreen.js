import "./UserProfileScreen.css"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import FooterHeaderLayout from "../Layouts/FooterHeaderLayout";
import Section from "../CommonComponents/Section";
import SectionTitle from "../CommonComponents/SectionTitle";

function UserProfileScreen(props){

    return(
        <FooterHeaderLayout>
            <Section>
                <SectionTitle>YOUR DATA</SectionTitle>
                {props.username}

            </Section>

        </FooterHeaderLayout>
    );

}

export default connect(mapAllStateToProps)(UserProfileScreen);