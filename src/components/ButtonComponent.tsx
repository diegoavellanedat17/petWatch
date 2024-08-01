import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

interface ButtonComponentProps {
  title: string;
  onPress: () => void;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({title, onPress}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonComponent;
