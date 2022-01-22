import React, {useEffect, useState} from "react";
import "./StatsContainer.css"
import SectionTitle from "../../../Layout/Section/SectionTitle";
import Dots from "../../../CommonComponents/Dots";
import {FETCH_DEBUGGING_MODE, getPlayerStats, getSessionToken} from "../../../../serverCommunication/DataFetcher";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../../redux/reducers/rootReducer";
import {setUserElo} from "../../../../redux/actions/userActions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine, faGamepad,faChess,faSync} from "@fortawesome/free-solid-svg-icons";

function StatsContainer({userId, sessionToken, dispatch}) {
    const [currentElo, setCurrentElo] = useState("");
    const [rankDeviation, setRankDeviation] = useState("");
    const [gamesPlayed, setGamesPlayed] = useState("");
    const [gamesWon, setGamesWon] = useState("");
    const [gamesLost, setGamesLost] = useState("");
    const [draws, setDraws] = useState("");
    const [defGamesPlayed, setDefGamesPlayed] = useState("");
    const [defGamesWon, setDefGamesWon] = useState("");
    const [defGamesLost, setDefGamesLost] = useState("");
    const [defDraws, setDefDraws] = useState("");
    const [updateDate, setUpdateDate] = useState("--:--:--");
    const [isLoading, setIsLoading] = useState(true);

    //icons
    const iconELO = <FontAwesomeIcon icon={faChartLine}/>;
    const iconGames = <FontAwesomeIcon icon={faGamepad}/>;
    const iconDefender = <FontAwesomeIcon icon={faChess}/>;
    const refreshIcon = <FontAwesomeIcon icon={faSync}/>;

    //run only once
    useEffect(() => {
        fetchPlayerData();
    }, []);


    async function fetchPlayerData() {
        setUpdateDate("--:--:--");
        setIsLoading(true);

        //reset all values
        setCurrentElo("");
        setRankDeviation("");
        setGamesPlayed("");
        setGamesWon("");
        setGamesLost("");
        setDraws("");
        setDefGamesPlayed("");
        setDefGamesLost("");
        setDefGamesWon("");
        setDefDraws("");


        const resp = await getPlayerStats(userId, sessionToken);
        if (FETCH_DEBUGGING_MODE) console.log(resp);

        setIsLoading(false);

        //handle network errors
        if (resp === undefined || resp.error !== undefined) {
            //show some error messagae
            setCurrentElo("Can't connect :(");
            return;
        }

        console.log(resp)

        dispatch(setUserElo(resp.elo))
        await setCurrentElo(resp.elo);
        await setRankDeviation(resp.deviation);
        await setGamesPlayed(resp.gamesPlayed);
        await setGamesWon(resp.gamesWon);
        await setGamesLost(resp.gamesLost);
        await setDraws(resp.draws);
        await setDefGamesPlayed(resp.defenderPlayed);
        await setDefGamesLost(resp.defenderLost);
        await setDefGamesWon(resp.defenderWon);
        await setDefDraws(resp.defenderDraws);

        //set update date
        let time = new Date().getTime();
        let date = new Date(time);
        setUpdateDate(formatTime(date))
    }

    let formatTime = (date) => {
        let res = "";
        res += Number(date.getHours()) > 9 ? date.getHours() : '0' + date.getHours();
        res += ":";
        res += Number(date.getMinutes()) > 9 ? date.getMinutes() : '0' + date.getMinutes();
        res += ":";
        res += Number(date.getSeconds()) > 9 ? date.getSeconds() : '0' + date.getSeconds();
        return res
    }

    return (
        <section id="STATS" className="StatsContainer">
            <div className="StatsContainer-header">
                <hr className="StatsContainer-bar"/>
                <SectionTitle>STATSTICS</SectionTitle>
                <hr className="StatsContainer-bar"/>
            </div>


            <div className="StatsContainer-categories">

                <div className="StatsContainer-categorie">
                    <h1>{iconELO}&nbsp;ELO STATS</h1>
                    <p>
                        Current ELO:
                        <span className="StatsContainer-primText">
                         &nbsp;{currentElo} {isLoading && <Dots>loading</Dots>}
                        </span>
                    </p>
                    <p>Rank deviation:
                        <span className="StatsContainer-darkPrimText">
                            &nbsp;{rankDeviation} {isLoading && <Dots>loading</Dots>}
                        </span>
                    </p>
                </div>


                <div className="StatsContainer-categorie">
                    <h1>{iconGames}&nbsp;GAMES STATS</h1>
                    <p>Games Played: <span>&nbsp;{gamesPlayed} {isLoading && <Dots>loading</Dots>} </span></p>
                    <p>Games Won: <span className="succText">&nbsp;{gamesWon} {isLoading &&
                    <Dots>loading</Dots>} </span></p>
                    <p>Games Lost: <span className="failText">&nbsp;{gamesLost} {isLoading &&
                    <Dots>loading</Dots>} </span></p>
                    <p>Draws: <span className="neutralText">&nbsp;{draws} {isLoading && <Dots>loading</Dots>}</span></p>
                </div>

                <div className="StatsContainer-categorie">
                    <h1>{iconDefender}&nbsp;DEFENDER STATS</h1>
                    <p>Games Played: <span>&nbsp;{defGamesPlayed}{isLoading && <Dots>loading</Dots>}</span></p>
                    <p>Games Won: <span className="succText">&nbsp;{defGamesWon}{isLoading && <Dots>loading</Dots>}</span></p>
                    <p>Games Lost: <span className="failText">&nbsp;{defGamesLost}{isLoading && <Dots>loading</Dots>}</span></p>
                    <p>Draws: <span className="neutralText">&nbsp;{defDraws}{isLoading && <Dots>loading</Dots>}</span></p>
                </div>
            </div>

            <div className="StatsContainer-lastUpdated">
                <b>Last updated:</b>&nbsp;{updateDate}&nbsp;
                <button onClick={fetchPlayerData}>{refreshIcon}</button>
            </div>


        </section>
    );
}


export default connect(mapAllStateToProps)(StatsContainer)
