import React, { useEffect, useState } from 'react';
import styled from '@emotion/native';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiUrl } from '../utils/config';
import { getUserIdFromToken } from '../utils/auth';
import * as Keychain from 'react-native-keychain';
import useWebSocket from '../utils/useWebSocket';

const MainContainer = styled.View`
  flex: 1;
  background-color: #fff;
`;

const RoomItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 18px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const RoomAvatar = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: #d9d9d9;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
`;

const RoomInfo = styled.View`
  flex: 1;
`;

const RoomName = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: #222;
`;

const LastMessage = styled.Text`
  font-size: 13px;
  color: #888;
  margin-top: 4px;
`;

const TimeUnreadRow = styled.View`
  align-items: flex-end;
`;

const LastTime = styled.Text`
  font-size: 11px;
  color: #bbb;
`;

const UnreadBadge = styled.View`
  background-color: #4c9cd6;
  border-radius: 10px;
  padding: 2px 8px;
  margin-top: 6px;
`;

const UnreadText = styled.Text`
  color: #fff;
  font-size: 11px;
`;

const NavContainer = styled.View`
  position: absolute;
  bottom: 0;
  width: 100%;
`;

const ConnectionStatus = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-bottom-width: 1px;
  border-bottom-color: #e9ecef;
`;

const StatusDot = styled.View<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.connected ? '#28a745' : '#dc3545'};
  margin-right: 8px;
`;

const StatusText = styled.Text`
  font-size: 12px;
  color: #6c757d;
`;

const api = axios.create({
  baseURL: getApiUrl(),
});

function ChatList() {
  const navigation = useNavigation<any>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');

  // WebSocket 훅 사용
  const {
    isConnected,
    rooms: wsRooms,
    requestRoomList,
    connect,
    error,
    addRoomHandler,
    removeRoomHandler,
  } = useWebSocket(accessToken);

  useEffect(() => {
    (async () => {
      try {
        // 실제 토큰 가져오기
        const tokenObj = await Keychain.getGenericPassword();
        const token = tokenObj && 'password' in tokenObj ? tokenObj.password : '';
        setAccessToken(token);
        
        const id = await getUserIdFromToken();
        setUserId(id);
        
        console.log('API URL:', getApiUrl());
        console.log('User ID:', id);
        console.log('Token available:', !!token);
        
        if (id) {
          try {
            console.log('Requesting chat rooms for user:', id);
            
            // REST API로 초기 채팅방 목록 가져오기
            const response = await api.get(`/chat/rooms/${id}`);
            console.log('채팅방 목록 응답:', response.data);
            const data = response.data.rooms || response.data;
            setRooms(Array.isArray(data) ? data : []);
          } catch (error: any) {
            console.error('채팅방 목록 로드 실패:', error);
            console.error('에러 상세:', {
              message: error.message,
              code: error.code,
              response: error.response?.data,
              status: error.response?.status,
              config: error.config
            });
            
            // 네트워크 에러인 경우 더 자세한 정보 출력
            if (error.message === 'Network Error') {
              console.error('네트워크 에러 - 서버가 실행 중인지 확인하세요');
              console.error('서버 URL:', getApiUrl());
            }
          }
        }
      } catch (error) {
        console.error('토큰 또는 사용자 ID 가져오기 실패:', error);
      }
    })();
  }, []);

  // WebSocket 연결 및 채팅방 목록 요청
  useEffect(() => {
    const initializeWebSocket = async () => {
      if (accessToken) {
        try {
          await connect();
          await requestRoomList();
        } catch (error) {
          console.error('WebSocket 연결 실패:', error);
        }
      }
    };

    initializeWebSocket();
  }, [accessToken, connect, requestRoomList]);

  // WebSocket 채팅방 목록 업데이트
  useEffect(() => {
    const roomHandler = (updatedRooms: any[]) => {
      setRooms(updatedRooms);
    };

    addRoomHandler('chatList', roomHandler);

    return () => {
      removeRoomHandler('chatList');
    };
  }, [addRoomHandler, removeRoomHandler]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      Alert.alert('오류', error);
    }
  }, [error]);

  const goToChat = (room: any) => {
    navigation.navigate('Chatting', { 
      chatRoomId: room.id, 
      roomName: room.name, 
      userId,
      accessToken 
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await requestRoomList();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <RoomItem onPress={() => goToChat(item)}>
      <RoomAvatar>
        <Text style={{ fontSize: 18, color: '#555' }}>{item.name[0]}</Text>
      </RoomAvatar>
      <RoomInfo>
        <RoomName numberOfLines={1}>{item.name}</RoomName>
        <LastMessage numberOfLines={1}>{item.lastMessage}</LastMessage>
      </RoomInfo>
      <TimeUnreadRow>
        <LastTime>{formatTime(item.lastMessageTime)}</LastTime>
        {item.unreadCount > 0 && (
          <UnreadBadge>
            <UnreadText>{item.unreadCount > 99 ? '99+' : item.unreadCount}</UnreadText>
          </UnreadBadge>
        )}
      </TimeUnreadRow>
    </RoomItem>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainContainer>
        {/* 연결 상태 표시 */}
        <ConnectionStatus>
          <StatusDot connected={isConnected} />
          <StatusText>
            {isConnected ? '실시간 연결됨' : '연결 중...'}
          </StatusText>
        </ConnectionStatus>
        
        <FlatList
          data={rooms.filter(item => item && item.id)}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4c9cd6']}
              tintColor="#4c9cd6"
            />
          }
        />
        <NavContainer>
          <NavBar />
        </NavContainer>
      </MainContainer>
    </SafeAreaView>
  );
}

// 시간 포맷 함수 (예: "13:00" 또는 "어제" 등)
function formatTime(isoString: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toTimeString().slice(0, 5); // "HH:MM"
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default ChatList;