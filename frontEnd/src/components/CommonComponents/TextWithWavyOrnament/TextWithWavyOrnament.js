import "./TextWithWavyOrnament.css"
import ornament from "../../../assets/wavy-ornament.png";
import React, {Component} from "react";


class TextWithWavyOrnament extends Component{
    constructor(props) {
        super(props);
        this.text=this.props.text;
        this.ornamentStyle= { height: this.props.ornamentSize};
        this.directionStyle= {
            'direction' : this.props.direction
        };
    }

    render() {
        return (
            <div className="TextWithWavyOrnament" style={this.directionStyle}>
                <img style={this.ornamentStyle} src={ornament} alt="decorative ornament"/>
                <h1>{this.props.children}</h1>
            </div>

        );
    }

}
export default TextWithWavyOrnament;
