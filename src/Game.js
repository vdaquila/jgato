import React, { Component } from 'react';
import CatChooser from './CatChooser';
import Answers from './Answers';

class Game extends Component {
    render() {
        return (
            <div className="container game-wrapper"> 
              <h1 className="display-3">This... is... Jeopardy!</h1>
              <CatChooser />
              <Answers />
           </div>
        );
    }
}
export default Game;