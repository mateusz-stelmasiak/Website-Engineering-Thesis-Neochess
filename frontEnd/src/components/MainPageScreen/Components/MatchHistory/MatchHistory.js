import React, {Component, useEffect, useState} from "react";
import "./MatchHistory.css"
import "../../../Layout/Section/SectionTitle";
import SectionTitle from "../../../Layout/Section/SectionTitle";
import MatchHistoryItem, {MatchResult, MatchDate, MatchItemInfo, PlayerInfo} from "./MatchHistoryItem"
import "./MatchHistoryItem";
import {getMatchHistory} from "../../../../serverCommunication/DataFetcher"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../../redux/reducers/rootReducer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretLeft, faCaretRight} from "@fortawesome/free-solid-svg-icons";
import VariableColor from "../../../CommonComponents/VariableColor/VariableColor";
import Dots from "../../../CommonComponents/Dots/Dots";

function MatchHistory(props) {
    const [isLoading, setLoading] = useState(true);
    const [matchHistory, setMatchHistory] = useState([]);
    const [maxPage, setMaxPage] = useState(1)
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(10);

    const iconLeft = <FontAwesomeIcon icon={faCaretLeft}/>;
    const iconRight = <FontAwesomeIcon icon={faCaretRight}/>;

    useEffect(() => {
        // tryCache();
        fetchPlayerData(page, perPage);
    }, [])

    let flipPage = async (direction) => {


        let newPage = (page + direction) % maxPage;
        if (newPage < 0) newPage = maxPage - 1;

        await setPage(newPage);
        fetchPlayerData(newPage, perPage);
        scrollToSection('HISTORY')
    }

    let scrollToSection = (sectionID) => {
        const yOffset = -100;
        const section = document.getElementById(sectionID);
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

        if (typeof section !== 'undefined' && section !== null) {
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }


    let formatMoves = (moves) => {
        moves < 10 ? moves = "0" + moves : moves = moves;
        return moves
    }


    let tryCache = () => {
        //try to read gameHistory from cache
        let cachedMatches = sessionStorage.getItem('matchHistory');
        if (!cachedMatches) {
            return
        }

        //convert to array
        cachedMatches = JSON.parse(cachedMatches);
        let result = [];
        for (let i in cachedMatches)
            result.push([i, cachedMatches [i]]);

        console.log(result);

        let keyGenerator = -1;
        let matchHistoryArray = [];

        matchHistoryArray = result.map(
            item => {
                keyGenerator++;
                let formatedMoves = formatMoves(item.nOfMoves);
                let result = MatchResult.getResultFromString(item.matchResult);
                let p1Info = new PlayerInfo(item.p1Username, item.p1PlayedAs, item.p1ELO);
                let p2Info = new PlayerInfo(item.p2Username, item.p2PlayedAs, item.p2ELO);
                let date = new MatchDate(item.hour, item.dayMonthYear);
                let matchItemInfo = new MatchItemInfo(result, formatedMoves, p1Info, p2Info, date);
                return <MatchHistoryItem key={keyGenerator} matchItemInfo={matchItemInfo}/>;
            })

        setMatchHistory([]);
        setMatchHistory(matchHistoryArray);
        setLoading(false);
    }

    let fetchPlayerData = async (page, perPage) => {
        setMatchHistory([]);
        setLoading(true);
        const resp = await getMatchHistory(props.userId, props.sessionToken, page, perPage);
        setLoading(false);

        //handle network errors
        if (resp === undefined || resp.error !== undefined) {
            setMatchHistory(getEmptyMatchHistoryItem())
            return;
        }

        //handle empty match history
        let respArr = JSON.parse(resp);
        if (respArr.length === 1 || !Array.isArray(respArr)) {
            setMatchHistory(getEmptyMatchHistoryItem());
            return;
        }

        sessionStorage.setItem('matchHistory', JSON.stringify(resp));

        //set max page
        let maxPage = respArr.shift().maxPage;
        setMaxPage(maxPage);


        let keyGenerator = -1;
        let matchHistoryArray = [];

        matchHistoryArray = respArr.map(
            item => {
                keyGenerator++;
                let formatedMoves = formatMoves(item.nOfMoves);
                let result = MatchResult.getResultFromString(item.matchResult);
                let p1Info = new PlayerInfo(item.p1Username, item.p1PlayedAs, item.p1ELO);
                let p2Info = new PlayerInfo(item.p2Username, item.p2PlayedAs, item.p2ELO);
                let date = new MatchDate(item.hour, item.dayMonthYear);
                let matchItemInfo = new MatchItemInfo(result, formatedMoves, p1Info, p2Info, date);
                return <MatchHistoryItem key={keyGenerator} matchItemInfo={matchItemInfo}/>;
            })

        setMatchHistory([]);
        setMatchHistory(matchHistoryArray);
    }


    let getEmptyMatchHistoryItem = () => {
        let p1Info = new PlayerInfo("--", "WHITE", "----");
        let p2Info = new PlayerInfo("--", "BLACK", "----");
        let date = new MatchDate("--:--", "--/--/--");
        let matchItemInfo = new MatchItemInfo(MatchResult.none, "--", p1Info, p2Info, date);
        return <MatchHistoryItem matchItemInfo={matchItemInfo}/>;
    }

    return (
        <section className="MatchHistory" id={'HISTORY'}>
            <div className="MatchHistory--header">
                <SectionTitle>MATCH HISTORY</SectionTitle>
                <div className="MatchHistory-colors">
                    <VariableColor
                        color={MatchResult.win.color}
                        text={MatchResult.win.name}/>
                    <VariableColor
                        color={MatchResult.loss.color}
                        text={MatchResult.loss.name}/>
                    <VariableColor
                        color={MatchResult.draw.color}
                        text={MatchResult.draw.name}/>
                </div>
            </div>

            {isLoading && <MatchHistoryPlaceholder/>}
            <div className="MatchHistory-container">
                {matchHistory}
            </div>

            <div className="MatchHistory-pages">
                <button id='prev' onClick={() => flipPage(-1)}>{iconLeft}</button>

                <span>{page + 1}/{maxPage}</span>

                <button id='next' onClick={() => flipPage(1)}>{iconRight}</button>
            </div>
        </section>
    );
}

class MatchHistoryPlaceholder extends Component {
    constructor(props) {
        super(props);
        let p1Info = new PlayerInfo(<Dots>Loading</Dots>, "WHITE", "----");
        let p2Info = new PlayerInfo(<Dots>Loading</Dots>, "BLACK", "----");
        let date = new MatchDate("--:--", "--/--/--");
        this.matchItemInfo = new MatchItemInfo(MatchResult.none, "--", p1Info, p2Info, date);
    }

    render() {
        return (
            <div className="MatchHistory-placeholder">
                <MatchHistoryItem matchItemInfo={this.matchItemInfo}/>
            </div>
        );
    }
}

export default connect(mapAllStateToProps)(MatchHistory)
