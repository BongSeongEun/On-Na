import React, { useEffect, useState } from 'react';
import styled from '@emotion/native';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '@env';
import { getUserIdFromToken } from '../utils/auth';

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

const api = axios.create({
    baseURL: BASE_URL,
  });

function ChatList() {
  const navigation = useNavigation<any>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
        const id = await getUserIdFromToken();
        setUserId(id);
        if (id) {
          api.get(`/api/chat/rooms/${id}`)
            .then(res => {
              console.log('채팅방 목록 응답:', res.data);
              const data = res.data.rooms || res.data;
              setRooms(Array.isArray(data) ? data : []);
            })
            .catch(console.error);
        }
      })();
  }, []);

  const goToChat = (room: any) => {
    navigation.navigate('Chatting', { chatRoomId: room.id, roomName: room.name, userId });
  };

  const renderItem = ({ item }: { item: any }) => (
    <RoomItem onPress={() => goToChat(item)}>
      <RoomAvatar>
        {/* 그룹방이면 여러명, 1:1이면 상대방 프로필 등으로 확장 가능 */}
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
            <UnreadText>{item.unreadCount}</UnreadText>
          </UnreadBadge>
        )}
      </TimeUnreadRow>
    </RoomItem>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainContainer>
        <FlatList
          data={rooms.filter(item => item && item.id)}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
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