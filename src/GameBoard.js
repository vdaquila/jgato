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
        let sizeDownWidth = 1;
        let sizeDownHeight = 1;
        if (this.props.showAnswers === true) {
            sizeDownWidth = .5;
            sizeDownHeight = .7;
        }
        this.setState({
            windowWidth: (this.props.windowForSizing.innerWidth*sizeDownWidth),
            windowHeight: (this.props.windowForSizing.innerHeight*sizeDownHeight),
        });
    }

    componentDidMount() {
        this.props.windowForSizing.addEventListener('resize', this.handleResize.bind(this));
    }

    componentWillUnmount() {
        this.props.windowForSizing.removeEventListener('resize', this.handleResize);
        //console.log('unmounting gameboard');
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

            const isFinal = this.props.isFinal;
            const showAnswers = this.props.showAnswers;
            const rows = isFinal ? 1 : 6;
            const cols = isFinal ? 1 : 5;
            let cardWidth = this.state.windowWidth / cols,
            cardHeight = this.state.windowHeight / rows,
            clues = [],
            headers = []

            this.props.boardRound.categories.forEach((category, categoryIndex) => {
                let left = categoryIndex * cardWidth;
                let airDate;
                if (showAnswers) {
                    airDate = <><br /><span class="airdate">Airdate: {category.airdate}</span></>;
                }
                headers.push(
                    <div className="header" key={category.id} style={{width:cardWidth + 'px',height:cardHeight + 'px'}}><div className="cat-name">{category.name}{airDate}</div></div>
                );
                category.clues.forEach((question, questionIndex) => {
                    let top = (questionIndex * cardHeight) + cardHeight;
                    if (isFinal) {
                        top = top - cardHeight;
                    }
                    clues.push(
                        <Clue 
                            key={question.id} 
                            catName={category.name}
                            airDate={category.airdate} 
                            showAnswers={showAnswers} 
                            clue={question} 
                            left={left} 
                            top={top} 
                            height={cardHeight} 
                            width={cardWidth} 
                            getActiveClue={this.props.getActiveClue} 
                            currActiveClue={this.props.activeClue} 
                            displayDDClue={this.props.displayDDClue} 
                            isDailyDouble={this.props.isDailyDouble} 
                            isFinal={isFinal} />
                    )
                })
            });

            let roundHeaders;
            
            if (!isFinal) {
                roundHeaders = <div className="headers">{headers}</div>;
            }

            return (
                <>
                 {this.renderHostHeader()}
                <div className={`board${showAnswers?' host': ''}`}>
                    {roundHeaders}
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