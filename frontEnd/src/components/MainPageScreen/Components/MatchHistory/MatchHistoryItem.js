import React, {useState} from 'react';
import "./MatchHistoryItem.css"
import MatchHistoryItemResponsive from "./MatchHistoryItemResponsive";

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
    static none = new MatchResult('None', '#69aca2')

    constructor(name, color) {
        this.name = name;
        this.color = color;
    }

    static getResultFromString(res) {
        switch (res) {
            case 'draw':
                return MatchResult.draw;
            case 'win':
                return MatchResult.win;
            case 'loss':
                return MatchResult.loss;
            default:
                return MatchResult.none;
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




function MatchHistoryItem(props) {
    const [matchResult,] = useState(props.matchItemInfo.matchResult);
    const [matchInfo,] = useState(props.matchItemInfo);


    let matchResultStyle = {'backgroundColor': matchResult.color}

    return (
        <>
            <MatchHistoryItemResponsive
                matchInfo={matchInfo}
                color={matchResult.color}
                matchResult={matchResult}
            />

            <div className="MatchHistoryItem">
                <div
                    style={matchResultStyle}
                    className="MatchHistoryItem-result"
                >
                    <h1>{matchInfo.nofMoves}</h1>
                    <h2>MOVES</h2>
                </div>

                <div className="MatchHistoryItem-info">
                    <div className="MatchHistoryItem-player">
                        <h1>{matchInfo.player1Info.username}</h1>
                        <h2>{matchInfo.player1Info.playedAs} | {matchInfo.player1Info.ELO} ELO</h2>
                    </div>
                    <span>vs</span>

                    <div className="MatchHistoryItem-player">
                        <h1>
                            {matchInfo.player2Info.username}
                        </h1>
                        <h2>{matchInfo.player2Info.playedAs} | {matchInfo.player2Info.ELO} ELO</h2>
                    </div>

                    <div className="MatchHistoryItem-date">
                        <h1>{matchInfo.matchDate.hour}</h1>
                        <h2>{matchInfo.matchDate.dayMonthYear}</h2>
                    </div>

                </div>

            </div>

        </>


    );
}


export default MatchHistoryItem;