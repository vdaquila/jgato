import React, { Component } from 'react';
import Clue from './Clue2';

class GameBoard extends Component {
    
    constructor(props) {
        super(props);
        let sizeDownWidth = 1;
        let sizeDownHeight = 1;
        if (this.props.showAnswers === true) {
            sizeDownWidth = .5;
            sizeDownHeight = .7;
        }
        this.state={
            windowWidth: (this.props.windowForSizing.innerWidth*sizeDownWidth),
            windowHeight: (this.props.windowForSizing.innerHeight*sizeDownHeight),
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

    renderThanksForPlaying() {
        return (
            <>
            <header>
                <div className="nameplate">
                    Thanks for playing<br />
                    <span className="jeopardy-logo">Jeopardy!</span>
                </div>
            </header>
            <div className="loading">
                <iframe title="loading" src="https://giphy.com/embed/fLstPMMZA2upKXScA1" width="480" height="480" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/jeopardy--alex-trebek-fLstPMMZA2upKXScA1">via GIPHY</a></p>
            </div>
            </>
        )
    }

    renderHostHeader(){
        if (this.props.showAnswers) {
            return (
                <>
                    <header>
                        <div className="nameplate">
                            Host controls for<br />
                            <span className="jeopardy-logo">Jeopardy!</span>
                        </div>
                    </header>
                </>
            )
        }
        else return;
    }

    render() { 

        if (this.props.gameOver === false) {

            const showAnswers = this.props.showAnswers;
            let cardWidth = this.state.windowWidth / this.state.cols,
            cardHeight = this.state.windowHeight / (this.state.rows+1),
            clues = [],
            headers = []

            this.props.boardRound.categories.forEach((category, categoryIndex) => {
                let left = categoryIndex * cardWidth;
                headers.push(
                    <div className="header" key={category.id} style={{width:cardWidth + 'px',height:cardHeight + 'px'}}><div className="cat-name">{category.name}</div></div>
                );
                category.clues.forEach((question, questionIndex) => {
                    clues.push(
                        <Clue key={question.id} catName={category.name} showAnswers={showAnswers} clue={question} left={left} top={(questionIndex * cardHeight) + cardHeight} height={cardHeight} width={cardWidth} getActiveClue={this.props.getActiveClue} currActiveClue={this.props.activeClue} displayDDClue={this.props.displayDDClue} isDailyDouble={this.props.isDailyDouble} />
                    )
                })
            });

            return (
                <>
                 {this.renderHostHeader()}
                <div className={`board${showAnswers?' host': ''}`}>
                    <div className="headers">
                        {headers}
                    </div>
                    {clues}
                </div>
                </>
            );
        }
        else {
            return (
                <>
                {this.renderThanksForPlaying()}
                </>
            );
        }
    }
}
export default GameBoard;