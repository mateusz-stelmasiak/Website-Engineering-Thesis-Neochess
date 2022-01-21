import "./UserProfileScreen.css"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import FooterHeaderLayout from "../Layouts/FooterHeaderLayout";
import Section from "../Layouts/Section";
import SectionTitle from "../CommonComponents/SectionTitle";
import FooterHeaderWithMarginsLayout from "../Layouts/FooterHeaderWithMarginsLayout";

function UserProfileScreen(props){

    return(
        <FooterHeaderWithMarginsLayout>
            <Section>
                <SectionTitle>YOUR DATA</SectionTitle>
                {props.username}

            </Section>

        </FooterHeaderWithMarginsLayout>
    );

}

export default connect(mapAllStateToProps)(UserProfileScreen);