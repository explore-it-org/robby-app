/** @format */

import {Alert, AppRegistry} from 'react-native';
import App from './App';
import * as React from 'react';
import {name as appName} from './app.json';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import store from './src_redux/store/store';
import {Provider as ReduxProvider} from 'react-redux';


const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#9c27b0',
        accent: '#f50057',
    },
};

export default function Main() {
    return (
        <ReduxProvider store={store}>
            <PaperProvider theme={theme}>
                <App/>
            </PaperProvider>
        </ReduxProvider>
    );
}


AppRegistry.registerComponent(appName, () => Main);
