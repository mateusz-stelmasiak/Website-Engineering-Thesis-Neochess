import {Component} from "react";
import "./MatchHistory.css"
import "../../../CommonComponents/SectionTitle";
import SectionTitle from "../../../CommonComponents/SectionTitle";
import MatchHistoryItem, {MatchResult, MatchDate, MatchItemInfo, PlayerInfo} from "./MatchHistoryItem"
import "./MatchHistoryItem";
import VariableColor from "../../../CommonComponents/VariableColor";
import {getMatchHistory} from "../../../../serverLogic/DataFetcher"
import {FETCH_DEBUGGING_MODE} from "../../../../serverLogic/DataFetcher"
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../../redux/reducers/rootReducer";


class MatchHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            matchHistory: [],
            mounted: true
        }
    }

    componentDidMount() {
        this.fetchPlayerData();
    }

    //clean up async calls on unmount
    componentWillUnmount() {
        this.setState({mounted: false});
    }

    formatMoves(moves) {
        moves < 10 ? moves= "0" + moves : moves=moves;
        return moves
    }

    async fetchPlayerData() {
        const resp = await getMatchHistory(this.props.userId, this.props.sessionToken);
        if (FETCH_DEBUGGING_MODE) console.log(resp);

        //handle unmount
        if (!this.state.mounted) return
        this.setState({isLoading: false})

        //handle network errors
        if (resp === undefined || resp.error !== undefined) {
            this.setState({matchHistory: this.getEmptyMatchHistoryItem()});
            return;
        }

        //handle empty match history
        let respArr = JSON.parse(resp);
        if (respArr.length === 0 || !Array.isArray(respArr)) {
            this.setState({matchHistory: this.getEmptyMatchHistoryItem()});
            return;
        }

        let keyGenerator = -1;
        let matchHistoryArray = respArr.map(
            item => {
                keyGenerator++;
                let formatedMoves = this.formatMoves(item.nOfMoves);
                let result = MatchResult.getResultFromString(item.matchResult);
                let p1Info = new PlayerInfo(item.p1Username, item.p1PlayedAs, item.p1ELO);
                let p2Info = new PlayerInfo(item.p2Username, item.p2PlayedAs, item.p2ELO);
                let date = new MatchDate(item.hour, item.dayMonthYear);
                let matchItemInfo = new MatchItemInfo(result, formatedMoves, p1Info, p2Info, date);
                return <MatchHistoryItem key={keyGenerator} matchItemInfo={matchItemInfo}/>;
            })
        this.setState({matchHistory: matchHistoryArray})
    }


    getEmptyMatchHistoryItem() {
        let p1Info = new PlayerInfo("----", "WHITE", "----");
        let p2Info = new PlayerInfo("----", "BLACK", "----");
        let date = new MatchDate("--:--", "--/--/--");
        let matchItemInfo = new MatchItemInfo(MatchResult.none, "00", p1Info, p2Info, date);
        return <MatchHistoryItem matchItemInfo={matchItemInfo}/>;
    }

    render() {
        return (
            <section className="MatchHistory">
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
                {this.state.isLoading && <MatchHistoryPlaceholder/>}
                <div className="MatchHistory-container">
                    {this.state.matchHistory}
                </div>
            </section>
        );
    }

}

class MatchHistoryPlaceholder extends Component {
    constructor(props) {
        super(props);
        let p1Info = new PlayerInfo("----", "WHITE", "----");
        let p2Info = new PlayerInfo("----", "BLACK", "----");
        let date = new MatchDate("--:--", "--/--/--");
        this.matchItemInfo = new MatchItemInfo(MatchResult.none, "00", p1Info, p2Info, date);
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