import React, {Component} from 'react';
import "./Dots.css"

export default class Dots extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = { dots: 1 };
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            const { dots } = this.state;
            this.setState({ dots: dots === 3 ? 0 : dots + 1 });
        }, 300);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const { dots } = this.state;
        let text = dots === 0 ? '' : '.'.repeat(dots);
        return (
            <span className="Dots">{text}</span>
        );
    }
}

