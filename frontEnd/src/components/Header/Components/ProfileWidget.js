import React, {Component} from "react";
import "./ProfileWidget.css";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../redux/reducers/rootReducer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOutAlt, faCog} from "@fortawesome/free-solid-svg-icons";

import {logout} from "../../../serverCommunication/LogRegService";
import {useHistory} from "react-router-dom";
import logo from '../../../assets/neochess-logo.png'; // Tell webpack this JS file uses this image


function ProfileWidget(props) {
    let logoutIcon = <FontAwesomeIcon
        icon={faSignOutAlt}
        onClick={logout}
    />

    //route to configure page after clicking configure icon
    const history = useHistory();
    const routeToConfigure = () => history.push('/profile');
    const routeToMain = () => history.push('/');
    let configureIcon = <FontAwesomeIcon
        icon={faCog}
        onClick={routeToConfigure}
    />

    return (
        <div className="ProfileWidget">
            <div className="ProfileWidget-container">
                <img src={logo} onClick={routeToMain} alt="Logo"/>
                <div className="ProfileWidget-info">
                    <h1>{props.username}</h1>
                    <div className="ProfileWidget-info-container">
                        <span>{props.elo}ELO </span>
                        <span>{configureIcon}</span>
                        <span>{logoutIcon}</span>
                    </div>
                </div>

            </div>
        </div>
    );

}

const mapStateToProps = (state) => {
    return {
        username: state.user.username,
        elo: state.user.elo
    };
};
export default connect(mapStateToProps)(ProfileWidget);
