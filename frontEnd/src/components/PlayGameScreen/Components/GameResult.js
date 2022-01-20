import {useHistory} from "react-router-dom";
import "./GameResult.css"

export function GameResult({gameStatus}){
    //routing after having succesfully found a game
    const history = useHistory();
    const returnToMain = () => history.push('/');


    return(
        <div className="GameResult">
            <p>{gameStatus}</p>
            <button onClick={returnToMain}>GO BACK</button>
        </div>
    );
}