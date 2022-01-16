import "./UserProfileScreen.css"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import FooterHeaderLayout from "../Layout/FooterHeaderLayout";
import Section from "../Layout/Section/Section";
import SectionTitle from "../Layout/Section/SectionTitle";
import FooterHeaderWithMarginsLayout from "../Layout/FooterHeaderWithMarginsLayout";

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