import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';

const HelloScreen: React.FC = ({navigation}: any) => {
  const [petID, setPetID] = useState('');
  const [cameraAuthorized, setCameraAuthorized] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  useEffect(() => {
    const loadPetID = async () => {
      const savedPetID = await AsyncStorage.getItem('petID');
      if (savedPetID) {
        setPetID(savedPetID);
      }
    };

    loadPetID();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted) {
        setCameraAuthorized(true);
        setIsScannerVisible(true); // Show the scanner when permission is granted
        console.log('Camera permission already granted');
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'PetWatch needs access to your camera to scan QR codes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setCameraAuthorized(true);
          setIsScannerVisible(true); // Show the scanner when permission is granted
          console.log('Camera permission granted');
        } else {
          setCameraAuthorized(false);
          Alert.alert('Camera permission denied');
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSavePetID = async (id: string) => {
    setPetID(id);
    await AsyncStorage.setItem('petID', id);
  };

  const handleScan = (e: any) => {
    const scannedID = e.data;
    handleSavePetID(scannedID);
    setIsScannerVisible(false); // Hide the scanner after scanning
  };

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
        onChangeText={text => handleSavePetID(text)}
        placeholderTextColor="#ffffff"
      />

      {!isScannerVisible && (
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Scan QR</Text>
        </TouchableOpacity>
      )}

      {isScannerVisible && cameraAuthorized && (
        <QRCodeScanner
          onRead={handleScan}
          flashMode={RNCamera.Constants.FlashMode.off}
          topContent={
            <Text style={styles.centerText}>
              Scan the QR code to get the pet ID
            </Text>
          }
          bottomContent={
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => setIsScannerVisible(false)} // Allow user to close scanner
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          }
        />
      )}

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
  buttonTouchable: {
    padding: 16,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
});

export default HelloScreen;
