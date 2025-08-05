import React, { useState, useEffect } from 'react';
import styled from '@emotion/native';
import NavBar from '../components/NavBar';
import { FlatList, Text, TouchableOpacity, Image, View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '@env';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { getCurrentUserId } from '../utils/jwtUtils';
import { useNavigation } from '@react-navigation/native';

// ChatRoom 타입 정의
interface ChatRoom {
    id: string;
    roomId: string;
    userAId: number;
    userBId: number;
    userName: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    profileImage: string;
}

// API 응답 타입
interface ChatRoomResponse {
    roomId: string;
    userId: number;
    userName: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

const MainContainer = styled.View`
    width: 100%;
    height: 100%;
    background-color: white;
    padding: 20px;
`;

const HeaderContainer = styled.View`
    margin-bottom: 20px;
`;

const HeaderTitle = styled.Text`
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
`;

const SearchContainer = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 10px;
    padding: 10px 15px;
    margin-bottom: 20px;
`;

const SearchInput = styled.TextInput`
    flex: 1;
    margin-left: 10px;
    font-size: 16px;
`;

const ChatRoomItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 15px 0;
    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
`;

const ProfileImage = styled.Image`
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 15px;
`;

const ChatInfoContainer = styled.View`
    flex: 1;
`;

const ChatHeader = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
`;

const UserName = styled.Text`
    font-size: 16px;
    font-weight: 600;
    color: #333;
`;

const TimeText = styled.Text`
    font-size: 12px;
    color: #999;
`;

const LastMessage = styled.Text`
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
`;

const UnreadBadge = styled.View`
    background-color: #ff4757;
    border-radius: 10px;
    min-width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
    padding-horizontal: 6px;
`;

const UnreadCount = styled.Text`
    color: white;
    font-size: 12px;
    font-weight: bold;
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

const EmptyText = styled.Text`
    font-size: 16px;
    color: #999;
    text-align: center;
`;

const NavContainer = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
`;

// API 설정
const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
    const token = await Keychain.getGenericPassword();
    if (token) {
        config.headers.Authorization = `Bearer ${token.password}`;
    }
    return config;
});

function Chat_room() {
    const navigation = useNavigation();
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 시간 포맷팅 함수
    const formatTimestamp = (timestamp: string): string => {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            
            if (diffInHours < 24) {
                return date.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            } else if (diffInHours < 48) {
                return '어제';
            } else {
                return date.toLocaleDateString('ko-KR', { 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            }
        } catch (e) {
            return timestamp;
        }
    };

    // 채팅방 목록 가져오기
    const fetchChatRooms = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 실제 로그인된 사용자 ID 가져오기
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) {
                setError('로그인이 필요합니다.');
                setLoading(false);
                return;
            }
            
            const response = await api.get(`/api/chat/rooms/${currentUserId}`);
            const chatRoomResponses: ChatRoomResponse[] = response.data;
            
            const formattedChatRooms: ChatRoom[] = chatRoomResponses.map((room, index) => {
                // 안전한 값 추출
                const safeRoomId = room.roomId || '';
                const safeUserId = room.userId || 0;
                const safeUserName = room.userName || '상대방';
                const safeLastMessage = room.lastMessage || '';
                const safeTimestamp = room.timestamp || '';
                const safeUnreadCount = room.unreadCount || 0;
                
                return {
                    id: index.toString(),
                    roomId: safeRoomId,
                    userAId: currentUserId,
                    userBId: safeUserId,
                    userName: safeUserName,
                    lastMessage: safeLastMessage,
                    timestamp: formatTimestamp(safeTimestamp),
                    unreadCount: safeUnreadCount,
                    profileImage: safeUserName ? 
                        `https://private-user-images.githubusercontent.com/102515499/375417490-e360dc37-556b-48da-92b6-83e58bc250cd.jpg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTQ0MDQ3NDAsIm5iZiI6MTc1NDQwNDQ0MCwicGF0aCI6Ii8xMDI1MTU0OTkvMzc1NDE3NDkwLWUzNjBkYzM3LTU1NmItNDhkYS05MmI2LTgzZTU4YmMyNTBjZC5qcGc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwODA1JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDgwNVQxNDM0MDBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kMmMxM2JiMjBmNDhkMGQ3Y2NkZDM0Zjg3YTg5OTVlZDZiMDI5OWU0ZjM3N2ViN2M1OTVkM2E4MDIwMWQ0MzIzJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.hAliSevribhMkeHzuhrhq_YGQto1hHGkxqBc35RXxss` :
                        'https://via.placeholder.com/50'
                };
            });
            
            setChatRooms(formattedChatRooms);
        } catch (err) {
            console.error('채팅방 목록 가져오기 실패:', err);
            setError('채팅방 목록을 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatRooms();
    }, []);

    const filteredChatRooms = chatRooms.filter(room =>
        room.userName && room.userName.includes(searchText)
    );

    const renderChatRoom = ({ item }: { item: ChatRoom }) => {
        // 안전한 값 추출
        const safeUserName = item.userName || '상대방';
        const safeTimestamp = item.timestamp || '';
        const safeLastMessage = item.lastMessage || '';
        const safeUnreadCount = item.unreadCount || 0;
        const safeProfileImage = item.profileImage || 'https://via.placeholder.com/50';
        const safeRoomId = item.roomId || '';

        return (
            <ChatRoomItem onPress={() => {
                console.log('채팅방 열기:', safeRoomId);
                // 채팅방 페이지로 이동
                (navigation as any).navigate('Chatting', {
                    roomId: safeRoomId,
                    userName: safeUserName
                });
            }}>
                <ProfileImage source={{ uri: safeProfileImage }} />
                <ChatInfoContainer>
                    <ChatHeader>
                        <UserName>{safeUserName}</UserName>
                        <TimeText>{safeTimestamp}</TimeText>
                    </ChatHeader>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <LastMessage numberOfLines={1}>{safeLastMessage}</LastMessage>
                        {safeUnreadCount > 0 && (
                            <UnreadBadge>
                                <UnreadCount>{safeUnreadCount}</UnreadCount>
                            </UnreadBadge>
                        )}
                    </View>
                </ChatInfoContainer>
            </ChatRoomItem>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={{flex: 1}}>
                <MainContainer>
                    <LoadingContainer>
                        <ActivityIndicator size="large" color="#FFEB3B" />
                        <Text style={{ marginTop: 10, color: '#666' }}>채팅방 목록을 불러오는 중...</Text>
                    </LoadingContainer>
                </MainContainer>
                <NavContainer>
                    <NavBar />
                </NavContainer>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <MainContainer>
                <HeaderContainer>
                    <HeaderTitle>채팅</HeaderTitle>
                </HeaderContainer>
                
                <SearchContainer>
                    <Text style={{ fontSize: 16 }}>🔍</Text>
                    <SearchInput
                        placeholder="채팅방 검색"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </SearchContainer>

                {error && (
                    <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
                        {error}
                    </Text>
                )}

                {filteredChatRooms.length === 0 ? (
                    <EmptyContainer>
                        <EmptyText>
                            {searchText ? '검색 결과가 없습니다.' : '채팅방이 없습니다.'}
                        </EmptyText>
                    </EmptyContainer>
                ) : (
                    <FlatList
                        data={filteredChatRooms}
                        renderItem={renderChatRoom}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        refreshing={loading}
                        onRefresh={fetchChatRooms}
                    />
                )}
            </MainContainer>
            <NavContainer>
                <NavBar />
            </NavContainer>
        </SafeAreaView>
    );
}

export default Chat_room;