import React from 'react';
import HomeScreen from './src/screens/Home';
import HelloScreen from './src/screens/Hello';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Hello"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="PetWatch" component={HelloScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
