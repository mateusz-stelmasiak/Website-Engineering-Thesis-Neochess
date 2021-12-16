import {connect} from "react-redux";
import {useHistory} from "react-router-dom";
import {setGameId, setGameMode, setPlayingAs} from "../../../../redux/actions/gameActions";
import {setIsInGame} from "../../../../redux/actions/userActions";
import {useEffect, useState} from "react";
import {getGameIsInGame} from "../../../../serverLogic/DataFetcher";
import {CSSTransition} from "react-transition-group";
import "./RejoinGameWidget.css"


function RejoinGameWidget({dispatch, userId, sessionToken, gameId, isInGame}) {
    const [loading, setLoading] = useState(true)

    //routing after having succesfully found a game
    const history = useHistory();
    //const routeToGame = (gameId) => history.push('/play?id=' + gameId);
    const routeToGame = (gameId) => window.location.reload(true);
    async function checkIfIsInGame(){
        setLoading(true)
        let resp = await getGameIsInGame(userId, sessionToken);
        if (resp === undefined) return

        //if not in game REROUTE back
        if (!resp.inGame) {
            dispatch(setIsInGame(false));
            setLoading(false);
            return;
        }
        await dispatch(setGameId(resp.gameId));
        await dispatch(setPlayingAs(resp.playingAs));
        await dispatch(setGameMode(resp.gameMode));
        await dispatch(setIsInGame(true));
        setLoading(false)
    }


    useEffect(() => {
        checkIfIsInGame();

    }, []);


    return (
        <CSSTransition
            in={!loading && (isInGame==="true" || isInGame===true)}
            timeout={200}
            classNames="RejoinGameWidget"
            unmountOnExit
        >
            <div className={"RejoinGameWidget"}>
                <h1>Your game is still ongoing, click to rejoin!</h1>
                <button onClick={() => routeToGame(gameId)}>REJOIN THE GAME</button>
            </div>
        </CSSTransition>
    );
}

const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        sessionToken: state.user.sessionToken,
        isInGame:state.user.isInGame
    };
};
export default connect(mapStateToProps)(RejoinGameWidget);

