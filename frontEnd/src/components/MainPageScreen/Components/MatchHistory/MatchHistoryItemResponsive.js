import React, {useState} from 'react';
import "./MatchHistoryItemResponsive.css"

function MatchHistoryItemResponsive(props) {;
    const [showMore, setShowMore] = useState(false)

    let matchResultStyle = {
        'backgroundColor': props.color,
        'filter': 'drop-shadow(0 0 0.4rem ' + props.color + ')'
    }

    let toggleMoreData = () => {
        setShowMore(!showMore);
    }

    return (
        <div className="MatchHistoryItemResponsive">

            <div className="MatchHistoryItemResponsive--container">
                <div
                    className="MatchHistoryItemResponsive-result"
                    onClick={toggleMoreData}
                    style={matchResultStyle}
                >
                    <h1>{props.matchInfo.nofMoves}</h1>
                    <h2>MOVES</h2>
                </div>

                <div className="MatchHistoryItemResponsive--container-inner">

                    <div className="MatchHistoryItemResponsive-date">
                        <h1>{props.matchInfo.matchDate.hour}</h1>
                        <h2>{props.matchInfo.matchDate.dayMonthYear}</h2>
                    </div>

                    <div className="MatchHistoryItemResponsive-player">
                        <h2>{props.matchInfo.player2Info.ELO}</h2>
                    </div>

                </div>

                {showMore &&<div className="MatchHistoryItemResponsive-more">

                    <ul className="MatchHistoryItemResponsive-infoList">
                       ELO
                    </ul>

                </div>
                }
            </div>



        </div>
    );
}


export default MatchHistoryItemResponsive;