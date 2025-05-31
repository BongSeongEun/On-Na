import * as React from 'react';
import { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import Login from './src/pages/Login';

const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    SplashScreen.show();
    setTimeout(() => {
      SplashScreen.hide();
      }, 1000);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;