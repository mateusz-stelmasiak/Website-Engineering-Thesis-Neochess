import "./GameContainer.css"
import {Component} from "react";
import {connect} from "react-redux";


class GameContainer extends Component{
    constructor(props) {
        super(props);
        this.style=props.style;
    }

    render() {
        return (
            <section style={this.style} className={this.props.gameMode==='0'? "GameContainer":"GameContainer ChessDefenderGameContainer"} id="GAME_CONTAINER">
                {this.props.children}
            </section>
        );
    }

}
// Map Redux state to React component props
const mapStateToProps = (state) => {
    return {
        gameMode: state.game.gameMode,
    };
};
export default connect(mapStateToProps)(GameContainer);