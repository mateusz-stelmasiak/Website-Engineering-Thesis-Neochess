import React, {Component} from 'react';
import "./SectionTitle.css";

class SectionTitle extends Component {

    render() {
        return (
            <span className="SectionTitle">
                <hr/>
                <span>{this.props.children}</span>
                <hr/>
            </span>

        );
    }
}

export default SectionTitle;