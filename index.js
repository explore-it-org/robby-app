/** @format */

import {Alert, AppRegistry} from 'react-native';
import App from './App';
import * as React from 'react';
import {name as appName} from './app.json';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import store, { persistor } from './src/store/store';
import {Provider as ReduxProvider} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';



const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3d68e6',
        accent: '#f50057',
    },
};

export default function Main() {
    return (
        <ReduxProvider store={store}>
            <PaperProvider theme={theme}>
                <PersistGate loading={null} persistor={persistor}>
                <App/>
                </PersistGate>
            </PaperProvider>
        </ReduxProvider>
    );
}


AppRegistry.registerComponent(appName, () => Main);
