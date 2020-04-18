import React, { Component } from 'react';
import Clue from './Clue2';


class GameBoard extends Component {
    
    constructor(props) {
        super(props);
        this.state={
            activeClue:'',
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
        };
    } 

    handleResize(event) {
        this.setState({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.setState({rows: 5, cols: 5});
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }

    render() { 
        const showAnswers = this.props.showAnswers;
        let cardWidth = this.state.windowWidth / this.state.cols,
        cardHeight = this.state.windowHeight / (this.state.rows+1),
        clues = [],
        headers = []

        this.props.generatedGame.jeopardy_round.categories.forEach((category, categoryIndex) => {
            let left = categoryIndex * cardWidth;
            headers.push(
                <div className="header" style={{width:cardWidth + 'px',height:cardHeight + 'px'}}>{category.name}</div>
            );
            category.clues.forEach((question, questionIndex) => {
                clues.push(
                    <Clue id={question.id} showAnswers={showAnswers} clue={question} left={left} top={(questionIndex * cardHeight) + cardHeight} height={cardHeight} width={cardWidth} />
                 )
            })
            console.log("category: " + category.name + " " + category.id + " " + categoryIndex + "showAnswers: " + showAnswers.toString());
        });
        return (
            <div className="board">
                <div className="headers">
                    {headers}
                </div>
                {clues}
            </div>
        );
    }
}
export default GameBoard;