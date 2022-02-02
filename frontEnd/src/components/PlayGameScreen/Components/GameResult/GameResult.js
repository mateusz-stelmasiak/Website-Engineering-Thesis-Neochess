import {useHistory} from "react-router-dom";
import "./GameResult.css"
import SectionTitle from "../../../Layout/Section/SectionTitle";
import {connect} from "react-redux";
import React from "react";

function GameResult({gameResult, eloChange, gameMode}) {
    const history = useHistory();
    const returnToMain = () => history.push('/');

    let gainEloStyle = {
        color: 'var(--success-color)'
    }
    let lossEloStyle = {
        color: 'var(--fail-color)'
    }

    return (
        <div className="GameResult">
            <h4>GAME ENDED</h4>

            <SectionTitle>
                {gameResult.toUpperCase() !== "DRAW" && "YOU"}&nbsp;{gameResult}
            </SectionTitle>

            {gameMode != 2 && <div className="GameResult-eloChange">
                <h3 style={eloChange >= 0 ? gainEloStyle : lossEloStyle}>
                    {eloChange > 0 && "+"}
                    <span>{eloChange}</span>
                    <span>&nbsp;ELO</span>
                </h3>
                <span>{eloChange >= 0 ? "WAS GAINED" : "WAS LOST"}</span>
            </div>}


            <button onClick={returnToMain}>MAIN MENU</button>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        sessionToken: state.user.sessionToken,
        gameMode: state.game.gameMode
    };
};

export default connect(mapStateToProps)(GameResult);
