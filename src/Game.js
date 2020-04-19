import React, { Component } from 'react';
import CatChooser from './CatChooser';
import GameBoard from './GameBoard';
import NewWindow from 'react-new-window';
import Button from 'react-bootstrap/Button';

class Game extends Component {

    constructor(props) {
        super(props);
        this.getSelectedCategories=this.getSelectedCategories.bind(this);
        this.getActiveClue=this.getActiveClue.bind(this);
        this.handleRefreshRound=this.handleRefreshRound.bind(this);
        this.state={
            game:{},
            gameGenerated:false,
            newWindow:window,
            activeClue:'',
            activeRound:{},
            nextRoundLabel:'Double Jeopardy',
            gameOver:false,
        };
    }

    getActiveClue(clueId){
        this.setState({activeClue:clueId});
    }


    getSelectedCategories(jcid,djcid,fjcid){
        let jcidQS = jcid.map(val => ("jcid=" + val)).join('&');
        let djcidQS = djcid.map(val => ("djcid=" + val)).join('&');
        let fjcidQS = fjcid.map(val => ("fjcid=" + val)).join('&');
        fetch(`https://192.168.2.217:8443/api/play/?${jcidQS}&${djcidQS}&${fjcidQS}`)
            .then(res => res.json())
            .then(
            (result) => {
                this.setState({
                game:result,
                gameGenerated:true,
                activeRound:result.jeopardy_round,
                });
                console.log(result.jeopardy_round);
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
                this.setState({
                error
                });
            }
        )
    }

    componentWillUnmount(){
        console.log('game unloading');
        if (this.state.newWindow !== window) {
            this.state.newWindow.close();
        }
    }

    handleRefreshRound(){
        let nextRLabel, nextRound;
        if (this.state.nextRoundLabel !== 'End Game') {
            if (this.state.nextRoundLabel === 'Double Jeopardy') {
                nextRLabel = 'Final Jeopardy';
                nextRound = this.state.game.double_jeopardy_round;
            }
            else if (this.state.nextRoundLabel === 'Final Jeopardy') {
                nextRLabel = 'End Game';
                nextRound = this.state.game.final_jeopardy_round;
            }
            this.setState({
                nextRoundLabel: nextRLabel,
                activeRound: nextRound,
            });
        }   
        else {
            this.setState({gameOver:true});
        }
    }

    renderThanksForPlaying(){
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

    renderGameBoard(){
        if (this.state.gameGenerated === true) {
            return (
                <>
                <Button onClick={this.handleRefreshRound}>Move to {this.state.nextRoundLabel}</Button>
                <GameBoard boardRound={this.state.activeRound} showAnswers={true} windowForSizing={window} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} gameOver={this.state.gameOver} />                 
                <NewWindow features={{width:"1200", height:"800"}} title="The Game!" center="screen" 
                    onOpen={(newWin) => (this.setState({newWindow:newWin}))} onUnload={() => {console.log('unloading window');}}>
                    <GameBoard boardRound={this.state.activeRound} showAnswers={false} windowForSizing={this.state.newWindow} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} gameOver={this.state.gameOver} />        
                </NewWindow>
                </>
            )
        }  
        else {
            return;
        }
    }

    renderCatChooser(){
        if (this.state.gameGenerated === false) {
            return (
                <CatChooser passBackSelections={this.getSelectedCategories} />
            );
        }
        else return;
    }

    render() {
        return (
            <>            
            {this.renderCatChooser()}      
            {this.renderGameBoard()}       
            </>
        )
    }
}
export default Game;