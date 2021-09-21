import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';
import WindowedSelect, {createFilter} from 'react-windowed-select';


class CatSelector extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state={
            selectedOption: null,
        };
    }

    handleChange(selectedOption) {
        this.setState({selectedOption});
        this.props.onSelectorChange(this.props.roundName, selectedOption, this.props.maxChoices);
        //console.log(`Option selected for ${this.props.roundName}`, selectedOption);
    };


    render() { 
        const { selectedOption } = this.state;
        const cats = this.props.cats;
        const roundName = this.props.roundName;
        const roundTitle = this.props.roundTitle;
        const maxChoices = this.props.maxChoices;
        const dangerClass = (this.props.isValid ? "" : " text-danger");

        return (
            <Form.Group>
                <Form.Label htmlFor={roundName} className={"h3" + dangerClass}>{roundTitle}</Form.Label>
                <small className={"form-text" + dangerClass}>Choose {maxChoices} {parseInt(maxChoices) === 1 ? 'category' : 'categories'}.</small>
                <WindowedSelect
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={cats.map(cat => ({value:`${cat.id}`,label:`${cat.name.toUpperCase()} - show ${cat.show_number} - aired ${cat.airdate}`}))}
                    name={roundName}
                    isMulti={true}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    filterOption={createFilter({ignoreAccents: false})}
                    closeMenuOnSelect={roundName === "fjcid" ? true : false}
                />
            </Form.Group>
          );
    }
}
export default CatSelector;