import React, {Component} from 'react';
import "./SectionTitle.css";

class SectionTitle extends Component {

    render() {
        return (
            <h1 className="SectionTitle">
                <span>{this.props.children}</span>
                <div className="SectionTitle-ornament"/>
            </h1>
        );
    }

}

export default SectionTitle;