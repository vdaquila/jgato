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
        this.handleDailyDouble=this.handleDailyDouble.bind(this);
        this.checkDailyDouble=this.checkDailyDouble.bind(this);
        this.state={
            game:{},
            gameGenerated:false,
            newWindow:window,
            activeClue:'',
            activeRound:{},
            nextRoundLabel:'Double Jeopardy',
            gameOver:false,
            inDailyDouble:false,
            displayDDClue:false,
            isFinal: false,
        };
    }

    getActiveClue(clueId){
        //console.log('setting active clue id', clueId);
        this.setState({activeClue:clueId});
    }


    getSelectedCategories(jcid,djcid,fjcid){
        let jcidQS = jcid.map(val => ("jcid=" + val)).join('&');
        let djcidQS = djcid.map(val => ("djcid=" + val)).join('&');
        let fjcidQS = fjcid.map(val => ("fjcid=" + val)).join('&');
        fetch(`${process.env.REACT_APP_JGATO_API}api/play/?${jcidQS}&${djcidQS}&${fjcidQS}`)
            .then(res => res.json())
            .then(
            (result) => {
                this.setState({
                game:result,
                gameGenerated:true,
                activeRound:result.jeopardy_round,
                });
                //console.log(result.jeopardy_round);
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
        //console.log('game unloading');
        if (this.state.newWindow !== window) {
            this.state.newWindow.close();
        }
    }

    handleRefreshRound(){

        if (this.state.gameOver === true) {
            this.setState({
                game:{},
                gameGenerated:false,
                newWindow:window,
                activeClue:'',
                activeRound:{},
                nextRoundLabel:'Double Jeopardy',
                gameOver:false,
                inDailyDouble:false,
                displayDDClue:false,
                isFinal:false,
            })
        }
        else {
            let nextRLabel, nextRound;
            let isFinalJ = false;
            if (this.state.nextRoundLabel !== 'End Game') {

                if (this.state.nextRoundLabel === 'Double Jeopardy') {
                    nextRLabel = 'Final Jeopardy';
                    nextRound = this.state.game.double_jeopardy_round;
                }
                else if (this.state.nextRoundLabel === 'Final Jeopardy') {
                    nextRLabel = 'End Game';
                    nextRound = this.state.game.final_jeopardy_round;
                    isFinalJ = true;
                }
                this.setState({
                    nextRoundLabel: nextRLabel,
                    activeRound: nextRound,
                    isFinal:isFinalJ,
                });
            }   
            else {
                nextRLabel = 'Start New Game';
                this.setState({
                    gameOver:true, 
                    nextRoundLabel: nextRLabel,});
            }
        }
    }

    handleDailyDouble(){
        this.setState({
            displayDDClue:true,
        })

    }

    checkDailyDouble(isDD){
        if (isDD) {
            this.setState({
                inDailyDouble:true,
            })
        }
        else {
            this.setState({
                displayDDClue:false,
                inDailyDouble:false,
            })
        }
    }

    renderGameBoard(){
        if (this.state.gameGenerated === true) {
            return (
                <>                
                <div className="mx-5 my-3">
                    <GameBoard 
                        boardRound={this.state.activeRound} 
                        showAnswers={true} 
                        windowForSizing={window} 
                        getActiveClue={this.getActiveClue} 
                        activeClue={this.state.activeClue} 
                        gameOver={this.state.gameOver} 
                        displayDDClue={this.state.displayDDClue} 
                        isDailyDouble={this.checkDailyDouble} 
                        isFinal={this.state.isFinal} />                 
                   
                    <div className={"host-controls" + (this.state.gameOver ? ' game-over' : '')}>
                        <Button onClick={this.handleRefreshRound} className="btn btn-primary btn-lg btn-block">{this.state.nextRoundLabel}</Button>
                        <Button onClick={this.handleDailyDouble} className={'btn btn-danger btn-lg btn-block' + (!this.state.inDailyDouble || this.state.displayDDClue ? ' d-none' : '')}>Reveal Daily Double Clue</Button>
                    </div>
                
                </div>
                
                <NewWindow 
                    features={{width:"1200", height:"800"}} 
                    title="The Game!" 
                    center="screen" 
                    onOpen={(newWin) => (this.setState({newWindow:newWin}))} 
                    onUnload={() => {console.log('unloading window');}}>
                    
                    <GameBoard 
                        boardRound={this.state.activeRound} 
                        showAnswers={false} 
                        windowForSizing={this.state.newWindow} 
                        getActiveClue={this.getActiveClue} 
                        activeClue={this.state.activeClue} 
                        gameOver={this.state.gameOver} 
                        displayDDClue={this.state.displayDDClue} 
                        isDailyDouble={this.checkDailyDouble}
                        isFinal={this.state.isFinal} />        
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