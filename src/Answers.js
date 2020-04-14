import React, { Component } from 'react';
import game_board from './game_board';
import ReactHtmlParser from 'react-html-parser';


class Answers extends Component {
    
    constructor(props) {
        super(props);
        this.state={
            error: null,
            isLoaded: false,
            rounds:{},
        };
    }

    componentDidMount(){
        this.setState({
            isLoaded:true,
            rounds:game_board,
        });
        console.log('component mounted');
    }
    
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

    render() { 
        if (this.state.isLoaded === true) {
            return (
                <div className="row mb-5 bg-light p-3">
                    <div className="col">
                        <h3>Jeopardy</h3>
                        <div className="category">
                            {this.renderCategoryAnswers(0, this.state.rounds.jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(1, this.state.rounds.jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(2, this.state.rounds.jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(3, this.state.rounds.jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(4, this.state.rounds.jeopardy_round)}
                        </div>
                    </div>
                    <div className="col">
                        <h3>Double Jeopardy</h3>
                        <div className="category">
                            {this.renderCategoryAnswers(0, this.state.rounds.double_jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(1, this.state.rounds.double_jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(2, this.state.rounds.double_jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(3, this.state.rounds.double_jeopardy_round)}
                        </div>
                        <div className="category">
                            {this.renderCategoryAnswers(4, this.state.rounds.double_jeopardy_round)}
                        </div>
                    </div>
                    <div className="col">
                        <h3>Final Jeopardy Answer</h3>
                        <div className="category">
                            <h4>{this.state.rounds.final_jeopardy_round.categories[0].name.toUpperCase()}</h4>
                            <strong>Clue:</strong> {ReactHtmlParser(this.state.rounds.final_jeopardy_round.categories[0].clues[0].clue.toString().replace("\\'","'"))}<br />
                            <strong>Response:</strong> {ReactHtmlParser(this.state.rounds.final_jeopardy_round.categories[0].clues[0].response.toString().replace("\\'","'"))}
                        </div>
                        
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>Loading Answers...</div>
            );
        }

    }
}
export default Answers;