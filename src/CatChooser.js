import React, { Component } from 'react';
import CatSelector from './CatSelector';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
//import category_picker from './category_picker'

class CatChooser extends Component {

    constructor(props) {
        super(props);
        this.state={
            error: null,
            isLoaded: false,
            rounds:{},
            formValid:false,
        };
    }

    /*componentDidMount(){
        this.setState({
            isLoaded:true,
            rounds:category_picker,
        })
    }*/


     componentDidMount() {
        fetch("https://192.168.2.217:8443/api/cat_picker/")
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
    

    render() { 

        const handleSubmit = (event) => {
            
            event.preventDefault();
            event.stopPropagation();
            
            //this.setState({formValid:true});
        };

        if (this.state.isLoaded === true) {
            const rounds = this.state.rounds;
            return (
                <Form noValidate validated={this.state.formValid} onSubmit={handleSubmit} className="mb-5 bg-light p-3">
                    <CatSelector cats={rounds.jeopardy_round.categories} roundName="jcid" roundTitle="Jeopardy" />
                    <CatSelector cats={rounds.double_jeopardy_round.categories} roundName="djcid" roundTitle="Double Jeopardy" />
                    <CatSelector cats={rounds.final_jeopardy_round.categories} roundName="fjcid" roundTitle="Final Jeopardy"/>
                    <Button type="submit">Generate Game</Button>
                </Form>
            );
        }
        else {
            return (
                <div>Loading</div>
            );
        }
    }
}
export default CatChooser;