/** @format */

import {Alert, AppRegistry} from 'react-native';
import App from './App';
import * as React from 'react';
import {name as appName} from './app.json';
import {configureFonts, DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import store, {persistor} from './src/store/store';
import {Provider as ReduxProvider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Toast from './src/controls/Toast';


const fontConfig = {
    default: {
        regular: {
            fontFamily: 'Jost-400-Book',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'Jost-500-Medium',
            fontWeight: 'normal',
        },
        light: {
            fontFamily: 'Jost-300-Light',
            fontWeight: 'normal',
        },
        thin: {
            fontFamily: 'Jost-200-Thin',
            fontWeight: 'normal',
        },
    },
};

const theme = {
    ...DefaultTheme,
    roundness: 2,
    fonts: configureFonts(fontConfig),
    colors: {
        ...DefaultTheme.colors,
        primary: '#2E5266',
        accent: '#1E3888',// dark yellow #FFC523
    },
};

export default function Main() {
    return (
        <ReduxProvider store={store}>
            <PaperProvider settings={{icon: props => <MyIcon {...props} />}} theme={theme}>
                <PersistGate loading={null} persistor={persistor}>
                    <App/>
                    <Toast/>
                </PersistGate>
            </PaperProvider>
        </ReduxProvider>
    );
}


AppRegistry.registerComponent(appName, () => Main);
