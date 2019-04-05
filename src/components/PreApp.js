import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-spinkit';
import App from './App';
import { newLoadProjectConfig } from '../actions/projectConfigActions';
import './App.css';

export default class PreApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {
        newLoadProjectConfig(this.props.database)
            .subscribe(() => this.setState({ isLoading: false }));
    }

    render() {
        const { database } = this.props;
        const { isLoading } = this.state;

        if (isLoading) {
            return (
                <div className="spinnerContainer">
                    <Spinner className="spinner" name="ball-scale-ripple-multiple" />
                </div>
            );
        }
        return <App isLoading={isLoading} database={database} />;
    }
}

PreApp.propTypes = {
    database: PropTypes.object.isRequired
};
