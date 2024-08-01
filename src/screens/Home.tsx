import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
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
// import {API_HOST} from '@env';

// Handle button press
const handlePress = () => {
  console.log('Button Pressed');
  Alert.alert('Button Pressed', 'You pressed the button!');
};

// Request location permission for Android
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
    return true; // iOS permissions are handled differently
  }
};

const sendCoordinates = async (latitude: number, longitude: number) => {
  const data = {
    lat: latitude,
    lon: longitude,
    sendDate: new Date().toISOString(),
  };

  try {
    const response = await fetch(`http://54.173.182.6:3000/api/coordinates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Coordinates sent successfully');
  } catch (error) {
    console.error('Error sending coordinates:', error);
  }
};

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [accelData, setAccelData] = useState<SensorData | null>(null);

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
          sendCoordinates(latitude, longitude);
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
    }, 20000);

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
      <Text style={styles.subtitle}>Version 1</Text>
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
});

export default HomeScreen;
