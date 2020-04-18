import React, { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';

class Clue extends Component {

    constructor(props) {
        super(props);
        this.state = {view: 'points', completed: false};
    }

    clickHandler(event) {
        if (this.state.view === 'points') {
            setTimeout(() => {
                if (this.state.view === "question") {
                }
            }, 1800);
            this.setState({view: 'question', flipping: true});
        } else {
            this.setState({view: 'points', completed: true, flipping: true});
        }
    }

    transitionEndHandler(event) {
        if (event.propertyName === 'width') {
            this.setState({flipping: false});
        }
    }

    render() {
        let answer;
            if (this.props.showAnswers) {
                answer = <div className="answer">{ReactHtmlParser(this.props.clue.response.toString().replace("\\'","'"))}</div>
            }
        let style = {
                width: this.props.width + 'px',
                height: this.props.height + 'px',
                transform: 'translate3d(' + this.props.left + 'px,' + this.props.top + 'px,0)',
                WebkitTransform: 'translate3d(' + this.props.left + 'px,' + this.props.top + 'px,0)'
            },
            front = this.state.completed ? '' : <div className="dollar-amount">{`$${this.props.clue.value}`}</div>,
            className = 'flipper';

        if (this.state.view !== 'points') {
            className = className + ' flipped';
        }
        if (this.state.flipping) {
            className = className + ' flipping';
        }
        return (
            <div style={style} className={className} onClick={this.clickHandler.bind(this)} onTransitionEnd={this.transitionEndHandler.bind(this)}>
                <div className='clue'>
                    <div className='front'>
                        {front}
                    </div>
                    <div className='back'>
                        <div className="clue-text">
                        {ReactHtmlParser(this.props.clue.clue.toString().replace("\\'","'"))}                             
                        </div>                                 
                        {answer}                        
                    </div>
                </div>
            </div>
        );
    }

};

export default Clue;