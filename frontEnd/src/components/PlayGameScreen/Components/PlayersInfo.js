
import "./PlayersInfo.css"
import {SocketStatus} from "../../../serverLogic/WebSocket";
import React, {Component} from "react";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../redux/reducers/rootReducer";
import SocketStatusWidget from "../../CommonComponents/SocketStatusWidget";

class PlayersInfo extends Component{
    constructor(props) {
        super(props);
        this.state ={
            opponentStatus: SocketStatus.connecting
        }
    }


    render() {
        return (
            <section className="PlayersInfo">
                <div className="PlayersInfo-playerContainer">
                    <SocketStatusWidget className="PlayersInfo-status"/>
                    <div className="MatchHistoryItem-player">
                        <h1>{this.props.username}</h1>
                        <h2>{this.props.playingAs ==='w'? 'WHITE': 'BLACK'} | {this.props.elo} ELO</h2>
                    </div>
                </div>

                <div className="PlayersInfo-playerContainer">
                    <SocketStatusWidget className="PlayersInfo-status" isOpponentSocket={true}/>
                    <div className="MatchHistoryItem-player">
                        <h1>{this.props.opponentUsername}</h1>
                        <h2>{this.props.playingAs ==='w'? 'BLACK': 'WHITE'} | {this.props.opponentElo} ELO</h2>
                    </div>

                </div>

            </section>
        );
    }

}

export default connect(mapAllStateToProps)(PlayersInfo);