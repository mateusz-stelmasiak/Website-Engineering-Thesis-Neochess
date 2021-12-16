import React, {Component} from "react";
import "./ProfileWidget.css";


class ProfileWidget extends Component{
    constructor(props) {
        super(props);
        this.username=props.username;
    }

    render() {
        return (
            <div className="NavBar-userProfile NavProfile">
                <div className="img"/>
                <div className="NavBar-userProfile-info">
                    <h1>PROFILE</h1>
                    <h3>{this.username}</h3>
                </div>
            </div>
        );
    }


}
 export default ProfileWidget;