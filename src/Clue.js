import React, { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';
import ReactCardFlip from 'react-card-flip';

class Clue extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isFlipped: false
          };
        this.handleClick = this.handleClick.bind(this);
    };

    handleClick(e) {
        e.preventDefault();
        this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
      }

    render() {
        let answer;
            if (this.props.showAnswers) {
                answer = <div className="answer">{ReactHtmlParser(this.props.clue.response.toString().replace("\\'","'"))}</div>
            }
        return (
            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal" infinite={true}>
            <div className="clue front" onClick={this.handleClick}>
                <div className="dollar-amount">{`$${this.props.clue.value}`}</div>
             </div>   
            <div className="clue back" onClick={this.handleClick}>
                <div className="clue-text">
                {ReactHtmlParser(this.props.clue.clue.toString().replace("\\'","'"))}                             
                </div>                                 
                {answer}                                            
            </div>           
        </ReactCardFlip>

        );
    }
    
}
export default Clue;