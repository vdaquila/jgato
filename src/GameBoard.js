import React, { Component } from 'react';
import Clue from './Clue2';

class GameBoard extends Component {
    
    constructor(props) {
        super(props);
        let sizeDown = 1;
        if (this.props.showAnswers === true) {
            sizeDown = .8;
        }
        this.state={
            windowWidth: (this.props.windowForSizing.innerWidth*sizeDown),
            windowHeight: (this.props.windowForSizing.innerHeight*sizeDown),
        };
    } 

    handleResize(event) {
        let sizeDown = 1;
        if (this.props.showAnswers === true) {
            sizeDown = .8;
        }
        this.setState({
            windowWidth: (this.props.windowForSizing.innerWidth*sizeDown),
            windowHeight: (this.props.windowForSizing.innerHeight*sizeDown),
        });
    }

    componentDidMount() {
        this.props.windowForSizing.addEventListener('resize', this.handleResize.bind(this));
        this.setState({rows: 5, cols: 5});
    }

    componentWillUnmount() {
        this.props.windowForSizing.removeEventListener('resize', this.handleResize);
        console.log('unmounting gameboard');
    }

    render() { 
        const showAnswers = this.props.showAnswers;
        let cardWidth = this.state.windowWidth / this.state.cols,
        cardHeight = this.state.windowHeight / (this.state.rows+1),
        clues = [],
        headers = []

        this.props.boardRound.categories.forEach((category, categoryIndex) => {
            let left = categoryIndex * cardWidth;
            headers.push(
                <div className="header" key={category.id} style={{width:cardWidth + 'px',height:cardHeight + 'px'}}>{category.name}</div>
            );
            category.clues.forEach((question, questionIndex) => {
                clues.push(
                    <Clue key={question.id} showAnswers={showAnswers} clue={question} left={left} top={(questionIndex * cardHeight) + cardHeight} height={cardHeight} width={cardWidth} getActiveClue={this.props.getActiveClue} currActiveClue={this.props.activeClue} />
                 )
            })
        });

        return (
            <div className={`board${showAnswers?' host': ''}`}>
                <div className="headers">
                    {headers}
                </div>
                {clues}
            </div>
        );
    }
}
export default GameBoard;