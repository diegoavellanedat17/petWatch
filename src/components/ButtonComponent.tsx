import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

type ButtonComponentProps = {
  onPress: () => void;
  title: string;
};

const ButtonComponent: React.FC<ButtonComponentProps> = ({onPress, title}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ButtonComponent;
