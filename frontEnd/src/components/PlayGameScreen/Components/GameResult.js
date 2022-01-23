import {useHistory} from "react-router-dom";
import "./GameResult.css"
import SectionTitle from "../../Layout/Section/SectionTitle";
import Reel from "react-reel";
import {connect} from "react-redux";

function GameResult({gameStatus, userId, sessionToken}) {

    const history = useHistory();
    const returnToMain = () => history.push('/');


    //used for reel (the elo spinning up)
    const theme = {
        reel: {
            height: "1em",
            display: "flex",
            alignItems: "flex-end",
            overflowY: "hidden",
            lineHeight: "0.95em"
        },
        group: {
            transitionDelay: "0ms",
            transitionTimingFunction: "ease-in-out",
            transform: "translate(0, 0)",
            height: "1em"
        },
        number: {
            height: "1em"
        }
    };

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
                {gameStatus.result.toUpperCase() !== "DRAW" && "YOU"}&nbsp;{gameStatus}
            </SectionTitle>
            <div className="GameResult-eloChange">
                <h3 style={gameStatus.eloChange >= 0 ? gainEloStyle : lossEloStyle}>
                    {gameStatus.eloChange > 0 && "+"}
                    <Reel theme={theme} text={gameStatus.eloChange.toString()}/>
                    <span>&nbsp;ELO</span>
                </h3>
                <span>{gameStatus.eloChange >= 0 ? "WAS GAINED" : "WAS LOST"}</span>
            </div>


            <button onClick={returnToMain}>MAIN MENU</button>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        sessionToken: state.user.sessionToken,
    };
};

export default connect(mapStateToProps)(GameResult);