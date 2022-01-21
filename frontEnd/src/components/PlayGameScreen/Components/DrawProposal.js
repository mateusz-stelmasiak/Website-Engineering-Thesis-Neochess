import {emit} from "../../../redux/actions/socketActions";
import {connect} from "react-redux";
import {mapAllStateToProps} from "../../../redux/reducers/rootReducer";
import "./DrawProposal.css"
import {setDrawProposedColor} from "../../../redux/actions/gameActions";

function DrawProposal({gameId, userId, dispatch, show, setShow}) {


    let answerDraw = (accepted) => {
        let evntAndMsg = {
            event: 'answer_draw',
            msg: JSON.stringify({
                'gameroomId': gameId,
                'playerId': userId,
                'accepted': accepted
            })
        }

        dispatch(setDrawProposedColor(null));
        dispatch(emit(evntAndMsg));
        setShow(false);
    }

    return (
        <>
            {show &&
            <div className="DrawProposal">
                  <h2>Opponent proposed a draw</h2>
                    <div className="DrawProposal-answers">
                        <button id="draw-accept" onClick={() => answerDraw(true)}>Accept</button>
                        <span>or</span>
                        <button id="draw-decline" onClick={() => answerDraw(false)}>Decline</button>
                    </div>
          </div>
            }
        </>
    );
}


export default connect(mapAllStateToProps)(DrawProposal);