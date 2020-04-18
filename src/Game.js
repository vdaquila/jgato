import React, { Component } from 'react';
import CatChooser from './CatChooser';
import GameBoard from './GameBoard';
import NewWindow from 'react-new-window'

class Game extends Component {

    constructor(props) {
        super(props);
        this.getSelectedCategories=this.getSelectedCategories.bind(this)
        this.state={
            game:{},
            gameGenerated:false,
        };
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

    renderGameBoard(){
        if (this.state.gameGenerated === true) {
            return (
                <>
                <GameBoard generatedGame={this.state.game} showAnswers={true} /> 
                <NewWindow features={{width:"1200", height:"800"}} name="GameBoard">
                    <GameBoard generatedGame={this.state.game} showAnswers={false} />                    
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