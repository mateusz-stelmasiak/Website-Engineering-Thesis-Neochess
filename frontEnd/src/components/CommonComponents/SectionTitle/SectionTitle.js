import React, {Component} from 'react';
import "./SectionTitle.css";

class SectionTitle extends Component {

    render() {
        return (
            <div className="SectionTitle">
                <div className="SectionTitle-title">{this.props.children}</div>
                <div className="SectionTitle-ornament"/>
            </div>
        );
    }

}

export default SectionTitle;