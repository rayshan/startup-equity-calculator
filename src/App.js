import React, {Component} from 'react';
import './App.css';

import Grant from './Grant';
import Dice from './Cube';

import moment from 'moment';
import Icon from 'antd/es/icon';
import InputNumber from 'antd/es/input-number';
import 'antd/es/input-number/style/css';
import Slider from 'antd/es/slider';
import 'antd/es/slider/style/css';
import Checkbox from 'antd/es/checkbox';
import 'antd/es/checkbox/style/css';
import Radio from 'antd/es/radio';
import 'antd/es/radio/style/css';
import Select from 'antd/es/select';
import 'antd/es/select/style/css';
import Tooltip from 'antd/es/tooltip';
import 'antd/es/tooltip/style/css';
import Button from 'antd/es/button';
import 'antd/es/button/style/css';

import chart from "./chart.png";

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const {Option, OptGroup} = Select;
const ButtonGroup = Button.Group;

class App extends Component {
    static formattedNumberFrom(value) {
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    static formattedLargeCurrencyFrom(value) {
        return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    constructor(props) {
        super(props);

        this.state = {
            startDate: moment().startOf("month"),
            sharesGranted: 40000,
            exercisePrice: 0.54,
            sharesOutstanding: 60000000,
            currentFunding: 10000000,
            liquidationDuration: 72,
            liquidationValuation: 100000000,
        };
    }

    get exerciseCost() {
        return Math.round(this.state.sharesGranted * this.state.exercisePrice);
    }

    get ownership() {
        return Math.round(this.state.sharesGranted / this.state.sharesOutstanding * 100 * 1000)
            / 1000;
    }

    get percentageVested() {
        return (this.state.liquidationDuration > App.vestDuration ?
            App.vestDuration : this.state.liquidationDuration) / App.vestDuration;
    }

    get vestedShareValuation() {
        return Math.round(
            this.state.liquidationValuation / this.state.sharesOutstanding *
            (this.percentageVested * this.state.sharesGranted),
        );
    }

    get taxCost() {
        return Math.round(
            (this.vestedShareValuation - this.exerciseCost) * App.taxRate,
        );
    }

    get preTaxGain() {
        return this.vestedShareValuation - this.exerciseCost;
    }

    get postTaxGain() {
        return this.preTaxGain - this.taxCost;
    }

    get positiveGainView() {
        return (
            <p className="positive-gain-view">
                Congratulations, after paying
                <span className="bold"> {App.formattedLargeCurrencyFrom(this.exerciseCost)} </span>
                to exercise your options and
                <span className="bold"> {App.formattedLargeCurrencyFrom(this.taxCost)} </span>
                in taxes, you may be able to pocket
                <span className="bold"> {App.formattedLargeCurrencyFrom(this.postTaxGain)}</span>
                , or
                <span className="bold"> {App.formattedLargeCurrencyFrom(Math.round(this.postTaxGain / (this.state.liquidationDuration / 12)))} </span>
                per year of employment.*
            </p>
        );
    }

    get negativeGainView() {
        return (
            <p className="nagative-gain-view">
                Unfortunately, it may not worth spending
                <span className="bold"> {App.formattedLargeCurrencyFrom(this.exerciseCost)} </span>
                <span>to exercise your options. But there are still </span>
                <Tooltip title="There are many intangible benefits to joining a startup, such as working with cutting edge technology, being able to make a big impact on day 1...">
                    <span className="help">many other reasons</span>
                </Tooltip>
                <span> to join this exciting startup journey.</span>
            </p>
        );
    }

    handleGrantUpdateAction(grantData) {
        this.setState({
            startDate: grantData.startDate,
            sharesGranted: grantData.sharesGranted,
            exercisePrice: grantData.exercisePrice,
        });
    }

    handleSharesOutstandingChange(value) {
        this.setState({sharesOutstanding: value});
    }

    handleLiquidationDurationChange(value) {
        this.setState({liquidationDuration: value * 12});
    }

    handleLiquidationValuationChange(value) {
        this.setState({liquidationValuation: value});
    }

    handleLiquidationScenarioChange(scenarioId) {
        this.setState({
            liquidationValuation: App.benchmarkScenarios[scenarioId].liquidationValuation,
            liquidationDuration: App.benchmarkScenarios[scenarioId].liquidationDuration,
        });
    }

    handleRandomEventAction() {
        const randomLiquidationValuation = Math.floor(
            Math.random() * App.liquidationValuationRange.max - App.liquidationValuationRange.min,
        ) + App.liquidationValuationRange.min;
        const randomLiquidationDuration = Math.floor(
            Math.random() * App.liquidationDurationRange.max - App.liquidationDurationRange.min,
        ) + App.liquidationDurationRange.min;
        this.setState({
            liquidationValuation: randomLiquidationValuation,
            liquidationDuration: randomLiquidationDuration,
        });
    }

    render() {
        return [
            <h1 key="title">Startup Equity Calculator</h1>,
            <section key="offer" className="offer">
                <h2>You were granted</h2>
                <div className="row">
                    <Grant
                        startDate={this.state.startDate}
                        sharesGranted={this.state.sharesGranted}
                        exercisePrice={this.state.exercisePrice}
                        sharesOutstanding={this.state.sharesOutstanding}
                        ownership={this.ownership}
                        exerciseCost={this.exerciseCost}
                        handleUpdateAction={this.handleGrantUpdateAction.bind(this)}
                        name="Initial Grant"
                        type={Grant.types.initial}
                    />
                    <Grant
                        name="Grant #2"
                        type={Grant.types.subsequent}
                    />
                    <div className="add-grant">
                        <Tooltip title="Add a refresher grant" placement="right">
                            <Button type="primary" shape="circle" icon="plus" disabled />
                        </Tooltip>
                    </div>
                </div>
                <div>
                    Not sure if <span className="bold">{this.ownership}%</span> is too little or
                    too much? Jump to the last section to learn more.
                </div>
            </section>,
            <section key="company" className="company">
                <h2>What you know about the startup</h2>
                <fieldset>
                    <div>
                        <label htmlFor="shares-outstanding">Number of outstanding shares</label>
                        <InputNumber
                            id="shares-outstanding"
                            defaultValue={this.state.sharesOutstanding}
                            formatter={App.formattedNumberFrom}
                            min={this.state.sharesGranted}
                            step={1000000}
                            onChange={this.handleSharesOutstandingChange.bind(this)}
                        />
                    </div>
                    <div>
                        <label htmlFor="funding-current">Current funding</label>
                        <InputNumber
                            id="funding-current"
                            defaultValue={this.state.currentFunding}
                            formatter={App.formattedLargeCurrencyFrom}
                            min={0}
                            step={100000}
                            onChange={this.onChange}
                            disabled
                        />
                    </div>
                    <div>
                        <Tooltip title="Without knowing the total number of shares outstanding, we cannot quantify the value of your stock options. You may want to ask your HR representative in this way...">
                            <span className="help">Don't know or can't get this info?</span>
                        </Tooltip>
                    </div>
                </fieldset>
            </section>,
            <section key="events" className="events">
                <h2>
                    If these things were to happen
                    <Dice handleAction={this.handleRandomEventAction.bind(this)} />
                </h2>
                <fieldset>
                    <div className="liquidation-duration">
                        <Checkbox defaultChecked={true}>
                            <span>There is a </span>
                            <Tooltip title="A liquidation event can be an IPO, a share repurchase program...">
                                <span className="help">liquidation event</span>
                            </Tooltip>
                            <span> in</span>
                        </Checkbox>
                        <Slider
                            marks={App.liquidationDurationSliderMarks}
                            defaultValue={this.state.liquidationDuration / 12}
                            value={this.state.liquidationDuration / 12}
                            min={App.liquidationDurationRange.min / 12}
                            max={App.liquidationDurationRange.max / 12}
                            step={0.5}
                            onChange={this.handleLiquidationDurationChange.bind(this)}
                        />
                    </div>
                    <div className="liquidation-valuation">
                        <label htmlFor="liquidation-valuation">
                            <span>at</span>
                            <InputNumber
                                id="liquidation-valuation"
                                defaultValue={this.state.liquidationValuation}
                                value={this.state.liquidationValuation}
                                formatter={App.formattedLargeCurrencyFrom}
                                min={0}
                                step={1000000}
                                onChange={this.handleLiquidationValuationChange.bind(this)}
                            />
                            <span>valuation</span>
                        </label>
                        <div>
                            <span>(Don't know? Reference </span>
                            <Select
                                placeholder="a previous exit"
                                onChange={this.handleLiquidationScenarioChange.bind(this)}
                            >
                                <OptGroup label="Small">
                                    <Option value="android">Android $50M</Option>
                                </OptGroup>
                                <OptGroup label="Medium">
                                    <Option value="next">NeXT $435M</Option>
                                </OptGroup>
                                <OptGroup label="Large">
                                    <Option value="nest">Nest $3.2B</Option>
                                </OptGroup>
                            </Select>
                            <span>, click the dice to randomize, or </span>
                            <Tooltip title="409A valuation, tips and tricks on how to guesstimate, etc....">
                                <span className="help">read more about startup valuations</span>
                            </Tooltip>
                            )
                        </div>
                    </div>
                    <div className="liquidation-stay">
                        <span>And you</span>
                        <RadioGroup defaultValue="a">
                            <RadioButton value="a">Stay {Math.round(this.state.liquidationDuration / 12 * 10) / 10} years until liquidation</RadioButton>
                            <RadioButton value="b" disabled>Leave early</RadioButton>
                        </RadioGroup>
                        <p>
                            Your options would be
                            <span className="bold"> {Math.round(this.percentageVested * 100)}% </span>
                            <span>vested. </span>
                            <Tooltip title="In some cases, you may accelorate your vesting to 100% upon a liquidation event, or be granted more options">
                                <Icon type="question-circle-o" />
                            </Tooltip>
                        </p>
                    </div>
                </fieldset>
            </section>,
            <section key="valuation" className="valuation">
                <h2>Your options may be worth</h2>
                <div className="options-valuation">
                    <p>
                        Your vested options may be worth
                        <span className="bold"> {App.formattedLargeCurrencyFrom(this.vestedShareValuation)}</span>
                        .*
                    </p>
                    {this.preTaxGain > 0 ? this.positiveGainView : this.negativeGainView}
                    <div>
                        <Tooltip title="Many factors can impact your stock option valuation, such as liquidation preferences...">
                            <span className="help">* Why maybe?</span>
                        </Tooltip>
                    </div>
                </div>
                <br />
                <div className="total-compensation">
                    <h3>What does this mean for me?</h3>
                    <div className="row">
                        <div className="left">
                            <p>
                                Startup equity valuation is not an exact science.
                                You should always view it as part of your total compensation,
                                and think about what matters most to you,
                                depending on your personal goals, your life stage, etc.
                            </p>
                            <ul>
                                <li>Base salary...</li>
                                <li>Annual bonus...</li>
                                <li>Perks...</li>
                                <li>Intangibles...</li>
                            </ul>
                        </div>
                        <div className="right">
                            <img id="total-compensation-chart" src={chart} alt="Total Compensation Chart" />
                        </div>
                    </div>
                </div>
            </section>,
            <section key="next" className="next">
                <h2>What's next?</h2>
                <div>
                    <Button type="primary" icon="share-alt" disabled>Share</Button> your analysis
                    with yourself or with someone else for advice
                </div>
                <br />
                <p>
                    Read our <a>in-depth guide</a> and watch our <a>mini-course on startup equity</a>
                </p>
                <div>
                    Did we help you with your decision?
                    <ButtonGroup>
                        <Button type="primary" icon="like" disabled />
                        <Button type="primary" icon="dislike" disabled />
                    </ButtonGroup>
                </div>
            </section>,
        ];
    }
}

App.liquidationDurationSliderMarks = {
    1: {
        style: {textAlign: "left", marginLeft: 0},
        label: "1 year",
    },
    5: "5",
    10: "10",
    20: {
        style: {textAlign: "right", left: "auto", right: 0},
        label: "20 years",
    },
};

App.benchmarkScenarios = {
    android: {
        liquidationValuation: 50000000,
        liquidationDuration: 24,
    },
    next: {
        liquidationValuation: 435000000,
        liquidationDuration: 132,
    },
    nest: {
        liquidationValuation: 3200000000,
        liquidationDuration: 48,
    },
};

App.vestDuration = 48;
App.taxRate = 0.4;
App.liquidationValuationRange = {
    min: 1000000,
    max: 10000000000,
};
App.liquidationDurationRange = {
    min: 12,
    max: 240,
};

export default App;
