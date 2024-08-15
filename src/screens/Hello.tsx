import React, {useState} from 'react';
import {
  Button,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const HelloScreen: React.FC = ({navigation}: any) => {
  const [petID, setPetID] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Bienvenido a <Text style={styles.petWatchText}>PetWatch</Text>, ingresa
        el ID de tu mascota
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Ingresa el ID"
        value={petID}
        onChangeText={setPetID}
        placeholderTextColor="#ffffff"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log('Pet ID:', petID);
          navigation.navigate('Home');
        }}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#011f26',
    padding: 20,
  },
  welcomeText: {
    textAlign: 'left',
    marginBottom: 20,
    color: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    marginBottom: 20,
    width: '80%',
    color: 'white',
  },
  petWatchText: {
    color: '#f2a71b',
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
  },
  button: {
    height: 40,
    width: '80%',
    borderRadius: 5,
    borderColor: '#f2a71b',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#f2a71b',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default HelloScreen;
