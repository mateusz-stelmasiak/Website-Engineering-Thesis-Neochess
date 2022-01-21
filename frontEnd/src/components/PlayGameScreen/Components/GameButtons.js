import "./GameButtons.css"
import {Component} from "react";
import {connect} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFlag,faHandshake} from "@fortawesome/free-solid-svg-icons";
import {emit} from "../../../redux/actions/socketActions";
import {Tooltip} from "react-bootstrap";
import {toast} from "react-hot-toast";
import {setDrawProposedColor} from "../../../redux/actions/gameActions";

function GameButtons({dispatch,gameId,userId,FEN,drawProposedColor,playingAs}){
    let surrenderIcon= <FontAwesomeIcon icon={faFlag}/>
    let drawIcon= <FontAwesomeIcon icon={faHandshake}/>

    let drawProposedStyle={'backgroundColor':'var(--sec-color)'};
    let drawNotProposedStyle={'backgroundColor':'var(--primary-color)'};

    let surrenderGame = () =>{
        let evntAndMsg ={
            event:'surrender',
            msg: JSON.stringify({
                'gameroomId':gameId,
                'playerId':userId,
            })
        }

        dispatch(emit(evntAndMsg));
    }

    let proposeDraw = ()=>{
        let evntAndMsg ={
            event:'propose_draw',
            msg: JSON.stringify({
                'gameroomId':gameId,
                'playerId':userId,
            })
        }

        dispatch(emit(evntAndMsg));
        dispatch(setDrawProposedColor(playingAs));
        toast.success("Draw proposed");
    }


    let makeAIMove = () =>{
        let makeMoveEvent ={
            event:'make_AI_move',
            msg:JSON.stringify({
                'gameroomId':gameId,
                'playerId':userId,
                'FEN':FEN
            })
        }
        dispatch(emit(makeMoveEvent));
    }



    return (
        <section className="GameButtons">
            <Tooltip id="surrTooltip" title={"click to surrender"}>
                <button onClick={surrenderGame}>{surrenderIcon}</button>
            </Tooltip>

            <Tooltip id="drawTooltip" title={"click to propose a draw"}>
                <button
                    onClick={proposeDraw}
                    style={(drawProposedColor!==null && drawProposedColor !=='null') ? drawProposedStyle:drawNotProposedStyle}
                >
                    {drawIcon}
                </button>
            </Tooltip>
        </section>
    );


}

// {this.props.gameMode==="1" && <button onClick={this.makeAIMove}>MAKE AI MOVE</button>

const mapStateToProps = (state) => {
    return {
        userId: state.user.userId,
        gameId: state.game.gameId,
        FEN:state.game.currentFEN,
        gameMode:state.game.gameMode,
        drawProposedColor: state.game.drawProposedColor
    };
};
export default connect(mapStateToProps)(GameButtons);