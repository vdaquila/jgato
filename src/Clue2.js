import React, { PureComponent } from 'react';
import ReactHtmlParser from 'react-html-parser';

class Clue extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            view: 'points', 
            completed: false,
            activeClueClicked: false,
            activeClueChild: false
        };
        this.clickHandler=this.clickHandler.bind(this);
        this.transitionEndHandler=this.transitionEndHandler.bind(this);
    }

    clickHandler(event) {
        if (this.state.view === 'points') {
            setTimeout(() => {
                if (this.state.view === "question") {
                }
            }, 1800);
            this.setState({view: 'question', flipping: true, activeClueClicked:true});
            this.props.getActiveClue(this.props.clue.id.toString());
        } else {
            this.setState({view: 'points', completed: true, flipping: true, activeClueClicked:false});
            this.props.getActiveClue('');
            this.props.isDailyDouble(false);
        }
    }

    transitionEndHandler(event) {
        if (event.propertyName === 'width') {
            this.setState({flipping: false});
        }
    }

    render() {
        
        let answer;
        let showDD = false;
        let isDD = this.props.clue.daily_double;
        let isFinal = this.props.isFinal;
        
        if (this.state.activeClueChild || this.state.activeClueClicked) {
            //console.log('checking ' + this.props.clue.id.toString() + 'to see if it is a DD');
            this.props.isDailyDouble(isDD);
        }

        if (this.props.showAnswers) {
            answer = <div className="answer">{ReactHtmlParser(this.props.clue.response.toString().replace("\\'","'"))}</div>
            if (isDD) {
                showDD =  true;
            }
        }

        let displayDDClue = this.props.displayDDClue;
        let dailyDouble;
        if (isDD && !displayDDClue) {
            
            dailyDouble = <div className="dd-overlay"></div>
        }
        
        let style = {
                width: this.props.width + 'px',
                height: this.props.height + 'px',
                transform: 'translate3d(' + this.props.left + 'px,' + this.props.top + 'px,0)',
                WebkitTransform: 'translate3d(' + this.props.left + 'px,' + this.props.top + 'px,0)'
            },
            front = this.state.completed ? '' : <><div className="dollar-amount">{`$${this.props.clue.value}`}</div>{showDD ? <div className="dd">DD</div> : ''}</>,
            className = 'flipper';
        
        if (isFinal) {
            front = <div className="cat-title">{this.props.catName}</div>
        }

        if (this.state.view !== 'points') {
            className = className + ' flipped';
        }
        if (this.state.flipping) {
            className = className + ' flipping';
        }

        //console.log('rendering clue ' + this.props.clue.id);
        if (this.props.currActiveClue === this.props.clue.id.toString() && this.state.view === 'points' && this.state.activeClueClicked === false ) {
            setTimeout(() => {
                if (this.state.view === "question") {
                }
            }, 1800);
            this.setState({view: 'question', flipping: true, activeClueChild:true});
            //console.log('flipped other q');
        }
        else if (this.props.currActiveClue !== this.props.clue.id.toString() && this.state.view === 'question' && this.state.activeClueChild === true){
            this.props.isDailyDouble(false);
            this.setState({view: 'points', completed: true, flipping: true, activeClueChild:false});  
        }

        return (
            <div style={style} className={className} onClick={this.clickHandler} onTransitionEnd={this.transitionEndHandler}>
                <div className={'clue' + (isFinal ? ' final-clue' : '')}>
                    <div className='front'>
                        {front}
                    </div>
                    <div className='back'>
                        {dailyDouble}
                        <div className={"cat-title" + (isFinal ? ' d-none' : '')}>{this.props.catName}</div>
                        <div className="clue-text">
                            {ReactHtmlParser(this.props.clue.clue.toString().replace("\\'","'"))}                             
                        </div>                                 
                        {answer}                        
                    </div>
                </div>
            </div>
        );
    }

};

export default Clue;