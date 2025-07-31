import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import webSocketContainer from '../utils/WebSocketContainer';
import { getWebSocketUrl } from '../utils/config';

const WebSocketTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // WebSocket 이벤트 리스너 등록
    const handleConnected = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setError(error.message || '연결 실패');
      setIsConnected(false);
    };

    webSocketContainer.on('CONNECTED', handleConnected);
    webSocketContainer.on('DISCONNECTED', handleDisconnected);
    webSocketContainer.on('ERROR', handleError);

    return () => {
      webSocketContainer.off('CONNECTED', handleConnected);
      webSocketContainer.off('DISCONNECTED', handleDisconnected);
      webSocketContainer.off('ERROR', handleError);
    };
  }, []);

  const testConnection = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      console.log('Testing WebSocket connection to:', getWebSocketUrl());
      await webSocketContainer.connect();
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setError(error.message || '연결 테스트 실패');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    webSocketContainer.disconnect();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 연결 테스트</Text>
      
      <Text style={styles.url}>URL: {getWebSocketUrl()}</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.statusText}>
          {isConnected ? '연결됨' : '연결 안됨'}
        </Text>
      </View>

      {error && (
        <Text style={styles.errorText}>에러: {error}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.connectButton]}
          onPress={testConnection}
          disabled={isConnecting}
        >
          <Text style={styles.buttonText}>
            {isConnecting ? '연결 중...' : '연결 테스트'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.disconnectButton]}
          onPress={disconnect}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>연결 해제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WebSocketTest; 