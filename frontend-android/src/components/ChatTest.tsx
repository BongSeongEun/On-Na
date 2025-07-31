import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import webSocketContainer from '../utils/WebSocketContainer';

const ChatTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('1');

  const sendTestMessage = async () => {
    if (!message.trim()) {
      Alert.alert('오류', '메시지를 입력하세요.');
      return;
    }

    try {
      console.log('Sending test message:', { roomId, message });
      const success = await webSocketContainer.sendMessage(roomId, message.trim());
      
      if (success) {
        Alert.alert('성공', '메시지가 전송되었습니다.');
        setMessage('');
      } else {
        Alert.alert('오류', '메시지 전송에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Test message error:', error);
      Alert.alert('오류', error.message || '메시지 전송에 실패했습니다.');
    }
  };

  const joinTestRoom = async () => {
    try {
      await webSocketContainer.joinRoom(roomId);
      Alert.alert('성공', '채팅방에 입장했습니다.');
    } catch (error: any) {
      Alert.alert('오류', error.message || '채팅방 입장에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>채팅 테스트</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>채팅방 ID:</Text>
        <TextInput
          style={styles.input}
          value={roomId}
          onChangeText={setRoomId}
          placeholder="채팅방 ID"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>메시지:</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="메시지를 입력하세요"
          multiline
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={joinTestRoom}>
          <Text style={styles.buttonText}>채팅방 입장</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.sendButton]} 
          onPress={sendTestMessage}
          disabled={!message.trim()}
        >
          <Text style={styles.buttonText}>메시지 전송</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  sendButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatTest; 