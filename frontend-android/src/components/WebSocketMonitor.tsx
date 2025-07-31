import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import webSocketContainer from '../utils/WebSocketContainer';

const WebSocketMonitor: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const handleConnected = () => {
      setIsConnected(true);
      addLog('✅ WebSocket 연결됨');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      addLog('❌ WebSocket 연결 해제됨');
    };

    const handleError = (error: any) => {
      addLog(`❌ 에러: ${error.message || '알 수 없는 에러'}`);
    };

    // 이벤트 리스너 등록
    webSocketContainer.on('CONNECTED', handleConnected);
    webSocketContainer.on('DISCONNECTED', handleDisconnected);
    webSocketContainer.on('ERROR', handleError);

    // 초기 상태 확인
    setIsConnected(webSocketContainer.getConnectionStatus());

    return () => {
      webSocketContainer.off('CONNECTED', handleConnected);
      webSocketContainer.off('DISCONNECTED', handleDisconnected);
      webSocketContainer.off('ERROR', handleError);
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      setLogs(prev => [...prev, '🔄 WebSocket 연결 시도 중...']);
      await webSocketContainer.connect();
    } catch (error: any) {
      setLogs(prev => [...prev, `❌ 연결 실패: ${error.message}`]);
    }
  };

  const disconnectWebSocket = () => {
    webSocketContainer.disconnect();
    setLogs(prev => [...prev, '🔄 WebSocket 연결 해제 중...']);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket 모니터</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.statusText}>
          {isConnected ? '연결됨' : '연결 안됨'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.connectButton]} 
          onPress={connectWebSocket}
          disabled={isConnected}
        >
          <Text style={styles.buttonText}>연결</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]} 
          onPress={disconnectWebSocket}
          disabled={!isConnected}
        >
          <Text style={styles.buttonText}>해제</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearLogs}
        >
          <Text style={styles.buttonText}>로그 지우기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  clearButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  logText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

export default WebSocketMonitor; 