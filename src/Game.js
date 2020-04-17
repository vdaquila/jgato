import React, { Component } from 'react';
import CatChooser from './CatChooser';
import Answers from './Answers';

class Game extends Component {

    constructor(props) {
        super(props);
        this.getSelectedCategories=this.getSelectedCategories.bind(this)
        this.state={
            error: null,
            isLoaded: false,
            catSelections:{},
        };
    }

    getSelectedCategories(jcid,djcid,fjcid){
        this.setState({catSelections: {jcid, djcid, fjcid}});
    }

    renderAnswers(){
        if (Object.keys(this.state.catSelections).length !== 0) {
            return <Answers selectedCategories={this.state.catSelections} />
        }
        else {
            return;
        }
    }

    render() {
        return (
            <div className="container game-wrapper"> 
              <h1 className="display-3">This... is... Jeopardy!</h1>
              <CatChooser passBackSelections={this.getSelectedCategories} />
              {this.renderAnswers()}
              <div>Boards?</div>
           </div>
        );
    }
}
export default Game;