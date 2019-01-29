import React, {Component} from 'react';
import { Provider } from 'mobx-react';

import App from './container';
import * as store from './store';
import './service/syncStorage';
import './utils/cacheStorage';

export default class angelia extends Component {
    render() {
        return (
            <Provider {...store}>
                <App/>
            </Provider>
        );
    };
}