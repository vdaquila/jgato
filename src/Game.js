import React, { Component } from 'react';
import CatChooser from './CatChooser';
import GameBoard from './GameBoard';
import NewWindow from 'react-new-window'

class Game extends Component {

    constructor(props) {
        super(props);
        this.getSelectedCategories=this.getSelectedCategories.bind(this)
        this.state={
            catSelections:{},
            gameGenerated:false,
        };
    }

    getSelectedCategories(jcid,djcid,fjcid){
        this.setState({catSelections: {jcid, djcid, fjcid}});
        this.setState({gameGenerated:true});
    }

    renderGameBoard(){
        if (this.state.gameGenerated === true) {
            return (
                <>
                <GameBoard selectedCategories={this.state.catSelections} showAnswers={true} /> 
                <NewWindow features={{width:"600"}}>
                    <GameBoard selectedCategories={this.state.catSelections} showAnswers={false} />
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
            <div className="container game-wrapper"> 
                <header>
                    <div className="nameplate">
                        This... is...<br />
                        <span className="jeopardy-logo">Jeopardy!</span>
                    </div>
                </header>
                {this.renderCatChooser()}      
                {this.renderGameBoard()}       
           </div>
        );
    }
}
export default Game;