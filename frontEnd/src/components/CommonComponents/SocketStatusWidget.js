import React from "react";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../redux/reducers/rootReducer";
import "./SocketStatusWidget.css";
import {Fade, Tooltip} from "react-bootstrap";
import {SocketStatus} from "../../serverLogic/WebSocket";

const {Component} = require("react");

class SocketStatusWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpponentSocket: this.props.isOpponentSocket, //dictates if it should display opponent's or player's socket status

        }
    }

    render() {

        let displayedSocketStatus= this.props.socketStatus;
        if (this.state.isOpponentSocket && this.props.opponentsStatus ){
            displayedSocketStatus=this.props.opponentsStatus;
            //if player is disconnected show opponents status as unknown
            if (this.props.socketStatus===SocketStatus.disconnected){
                displayedSocketStatus=SocketStatus.unknown;
            }

        }

        return (
            <Tooltip title={displayedSocketStatus.name} id='socket_widget'>
                <div className={`SocketStatus ` + this.props.className}
                     style={{'background-color': displayedSocketStatus.color}}/>
            </Tooltip>
        );
    }
}
// Map Redux state to React component props
const mapStateToProps = (state) => {
    return {
        socketStatus: state.socket.status,
        opponentsStatus: state.game.opponentsStatus
    };
};
export default connect(mapStateToProps)(SocketStatusWidget);