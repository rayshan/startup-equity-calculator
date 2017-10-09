import React, {Component} from 'react';
import './Grant.css';

import App from './App.js';

import DatePicker from 'antd/es/date-picker';
import 'antd/es/date-picker/style/css';
import InputNumber from 'antd/es/input-number';
import 'antd/es/input-number/style/css';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style/css';
import Button from 'antd/es/button';
import 'antd/es/button/style/css';

const {MonthPicker} = DatePicker;

class Grant extends Component {
    handleStartDateChange(value) {
        this.props.handleUpdateAction({
            startDate: value,
            sharesGranted: this.props.sharesGranted,
            exercisePrice: this.props.exercisePrice,
        });
    }

    handleSharesGrantedChange(value) {
        this.props.handleUpdateAction({
            startDate: this.props.startDate,
            sharesGranted: value,
            exercisePrice: this.props.exercisePrice,
        });
    }

    handleExercisePriceChange(value) {
        this.props.handleUpdateAction({
            startDate: this.props.startDate,
            sharesGranted: this.props.sharesGranted,
            exercisePrice: value,
        });
    }

    get initialGrantView() {
        return [
            <div key="start-date">
                <label>Your job starts in</label>
                <MonthPicker
                    defaultValue={this.props.startDate}
                    placeholder="Select month"
                    format="MMM YYYY"
                    allowClear={false}
                    onChange={this.handleStartDateChange.bind(this)}
                />
            </div>,
            <div key="options">
                <label htmlFor="shares-grant-1">
                    <span>You are given</span>
                    <InputNumber
                        id="shares-grant-1"
                        defaultValue={this.props.sharesGranted}
                        formatter={App.formattedNumberFrom}
                        min={1}
                        max={this.props.sharesOutstanding}
                        step={1000}
                        onChange={this.handleSharesGrantedChange.bind(this)}
                    />
                    <span>stock options, for <span className="bold">{this.props.ownership}%</span> of the startup,</span>
                </label>
            </div>,
            <div key="exercise-price">
                <label htmlFor="exercise-price">
                    <span>which you can use to buy equity in your startup by paying</span>
                    <InputNumber
                        id="exercise-price"
                        defaultValue={this.props.exercisePrice}
                        formatter={App.formattedLargeCurrencyFrom}
                        min={0.01}
                        step={0.01}
                        onChange={this.handleExercisePriceChange.bind(this)}
                    />
                    <span>
                        per share for a total of
                        <span className="bold"> {App.formattedLargeCurrencyFrom(this.props.exerciseCost)}</span>
                        .
                    </span>
                </label>
            </div>,
        ];
    }

    get subsequentGrantView() {
        return (
            <div className="remove-grant">
                <Tooltip title="Remove this grant">
                    <Button type="primary" shape="circle" icon="close" disabled />
                </Tooltip>
            </div>
        );
    }

    render() {
        return (
            <fieldset className="grant">
                <legend>{this.props.name}</legend>
                {this.props.type === Grant.types.initial ?
                    this.initialGrantView : this.subsequentGrantView}
            </fieldset>
        );
    }
}

Grant.types = {
    initial: "initial",
    subsequent: "subsequent",
};

export default Grant;
