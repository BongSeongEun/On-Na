import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getWebSocketUrl, getApiUrl } from '../utils/config';

const ConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');

  const testWebSocketConnection = async () => {
    try {
      const wsUrl = getWebSocketUrl();
      const apiUrl = getApiUrl();
      
      console.log('=== 연결 테스트 시작 ===');
      console.log('WebSocket URL:', wsUrl);
      console.log('API URL:', apiUrl);
      
      setTestResult('연결 테스트 중...');
      
      // 간단한 fetch 테스트
      const response = await fetch(`${apiUrl}/chat/sample-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setTestResult('✅ API 서버 연결 성공');
        console.log('API 서버 연결 성공');
      } else {
        setTestResult('❌ API 서버 연결 실패');
        console.log('API 서버 연결 실패:', response.status);
      }
    } catch (error: any) {
      setTestResult(`❌ 연결 실패: ${error.message}`);
      console.error('연결 테스트 실패:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>연결 테스트</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>WebSocket URL:</Text>
        <Text style={styles.value}>{getWebSocketUrl()}</Text>
        
        <Text style={styles.label}>API URL:</Text>
        <Text style={styles.value}>{getApiUrl()}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={testWebSocketConnection}>
        <Text style={styles.buttonText}>연결 테스트</Text>
      </TouchableOpacity>

      {testResult && (
        <Text style={styles.result}>{testResult}</Text>
      )}
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
  infoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  value: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ConnectionTest; 