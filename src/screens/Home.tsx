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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import BackgroundService from 'react-native-background-actions';

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const fineLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      const backgroundLocationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'This app needs access to your location in the background.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return (
        fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const response = await Geolocation.requestAuthorization('always');
      return response === 'granted';
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
  const savedPetID = await AsyncStorage.getItem('petID');
  if (!savedPetID) {
    console.error('No pet ID found');
    return;
  }

  const data = {
    petID: savedPetID,
    lat: latitude,
    lon: longitude,
    sendDate: new Date().toISOString(),
  };

  try {
    const response = await axios.post(
      `https://api.petwatch.tech/coordinates/app/${savedPetID}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic YWRtaW46MTAyMDc4NTIxNA==`,
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

const veryIntensiveTask = async (taskDataArguments: any) => {
  const {delay, setResponse} = taskDataArguments;
  await new Promise<void>(async resolve => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      console.log('Background task iteration:', i);
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          await sendCoordinates(latitude, longitude, setResponse);
        },
        error => {
          console.error('Geolocation error:', error);
          setResponse(`Geolocation error: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 10000,
        },
      );
      await sleep(delay);
    }
  });
};

const sleep = (time: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), time));

const options = {
  taskName: 'Background Task',
  taskTitle: 'Background Task Running',
  taskDesc: 'Fetching coordinates every minute',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane',
  parameters: {
    delay: 60000,
    setResponse: () => {},
  },
  notifications: {
    showNotification: true,
    isSilent: false,
  },
};

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isTracking, setIsTracking] = useState<boolean>(false);

  useEffect(() => {
    const loadPetID = async () => {
      const savedPetID = await AsyncStorage.getItem('petID');
      if (savedPetID) {
        setIsTracking(true); // Start tracking automatically if ID exists
      }
    };

    loadPetID();
  }, []);

  useEffect(() => {
    const startBackgroundTask = async () => {
      try {
        const taskOptions = {
          ...options,
          parameters: {
            delay: 60000,
            setResponse: setResponse,
          },
        };
        await BackgroundService.start(veryIntensiveTask, taskOptions);
        await BackgroundService.updateNotification({
          taskDesc: 'Fetching coordinates every minute',
        });
      } catch (error) {
        console.error('Error starting background task:', error);
      }
    };

    if (isTracking) {
      startBackgroundTask();
    } else {
      BackgroundService.stop();
    }

    return () => {
      BackgroundService.stop();
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logoPetwatch.png')}
          style={styles.icon}
        />
      </View>
      <View style={styles.petImageContainer}>
        <Image source={require('../assets/pet.png')} style={styles.petImage} />
      </View>
      {location && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Latitude: {location.latitude}</Text>
          <Text style={styles.infoText}>Longitude: {location.longitude}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.trackingButton]}
        onPress={toggleTracking}>
        <Text style={styles.buttonText}>
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Text>
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
    backgroundColor: '#011f26',
    padding: 20,
  },
  icon: {
    width: 50,
    height: 50,
  },
  header: {
    position: 'absolute', // Position the header absolutely
    top: 10, // Align to the top of the screen with some padding
    left: 10, // Align to the left of the screen with some padding
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: 'white',
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
    color: 'white',
  },
  trackingButton: {
    height: 40,
    width: '80%',
    borderRadius: 5,
    borderColor: '#f2a71b',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: '#007BFF',
  },
  stopButton: {
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: '#f2a71b',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
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
  petImageContainer: {
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#f2a71b',
    padding: 5,
    marginBottom: 20,
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default HomeScreen;
