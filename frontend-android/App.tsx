import * as React from 'react';
import { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import Login from './src/pages/Login';
import Home from './src/pages/Home';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const Stack = createNativeStackNavigator();

function App() {
  useEffect(() => {
    SplashScreen.show();
    setTimeout(() => {
      SplashScreen.hide();
      }, 1000);
      GoogleSignin.configure({
        webClientId: '341506482514-8en7l4a0ucjk5p9u5f70n4l642maqmnc.apps.googleusercontent.com',
      });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
        <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;