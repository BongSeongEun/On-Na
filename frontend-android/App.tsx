import * as React from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Login from './src/pages/Login';
import Home from './src/pages/Home';
import Calendar_main from './src/pages/Calendar_main';
import Map_main from './src/pages/Map_main';
import Chat_main from './src/pages/Chat_main';
import My_page from './src/pages/My_page';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{headerShown: false}} />
          <Stack.Screen name="Home" component={Home} options={{headerShown: false}} />
          <Stack.Screen name="Calendar_main" component={Calendar_main} options={{headerShown: false}} />
          <Stack.Screen name="Map_main" component={Map_main} options={{headerShown: false}} />
          <Stack.Screen name="Chat_main" component={Chat_main} options={{headerShown: false}} />
          <Stack.Screen name="My_page" component={My_page} options={{headerShown: false}} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
export default App;