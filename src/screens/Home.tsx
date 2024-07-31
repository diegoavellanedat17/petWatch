import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ButtonComponent from '../components/ButtonComponent';
import Geolocation from 'react-native-geolocation-service';

const handlePress = () => {
  console.log('rpresset');
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
    return true; // iOS permissions are handled differently
  }
};

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestLocationPermission();
    }
    const fetchLocation = () => {
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
    };

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 30000); // Fetch every 30 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Watch</Text>
      <Text style={styles.subtitle}>Version 1</Text>
      <ButtonComponent title="Press Me" onPress={handlePress} />
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>Latitude: {location.latitude}</Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude}
          </Text>
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  locationContainer: {
    marginTop: 20,
  },
  locationText: {
    fontSize: 16,
  },
});

export default HomeScreen;
