import React, { Component } from 'react';
import CatChooser from './CatChooser';
import GameBoard from './GameBoard';
import NewWindow from 'react-new-window'

class Game extends Component {

    constructor(props) {
        super(props);
        this.getSelectedCategories=this.getSelectedCategories.bind(this);
        this.getActiveClue=this.getActiveClue.bind(this);
        this.state={
            game:{},
            gameGenerated:false,
            newWindow:window,
            activeClue:'',
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
                });
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

    renderGameBoard(){
        if (this.state.gameGenerated === true) {
            return (
                <>
                <GameBoard boardRound={this.state.game.jeopardy_round} showAnswers={true} windowForSizing={window} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} /> 
                <GameBoard boardRound={this.state.game.double_jeopardy_round} showAnswers={true} windowForSizing={window} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} /> 
                <GameBoard boardRound={this.state.game.final_jeopardy_round} showAnswers={true} windowForSizing={window} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} /> 
                <NewWindow features={{width:"1200", height:"800"}} name="GameBoard" title="The Game!" center="screen" 
                    onOpen={(newWin) => (this.setState({newWindow:newWin}))} onUnload={() => {console.log('unloading window');}}>
                    <GameBoard boardRound={this.state.game.jeopardy_round} showAnswers={false} windowForSizing={this.state.newWindow} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} />        
                    <GameBoard boardRound={this.state.game.double_jeopardy_round} showAnswers={false} windowForSizing={this.state.newWindow} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} />     
                    <GameBoard boardRound={this.state.game.final_jeopardy_round} showAnswers={false} windowForSizing={this.state.newWindow} getActiveClue={this.getActiveClue} activeClue={this.state.activeClue} />              
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