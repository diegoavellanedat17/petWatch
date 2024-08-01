import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorData,
  SensorTypes,
} from 'react-native-sensors';
import {Subscription} from 'rxjs';
import ButtonComponent from '../components/ButtonComponent';
import axios from 'axios';

// import {API_HOST} from '@env';

const handlePress = () => {
  console.log('Button Pressed');
  Alert.alert('Button Pressed', 'You pressed the button!');
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    return true;
  }
};

const sendCoordinates = async (
  latitude: number,
  longitude: number,
  setResponse: React.Dispatch<React.SetStateAction<string>>,
) => {
  const data = {
    lat: latitude,
    lon: longitude,
    sendDate: new Date().toISOString(),
  };

  try {
    const response = await axios.post(
      `http://54.173.182.6:3000/api/coordinates`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    setResponse(JSON.stringify(response.data));
    console.log('Coordinates sent successfully:', response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.toJSON());
      setResponse(`Axios error: ${JSON.stringify(error.toJSON(), null, 2)}`);
    } else {
      setResponse(`Error: ${error.message}`);
      console.error('Error sending coordinates:', error);
    }
  }
};

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [accelData, setAccelData] = useState<SensorData | null>(null);
  const [response, setResponse] = useState<string>('');

  useEffect(() => {
    const requestPermissionAndFetchLocation = async () => {
      if (await requestLocationPermission()) {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setLocation({latitude, longitude});
          },
          error => {
            console.error(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      }
    };

    requestPermissionAndFetchLocation();

    const locationIntervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setLocation({latitude, longitude});
          sendCoordinates(latitude, longitude, setResponse);
        },
        error => {
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    }, 10000);

    setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
    const accelSubscription: Subscription = accelerometer.subscribe({
      next: (data: SensorData) => setAccelData(data),
      error: error => console.error(error),
    });

    return () => {
      clearInterval(locationIntervalId);
      accelSubscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/app-icon.png')} style={styles.icon} />
      <Text style={styles.title}>Pet Watch</Text>
      <Text style={styles.subtitle}>Version 1.2/Salir</Text>
      {location && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Latitude: {location.latitude}</Text>
          <Text style={styles.infoText}>Longitude: {location.longitude}</Text>
        </View>
      )}
      {accelData && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Accelerometer X: {accelData.x.toFixed(2)}
          </Text>
          <Text style={styles.infoText}>
            Accelerometer Y: {accelData.y.toFixed(2)}
          </Text>
          <Text style={styles.infoText}>
            Accelerometer Z: {accelData.z.toFixed(2)}
          </Text>
        </View>
      )}
      <ButtonComponent title="Coordinates" onPress={handlePress} />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() =>
          location &&
          sendCoordinates(location.latitude, location.longitude, setResponse)
        }>
        <Text style={styles.buttonText}>Send Coordinates</Text>
      </TouchableOpacity>
      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  responseContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 3,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
  },
});

export default HomeScreen;
