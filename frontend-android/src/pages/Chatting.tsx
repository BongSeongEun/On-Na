import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage } from '../utils/WebSocketContainer';
import useWebSocket from '../utils/useWebSocket';
import { getUserIdFromToken } from '../utils/auth';

export default function Chatting({ route }: { route: any }) {
  const { chatRoomId, roomName, userId, accessToken } = route.params;
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  // WebSocket 훅 사용
  const {
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    error,
    addMessageHandler,
    removeMessageHandler,
  } = useWebSocket(accessToken);

  // 실제 사용자 ID 가져오기
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const id = await getUserIdFromToken();
        setCurrentUserId(id ? id.toString() : '');
      } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
      }
    };
    
    getCurrentUserId();
  }, []);

  // 메시지 핸들러 등록
  useEffect(() => {
    const messageHandler = (newMessage: ChatMessage) => {
      if (newMessage.roomId === chatRoomId.toString()) {
        setMessages(prev => {
          // 중복 메시지 방지
          const exists = prev.find(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    };

    addMessageHandler(chatRoomId.toString(), messageHandler);

    return () => {
      removeMessageHandler(chatRoomId.toString());
    };
  }, [chatRoomId, addMessageHandler, removeMessageHandler]);

  // 채팅방 입장
  useEffect(() => {
    const enterRoom = async () => {
      if (isConnected) {
        try {
          await joinRoom(chatRoomId.toString());
        } catch (error) {
          Alert.alert('오류', '채팅방 입장에 실패했습니다.');
        }
      }
    };

    enterRoom();

    return () => {
      // 컴포넌트 언마운트 시 채팅방 퇴장
      leaveRoom(chatRoomId.toString()).catch(() => {
        // 퇴장 실패는 무시
      });
    };
  }, [isConnected, chatRoomId, joinRoom, leaveRoom]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      Alert.alert('오류', error);
    }
  }, [error]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    console.log('Attempting to send message:', {
      roomId: chatRoomId,
      content: input.trim(),
      isConnected,
      currentUserId
    });

    try {
      const success = await sendMessage(chatRoomId.toString(), input.trim());
      if (success) {
        console.log('Message sent successfully');
        setInput('');
      } else {
        console.error('Message send returned false');
        Alert.alert('오류', '메시지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Message send error:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  // 채팅 메시지 렌더링
  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === currentUserId;
    return (
      <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.otherMessageRow]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ios: 'padding'})}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={styles.connectionStatus}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#28a745' : '#dc3545' }]} />
            <Text style={styles.statusText}>
              {isConnected ? '연결됨' : '연결 안됨'}
            </Text>
          </View>
        </View>

        {/* 메시지 목록 */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* 메시지 입력 */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
            onPress={handleSendMessage}
            disabled={!input.trim() || !isConnected}
          >
            <Text style={styles.sendBtnText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#EBF7FF' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fffbe3',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4c9cd6',
  },
  roomName: { 
    flex: 1,
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  list: { 
    flex: 1 
  },
  listContent: {
    padding: 16,
  },
  messageRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 8 
  },
  myMessageRow: { 
    justifyContent: 'flex-end' 
  },
  otherMessageRow: { 
    justifyContent: 'flex-start' 
  },
  bubble: { 
    maxWidth: '70%', 
    padding: 12, 
    borderRadius: 16 
  },
  myBubble: { 
    backgroundColor: '#B6E1FF', 
    marginLeft: 40 
  },
  otherBubble: { 
    backgroundColor: '#FFFBE4', 
    marginRight: 40 
  },
  messageText: { 
    fontSize: 15, 
    color: '#222' 
  },
  myMessageText: {
    color: '#222',
  },
  otherMessageText: {
    color: '#222',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#eee' 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#ECECEC', 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: { 
    marginLeft: 8, 
    backgroundColor: '#4C9CD6', 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc',
  },
  sendBtnText: {
    color: '#fff', 
    fontWeight: 'bold' 
  },
});
