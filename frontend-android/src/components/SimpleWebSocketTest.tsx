import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getWebSocketUrl } from '../utils/config';

const SimpleWebSocketTest: React.FC = () => {
  const [status, setStatus] = useState<string>('대기 중');

  const testConnection = async () => {
    try {
      setStatus('연결 테스트 중...');
      const wsUrl = getWebSocketUrl();
      
      console.log('=== 간단한 연결 테스트 ===');
      console.log('WebSocket URL:', wsUrl);
      
      // 기본적인 HTTP 요청으로 서버 상태 확인
      const apiUrl = wsUrl.replace('/ws', '/api');
      const response = await fetch(`${apiUrl}/chat/sample-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setStatus('✅ 서버 연결 성공');
        console.log('서버 연결 성공');
      } else {
        setStatus(`❌ 서버 연결 실패 (${response.status})`);
        console.log('서버 연결 실패:', response.status);
      }
    } catch (error: any) {
      setStatus(`❌ 연결 실패: ${error.message}`);
      console.error('연결 테스트 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>간단한 연결 테스트</Text>
      
      <Text style={styles.url}>URL: {getWebSocketUrl()}</Text>
      
      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>연결 테스트</Text>
      </TouchableOpacity>

      <Text style={styles.status}>상태: {status}</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SimpleWebSocketTest; 