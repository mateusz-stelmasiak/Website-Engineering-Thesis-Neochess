import "./RejoinGameWidget.css"
import {connect} from "react-redux";
import {authorizeSocket, emit} from "../../../redux/actions/socketActions";
import {useHistory} from "react-router-dom";
import {toast} from "react-hot-toast";
import {setIsInGame} from "../../../redux/actions/userActions";

function RejoinGameWidget({opponentUsername,gameId,userId,dispatch,toastId}) {

    const history = useHistory();
    const routeToGame = () => {
        toast.dismiss(toastId);
        history.push('/play?'+gameId);
    }

    const  surrenderGame = async () =>{
        let evntAndMsg ={
            event:'surrender',
            msg: JSON.stringify({
                'gameroomId':gameId,
                'playerId':userId,
            })
        }
        toast.dismiss(toastId);
        dispatch(emit(evntAndMsg));
        dispatch(setIsInGame(false));
    }

    return (
            <div className={"RejoinGameWidget"}>
                <span>Your game with {opponentUsername} is still ongoing!</span>
                <div className="RejoinGameWidget-buttons">
                    <button id="rejoin" onClick={routeToGame}>REJOIN</button>
                    <button id="surrender" onClick={surrenderGame}>SURRENDER</button>
                </div>

            </div>
    );
}

const mapStateToProps = (state) => {
    return {
        gameId: state.game.gameId,
        userId:state.user.userId,
        sessionToken:state.user.sessionToken,
        opponentUsername: state.game.opponentUsername,
    };
};
export default connect(mapStateToProps)(RejoinGameWidget);

