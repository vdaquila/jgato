import React, { Component } from 'react';
import ReactHtmlParser from 'react-html-parser';


class GameBoard extends Component {
    
    constructor(props) {
        super(props);
        this.state={
            error: null,
            isLoaded: false,
            rounds:{},
        };
    }

    componentDidMount() {
        let jcidQS = this.props.selectedCategories.jcid.map(val => ("jcid=" + val)).join('&');
        let djcidQS = this.props.selectedCategories.djcid.map(val => ("djcid=" + val)).join('&');
        let fjcidQS = this.props.selectedCategories.fjcid.map(val => ("fjcid=" + val)).join('&');
        fetch(`https://192.168.2.217:8443/api/play/?${jcidQS}&${djcidQS}&${fjcidQS}`)
            .then(res => res.json())
            .then(
            (result) => {
                this.setState({
                isLoaded: true,
                rounds:result
                });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
                isLoaded: true,
                error
                });
            }
        )
    }

    /*componentDidMount(){
        this.setState({
            isLoaded:true,
            rounds:game_board,
        });
        console.log('component mounted');
    }*/
    
    renderCategoryAnswers(i, round) {
        const currentCategory = round.categories[i];
        console.log(round, currentCategory);
        
        return (
            <>
                <h4>{currentCategory.name.toUpperCase()}</h4>
                <ol>
                    <li><strong>Clue:</strong> {ReactHtmlParser(currentCategory.clues[0].clue.toString().replace("\\'","'"))}<br />
                    <strong>Response:</strong> {ReactHtmlParser(currentCategory.clues[0].response.toString().replace("\\'","'"))}</li>
                    <li><strong>Clue:</strong> {ReactHtmlParser(currentCategory.clues[1].clue.toString().replace("\\'","'"))}<br />
                    <strong>Response:</strong> {ReactHtmlParser(currentCategory.clues[1].response.toString().replace("\\'","'"))}</li>
                    <li><strong>Clue:</strong> {ReactHtmlParser(currentCategory.clues[2].clue.toString().replace("\\'","'"))}<br />
                    <strong>Response:</strong> {ReactHtmlParser(currentCategory.clues[2].response.toString().replace("\\'","'"))}</li>
                    <li><strong>Clue:</strong> {ReactHtmlParser(currentCategory.clues[3].clue.toString().replace("\\'","'"))}<br />
                    <strong>Response:</strong> {ReactHtmlParser(currentCategory.clues[3].response.toString().replace("\\'","'"))}</li>
                    <li><strong>Clue:</strong> {ReactHtmlParser(currentCategory.clues[4].clue.toString().replace("\\'","'"))}<br />
                    <strong>Response:</strong> {ReactHtmlParser(currentCategory.clues[4].response.toString().replace("\\'","'"))}</li>
                </ol>
            </>
        );
    }

    renderCategoryBoard(i,round) {
        const currentCategory = round.categories[i];
        const showAnswers = this.props.showAnswers;

        let clues = [];

        for (let x=0; x<5; x++) {
            let answer;
            if (showAnswers) {
                answer = <div className="answer">{`Response: ${ReactHtmlParser(currentCategory.clues[x].response.toString().replace("\\'","'"))}`}</div>
            }
            clues.push(
                <>
                    <div className="clue">
                        <div className="dollar-amount">{`$${currentCategory.clues[x].value}`}</div>
                        <div className="clue-text">
                            {ReactHtmlParser(currentCategory.clues[x].clue.toString().replace("\\'","'"))}                             
                        </div>                                 
                        {answer}
                    </div>
                </>
            )
        }
        
        return (
            <div className="col">
                <div className="category-title">{currentCategory.name.toUpperCase()}</div>
                {clues}
            </div>
        );
    }

    render() { 
        if (this.state.isLoaded === true) {
            const showAnswers = this.props.showAnswers;
            let final_answer;
            if (showAnswers) {
                final_answer = <div className="answer">{`Response: ${ReactHtmlParser(this.state.rounds.final_jeopardy_round.categories[0].clues[0].response.toString().replace("\\'","'"))}`}</div>
            }
            return (
                <>
                    <h3>Jeopardy</h3>
                    <div className="row mb-5 bg-light p-3">                        
                        {this.renderCategoryBoard(0, this.state.rounds.jeopardy_round)}
                        {this.renderCategoryBoard(1, this.state.rounds.jeopardy_round)}
                        {this.renderCategoryBoard(2, this.state.rounds.jeopardy_round)}
                        {this.renderCategoryBoard(3, this.state.rounds.jeopardy_round)}
                        {this.renderCategoryBoard(4, this.state.rounds.jeopardy_round)}
                    </div>
                    <h3>Double Jeopardy</h3>
                    <div className="row mb-5 bg-light p-3">
                        {this.renderCategoryBoard(0, this.state.rounds.double_jeopardy_round)}
                        {this.renderCategoryBoard(1, this.state.rounds.double_jeopardy_round)}
                        {this.renderCategoryBoard(2, this.state.rounds.double_jeopardy_round)}
                        {this.renderCategoryBoard(3, this.state.rounds.double_jeopardy_round)}
                        {this.renderCategoryBoard(4, this.state.rounds.double_jeopardy_round)}
                    </div>
                    <h3>Final Jeopardy</h3>
                    <div className="row mb-5 bg-light p-3">
                        <div className="col-12">
                            <div className="category-title">{this.state.rounds.final_jeopardy_round.categories[0].name.toUpperCase()}</div>
                            <div className="clue-text">
                                {ReactHtmlParser(this.state.rounds.final_jeopardy_round.categories[0].clues[0].clue.toString().replace("\\'","'"))}
                            </div>
                            {final_answer}                        
                        </div>
                    </div>
                </>
            );
        }
        else {
            return (
                <div class="loading">
                    <iframe title="loading" src="https://giphy.com/embed/fLstPMMZA2upKXScA1" width="480" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/jeopardy--alex-trebek-fLstPMMZA2upKXScA1">via GIPHY</a></p>
                </div>
            );
        }

    }
}
export default GameBoard;