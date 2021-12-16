import React, {Component} from 'react';
import "./MatchHistoryItem.css"

export class MatchItemInfo {
    constructor(matchResult, nofMoves, player1Info, player2Info, matchDate) {
        this.matchResult = matchResult;
        this.nofMoves = nofMoves;
        this.player1Info = player1Info;
        this.player2Info = player2Info;
        this.matchDate = matchDate;
    }
}

//enum-pattern class for match results and their colors
export class MatchResult {
    static draw = new MatchResult('Draw', '#468f84');
    static win = new MatchResult('Win', '#369257');
    static loss = new MatchResult('Loss', '#bf3d3b');
    static none = new MatchResult('None','#69aca2')

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }

    static getResultFromString(res){
        switch (res){
            case 'draw': return MatchResult.draw;
            case 'win': return MatchResult.win;
            case 'loss': return MatchResult.loss;
            default: return MatchResult.none;
        }
    }

}

export class PlayerInfo {
    constructor(username, playedAs, ELO) {
        this.username = username;
        this.playedAs = playedAs;
        this.ELO = ELO;
    }
}

export class MatchDate {
    constructor(hour, dayMonthYear) {
        this.hour = hour;
        this.dayMonthYear = dayMonthYear;
    }
}

class MatchHistoryItem extends Component {

    constructor(props) {
        super(props);
        this.matchResult = this.props.matchItemInfo.matchResult;
        this.matchResultStyle = {
            'backgroundColor': this.matchResult.color
        }

        this.nofMoves = this.props.matchItemInfo.nofMoves;
        this.player1Info = this.props.matchItemInfo.player1Info;
        this.player2Info = this.props.matchItemInfo.player2Info;
        this.date = this.props.matchItemInfo.matchDate;
    }


    render() {
        return (
            <div className="MatchHistoryItem">
                <div
                    style={this.matchResultStyle}
                    className="MatchHistoryItem-result"
                >
                    <h1>{this.nofMoves}</h1>
                    <h2>MOVES</h2>
                </div>

                <div className="MatchHistoryItem-info">
                    <div className="MatchHistoryItem-player">
                        <h1>{this.player1Info.username}</h1>
                        <h2>{this.player1Info.playedAs} | {this.player1Info.ELO} ELO</h2>
                    </div>
                    <span>vs</span>
                    <div className="MatchHistoryItem-player">
                        <h1>{this.player2Info.username}</h1>
                        <h2>{this.player2Info.playedAs} | {this.player2Info.ELO} ELO</h2>
                    </div>

                    <div className="MatchHistoryItem-date">
                        <h1>{this.date.hour}</h1>
                        <h2>{this.date.dayMonthYear}</h2>
                    </div>

                </div>
            </div>
        );
    }
}

export default MatchHistoryItem;