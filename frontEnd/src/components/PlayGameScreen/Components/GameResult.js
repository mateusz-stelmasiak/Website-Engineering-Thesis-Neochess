import {useHistory} from "react-router-dom";
import "./GameResult.css"
import SectionTitle from "../../Layout/Section/SectionTitle";
import Reel from "react-reel";
import {useEffect, useState} from "react";
import {getEloChangeInLastGames} from "../../../serverCommunication/DataFetcher";
import {connect} from "react-redux";

function GameResult({gameStatus, userId, sessionToken}) {
    const [eloChange, setEloChange] = useState(0);
    const [loading, setLoading] = useState(true)

    const history = useHistory();
    const returnToMain = () => history.push('/');

    useEffect(() => {
        fetchEloChanged();
    }, [])


    let fetchEloChanged = async () => {
        let resp = await getEloChangeInLastGames(userId, sessionToken);
        if (resp === undefined) return
        console.log(resp)
        await setEloChange(resp.eloChange);
        setLoading(false)
    }

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

    let gainEloStyle={
        color:'var(--success-color)'
    }
    let lossEloStyle={
        color:'var(--fail-color)'
    }


    return (
        <div className="GameResult">
            <h4>GAME ENDED</h4>

            <SectionTitle>
                {gameStatus.toUpperCase() !== "DRAW" && "YOU"}&nbsp;{gameStatus}
            </SectionTitle>
            {!loading &&
            <div className="GameResult-eloChange">
                <h3 style={eloChange>=0? gainEloStyle:lossEloStyle}>
                    {eloChange>0 && "+"}
                    <Reel theme={theme} text={eloChange.toString()}/>
                    <span>&nbsp;ELO</span>
                    </h3>
                    <span>{eloChange>=0 ? "WAS GAINED":"WAS LOST"}</span>
                    </div>
                }

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