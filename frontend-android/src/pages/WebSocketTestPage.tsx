import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebSocketTest from '../components/WebSocketTest';

const WebSocketTestPage: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <WebSocketTest />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default WebSocketTestPage; 