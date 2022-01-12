import "./GameButtons.css"
import {Component} from "react";
import {connect} from "react-redux";
import {emit} from "../../../redux/actions/socketActions";
import {store} from "../../../index";
import {flipCurrentTurn} from "../../../redux/actions/gameActions";

class GameButtons extends Component{


    surrenderGame = () =>{
        let evntAndMsg ={
            event:'surrender',
            msg: JSON.stringify({
                'gameroomId':this.props.gameId,
                'playerId':this.props.userId,
            })
        }

        this.props.dispatch(emit(evntAndMsg));
    }

    makeAIMove = () =>{
        let makeMoveEvent ={
            event:'make_AI_move',
            msg:JSON.stringify({
                'gameroomId':this.props.gameId,
                'playerId':this.props.userId,
                'FEN':this.props.FEN
            })
        }
        store.dispatch(emit(makeMoveEvent));
    }

    render() {
        return (
            <section className="GameButtons">
                <button onClick={this.surrenderGame}>SURRENDER</button>
            </section>
        );
    }
}
// {this.props.gameMode==="1" &&       <button onClick={this.makeAIMove}>MAKE AI MOVE</button>
const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        gameId: state.game.gameId,
        FEN:state.game.currentFEN,
        gameMode:state.game.gameMode
    };
};
export default connect(mapStateToProps)(GameButtons);