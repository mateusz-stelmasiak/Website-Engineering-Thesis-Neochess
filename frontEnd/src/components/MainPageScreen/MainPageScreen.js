import React, {useEffect} from "react";
import FindGameWidget from "./Components/FindGameWidget";
import MatchHistory from "./Components/MatchHistory/MatchHistory";
import Section from "../Layouts/Section";
import StatsContainer from "./Components/Stats/StatsContainer"
import RejoinGameWidget from "./Components/RejoinGameWidget";
import FooterHeaderLayout from "../Layouts/FooterHeaderLayout";
import {toast} from "react-hot-toast";
import {getGameIsInGame} from "../../serverCommunication/DataFetcher";
import {setIsInGame} from "../../redux/actions/userActions";
import {setGameId, setGameMode, setOpponentUsername, setPlayingAs} from "../../redux/actions/gameActions";
import {connect} from "react-redux";
import {authorizeSocket} from "../../redux/actions/socketActions";
import FooterHeaderWithMarginsLayout from "../Layouts/FooterHeaderWithMarginsLayout";
import CookiesConsent from "../Cookies/CookiesConsent";

function MainPageScreen({userId, sessionToken, dispatch}) {

    async function checkIfIsInGame() {
        let resp = await getGameIsInGame(userId, sessionToken);
        if (resp === undefined) return

        if (!resp.inGame) {
            dispatch(setIsInGame(false));
            return;
        }

        await dispatch(setGameId(resp.gameId));
        await dispatch(setPlayingAs(resp.playingAs));
        await dispatch(setGameMode(resp.gameMode));
        await dispatch(setOpponentUsername(resp.opponentUsername));
        await dispatch(setIsInGame(true));

        toast.custom((t) => (<RejoinGameWidget toastId={t.id}/>), {
            duration: Infinity
        });


    }

    useEffect(() => {

        toast.custom((t) => (<CookiesConsent toastId={t.id}/>), {
            duration: Infinity
        });
        dispatch(authorizeSocket(userId,sessionToken));
        checkIfIsInGame();
        //show cookies

    }, []);

    return (
        <FooterHeaderWithMarginsLayout>

            <FindGameWidget/>
            <Section section="STATS">
                    <StatsContainer/>
                    <MatchHistory/>
            </Section>

        </FooterHeaderWithMarginsLayout>
    );
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        sessionToken: state.user.sessionToken,
        isInGame: state.user.isInGame
    };
};
export default connect(mapStateToProps)(MainPageScreen);

