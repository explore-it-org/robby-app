import {Component} from 'react';
import {StyleSheet, View, TextInput} from 'react-native';
import React from 'react';

/**
 * Important: The value of this component is controlled by an higher component.
 * If a local state for the value will be introduced, the rendering after moving the lines
 * does not work correctly, because the local state is not touched and therefore no
 * rerendering is fired by react for this component.
 */
export default class NumericInput extends Component {
    // check and convert number to text
    toText(number) {
        let txtValue = '';
        number = Number(number)
        if (!isNaN(number)) {
                txtValue = number.toString();
        }else{
           alert(number); 
        }
        
        return txtValue;
    }

    render() {
        txtValue = this.toText(this.props.val);
        if (!isNaN(this.props.val)) {
            this.temp_val = this.props.val;
        }
        return (
            <View style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(52, 52, 52, 0.0)',
                justifyContent: 'center',
            }}>
                <TextInput
                    style={styles.input}
                    keyboardType='numeric'
                    onChangeText={(text) => this.props.onchange(text)}
                    textAlign={'center'}
                    mode="outlined"
                    value={txtValue}
                    onFocus={() => {
                        
                        if(this.props.onfocus){
                            this.props.onfocus();
                        }
                        this.props.onchange('');
                    }}
                    onBlur={() => {
                        this.props.onchange(this.toText(this.temp_val));
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    input: {
        fontFamily: 'Jost-Book',
        width: '100%',
        height: '100%',
        borderRadius: 5,
        borderWidth: 1,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
});
