import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import WindowedSelect, {createFilter} from 'react-windowed-select';


class CatSelector extends Component {
    constructor(props) {
        super(props);
        this.state={
            selectedOption: null,
        };
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
        console.log(`Option selected:`, selectedOption);
    };


    render() { 
        const { selectedOption } = this.state;
        const cats = this.props.cats;
        const roundName = this.props.roundName;
        const roundTitle = this.props.roundTitle;
        var maxChoices;

        if (roundTitle === "Final Jeopardy") {
            maxChoices = 1;
        }
        else {
            maxChoices = 5;
        }

        return (
            <Form.Group>
                <Form.Label htmlFor="{roundName}" className="h3">{roundTitle}</Form.Label>
                <small className="form-text text-muted">Choose {maxChoices} {maxChoices === 1 ? 'category' : 'categories'}.</small>
                <WindowedSelect
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={cats.map(cat => ({value:`${cat.show_number}:${cat.id}`,label:`${cat.name.toUpperCase()} - show ${cat.show_number} - aired ${cat.airdate}`}))}
                    name={roundName}
                    isMulti={true}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    filterOption={createFilter({ignoreAccents: false})}
                />
            </Form.Group>
          );
    }
}
export default CatSelector;