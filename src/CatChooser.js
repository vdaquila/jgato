import React, { Component } from 'react';
import CatSelector from './CatSelector';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

//import category_picker from './category_picker'

class CatChooser extends Component {

    constructor(props) {
        super(props);
        this.handleCategorySelection = this.handleCategorySelection.bind(this);
        this.state={
            error: null,
            isLoaded: false,
            rounds:{},
            formValid:false,
            jcid: [],
            djcid: [],
            fjcid: [],
            validSelectors: {
                jcid:true,
                djcid:true,
                fjcid:true,
            },
            formSubmitted:false,
        };
    }

    /*componentDidMount(){
        this.setState({
            isLoaded:true,
            rounds:category_picker,
        })
    }*/


    componentDidMount() {
        fetch(process.env.REACT_APP_JGATO_API+"/api/cat_picker/")
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

    handleCategorySelection(roundName,selectedOptions,maxChoices) {
        if (selectedOptions === null) {
            selectedOptions = [];
        }
        this.setState({[roundName]:selectedOptions});
        
        if (this.state.formSubmitted){
            this.setState(prevState => ({
                validSelectors: {
                ...prevState.validSelectors, 
                [roundName]: selectedOptions.length === parseInt(maxChoices)
                }
            }))
        }
        //console.log(`Option selected:`, selectedOptions);
    }

    renderAlert() {
        if (this.state.formSubmitted === true) {
            if (this.state.formValid === true) {
                return <Alert variant="success">Game generated!</Alert>
            }
            else {
                return <Alert variant="danger">Please correct the errors highlighted below.</Alert>
            }
        }
        else return;
    }

    render() { 

        const handleSubmit = (event) => {
            
            event.preventDefault();
            event.stopPropagation();

            this.setState({validSelectors: {
                jcid: (this.state.jcid.length === 5), 
                djcid: (this.state.djcid.length === 5),
                fjcid: (this.state.fjcid.length === 1)}}, function(){
                    this.setState({formSubmitted:true});
                    if (this.state.validSelectors.jcid === true && this.state.validSelectors.djcid === true && this.state.validSelectors.fjcid === true) {                
                        this.setState({formValid:true});
                        this.props.passBackSelections(
                            this.state.jcid.map(cat => (cat.value)),
                            this.state.djcid.map(cat => (cat.value)),
                            this.state.fjcid.map(cat => (cat.value)),);
                        }                    
                });
        };

        if (this.state.isLoaded === true) {
            const rounds = this.state.rounds;
            return (
                <>
                <header>
                    <div className="nameplate">
                        This... is...<br />
                        <span className="jeopardy-logo">Jeopardy!</span>
                    </div>
                </header>
                <div className="container">
                    {this.renderAlert()}
                    <Form noValidate validated={this.state.formValid} onSubmit={handleSubmit} className="mb-5 bg-light p-3">
                        <CatSelector cats={rounds.jeopardy_round.categories} roundName="jcid" roundTitle="Jeopardy" maxChoices="5" onSelectorChange={this.handleCategorySelection} isValid={this.state.validSelectors.jcid} />
                        <CatSelector cats={rounds.double_jeopardy_round.categories} roundName="djcid" roundTitle="Double Jeopardy" maxChoices="5" onSelectorChange={this.handleCategorySelection} isValid={this.state.validSelectors.djcid} />
                        <CatSelector cats={rounds.final_jeopardy_round.categories} roundName="fjcid" roundTitle="Final Jeopardy" maxChoices="1" onSelectorChange={this.handleCategorySelection} isValid={this.state.validSelectors.fjcid} />
                        <Button type="submit">Generate Game</Button>
                    </Form>
                </div>
                </>
            );
        }
        else {
            return (
                <>
                <header>
                    <div className="nameplate">
                        This... is...<br />
                        <span className="jeopardy-logo">Jeopardy!</span>
                    </div>
                </header>
                <div className="loading">
                    <iframe title="loading" src="https://giphy.com/embed/fLstPMMZA2upKXScA1" width="480" height="480" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/jeopardy--alex-trebek-fLstPMMZA2upKXScA1">via GIPHY</a></p>
                </div>
                </>
            );
        }
    }
}
export default CatChooser;