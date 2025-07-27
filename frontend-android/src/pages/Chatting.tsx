import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { BASE_URL } from '@env';

const WS_URL = 'ws://BASE_URL/ws-chat'; // 실제 서버 주소로 변경

// 예시 유저 정보 (실제 앱에서는 로그인 정보에서 가져와야 함)
const myUserId = 1;
const chatRoomId = 1; // 실제 채팅방 id로 변경

export default function Chatting({ route }: { route: any }) {
  const { chatRoomId, roomName, userId } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const stompClient = useRef<Client | null>(null);

  // WebSocket 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        // 채팅방 구독
        client.subscribe(`/topic/chatroom.${chatRoomId}`, (msg) => {
          const body = JSON.parse(msg.body);
          setMessages((prev) => [...prev, body]);
          // 읽음 처리
          client.publish({
            destination: '/app/chat.readMessage',
            body: JSON.stringify({
              chatRoomId,
              senderId: myUserId,
              messageId: body.messageId,
            }),
          });
        });
      },
    });
    client.activate();
    stompClient.current = client;
    return () => {
      client.deactivate();
    };
  }, []);

  // 메시지 전송
  const sendMessage = () => {
    if (!input.trim() || !stompClient.current?.connected) return;
    stompClient.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        chatRoomId,
        senderId: myUserId,
        content: input,
      }),
    });
    setInput('');
  };

  // 채팅 메시지 렌더링
  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.senderId === myUserId;
    return (
      <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.otherMessageRow]}>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
        {/* 읽음 처리 예시 */}
        {isMine && <Text style={styles.readText}>{item.read ? '읽음' : '안읽음'}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ios: 'padding'})}>
      {/* 상단 바/방 이름 등은 Figma 참고해서 추가 */}
      <View style={styles.header}>
        <Text style={styles.roomName}>대구 뭉티기 맛집 탐방러들</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        style={styles.list}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="메시지를 입력하세요"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Figma 스타일 참고한 예시 스타일
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF7FF' },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fffbe3', borderBottomWidth: 1, borderColor: '#eee' },
  roomName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  list: { flex: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  myMessageRow: { justifyContent: 'flex-end' },
  otherMessageRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '70%', padding: 12, borderRadius: 16 },
  myBubble: { backgroundColor: '#B6E1FF', marginLeft: 40 },
  otherBubble: { backgroundColor: '#FFFBE4', marginRight: 40 },
  messageText: { fontSize: 15, color: '#222' },
  readText: { fontSize: 10, color: '#888', marginLeft: 4 },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: '#ECECEC', borderRadius: 20, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { marginLeft: 8, backgroundColor: '#4C9CD6', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
});
