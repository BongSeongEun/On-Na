import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/native';
import NavBar from '../components/NavBar';
import { 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator,
    Alert,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '@env';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { getCurrentUserId } from '../utils/jwtUtils';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface ChatMessage {
    id: string;
    roomId: string;
    senderId: number;
    message: string;
    timestamp: string;
    read: boolean;
    isMyMessage: boolean;
}

interface ChattingProps {
    route?: {
        params?: {
            roomId?: string;
            userName?: string;
        };
    };
}

const MainContainer = styled.View`
    width: 100%;
    height: 100%;
    background-color: white;
    flex: 1;
`;

const HeaderContainer = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 15px 20px;
    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
    background-color: white;
`;

const BackButton = styled.TouchableOpacity`
    margin-right: 15px;
`;

const HeaderTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    color: #333;
    flex: 1;
`;

const MessageContainer = styled.View`
    flex: 1;
    padding: 10px;
`;

const MessageItem = styled.View<{ isMyMessage: boolean }>`
    margin-bottom: 10px;
    align-items: ${props => props.isMyMessage ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.View<{ isMyMessage: boolean }>`
    background-color: ${props => props.isMyMessage ? '#FFEB3B' : '#f0f0f0'};
    padding: 10px 15px;
    border-radius: 20px;
    max-width: 70%;
`;

const MessageText = styled.Text<{ isMyMessage: boolean }>`
    font-size: 16px;
    color: ${props => props.isMyMessage ? '#333' : '#333'};
`;

const MessageTime = styled.Text`
    font-size: 12px;
    color: #999;
    margin-top: 5px;
    text-align: center;
`;

const InputContainer = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 15px 20px;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    background-color: white;
`;

const MessageInput = styled.TextInput`
    flex: 1;
    border-width: 1px;
    border-color: #ddd;
    border-radius: 20px;
    padding: 10px 15px;
    margin-right: 10px;
    font-size: 16px;
`;

const SendButton = styled.TouchableOpacity`
    background-color: #FFEB3B;
    padding: 10px 20px;
    border-radius: 20px;
`;

const SendButtonText = styled.Text`
    color: #333;
    font-weight: bold;
    font-size: 16px;
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

function Chatting({ route }: ChattingProps) {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);
    
    const roomId = route?.params?.roomId || 'default-room';
    const userName = route?.params?.userName || '상대방';
    const flatListRef = useRef<FlatList>(null);

    // 시간 포맷팅 함수
    const formatMessageTime = (timestamp: string): string => {
        if (!timestamp) return '';
        
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        } catch (e) {
            return timestamp;
        }
    };

    // 메시지 목록 가져오기
    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userId = await getCurrentUserId();
            if (!userId) {
                setError('로그인이 필요합니다.');
                return;
            }
            
            setCurrentUserId(userId);
            
            const response = await api.get(`/api/chat/messages/${roomId}`);
            const messageDtos = response.data;
            
            const formattedMessages: ChatMessage[] = messageDtos.map((msg: any, index: number) => ({
                id: index.toString(),
                roomId: msg.roomId,
                senderId: msg.senderId,
                message: msg.message,
                timestamp: msg.timestamp,
                read: msg.read,
                isMyMessage: msg.senderId === userId
            }));
            
            setMessages(formattedMessages);
        } catch (err) {
            console.error('메시지 목록 가져오기 실패:', err);
            setError('메시지를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // WebSocket 연결
    const connectWebSocket = () => {
        console.log('WebSocket 연결 시도:', `${BASE_URL}/ws-chat`);
        
        const client = new Client({
            webSocketFactory: () => new SockJS(`${BASE_URL}/ws-chat`),
            debug: (str: any) => {
                console.log('WebSocket Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('WebSocket 연결 성공:', frame);
            setConnected(true);
            
            // 채팅방 구독
            client.subscribe(`/topic/chat/${roomId}`, (message) => {
                console.log('메시지 수신:', message.body);
                const receivedMessage = JSON.parse(message.body);
                const newMessage: ChatMessage = {
                    id: Date.now().toString(),
                    roomId: receivedMessage.roomId,
                    senderId: receivedMessage.senderId,
                    message: receivedMessage.message,
                    timestamp: new Date().toISOString(),
                    read: false,
                    isMyMessage: receivedMessage.senderId === currentUserId
                };
                
                setMessages(prev => [...prev, newMessage]);
            });
        };

        client.onStompError = (frame) => {
            console.error('WebSocket 에러:', frame);
            setConnected(false);
        };

        try {
            client.activate();
            setStompClient(client);
        } catch (error) {
            console.error('WebSocket 활성화 실패:', error);
            setConnected(false);
        }
    };

    // 메시지 전송
    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUserId) {
            console.log('전송 조건 확인:', {
                hasMessage: !!newMessage.trim(),
                currentUserId
            });
            return;
        }

        const messageData = {
            roomId: roomId,
            senderId: currentUserId,
            message: newMessage.trim()
        };

        try {
            console.log('메시지 전송 시도:', messageData);
            
            // 로컬에서 즉시 메시지 추가
            const localMessage: ChatMessage = {
                id: Date.now().toString(),
                roomId: roomId,
                senderId: currentUserId,
                message: newMessage.trim(),
                timestamp: new Date().toISOString(),
                read: false,
                isMyMessage: true
            };
            
            setMessages(prev => [...prev, localMessage]);
            setNewMessage('');

            // HTTP API로 메시지 전송 (WebSocket 연결 여부와 관계없이)
            try {
                console.log('HTTP API로 메시지 전송');
                await api.post('/api/chat/send', messageData);
                console.log('HTTP 메시지 전송 성공');
            } catch (httpError) {
                console.error('HTTP 메시지 전송 실패:', httpError);
                Alert.alert('오류', '메시지 전송에 실패했습니다.');
            }

            // WebSocket으로도 전송 시도 (연결된 경우에만)
            if (stompClient && connected) {
                try {
                    stompClient.publish({
                        destination: '/app/chat.send',
                        body: JSON.stringify(messageData)
                    });
                    console.log('WebSocket 메시지 전송 성공');
                } catch (wsError) {
                    console.error('WebSocket 메시지 전송 실패:', wsError);
                }
            }
        } catch (error) {
            console.error('메시지 전송 실패:', error);
            Alert.alert('오류', '메시지 전송에 실패했습니다.');
        }
    };

    // 메시지 읽음 처리
    const markAsRead = async () => {
        if (!currentUserId) return;
        
        try {
            await api.post(`/api/chat/read/${roomId}/${currentUserId}`);
        } catch (error) {
            console.error('읽음 처리 실패:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        connectWebSocket();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [roomId]);

    useEffect(() => {
        if (messages.length > 0) {
            markAsRead();
        }
    }, [messages]);

    const renderMessage = ({ item }: { item: ChatMessage }) => (
        <MessageItem isMyMessage={item.isMyMessage}>
            <MessageBubble isMyMessage={item.isMyMessage}>
                <MessageText isMyMessage={item.isMyMessage}>
                    {item.message}
                </MessageText>
            </MessageBubble>
            <MessageTime>{formatMessageTime(item.timestamp)}</MessageTime>
        </MessageItem>
    );

    if (loading) {
        return (
            <SafeAreaView style={{flex: 1}}>
                <MainContainer>
                    <LoadingContainer>
                        <ActivityIndicator size="large" color="#FFEB3B" />
                        <Text style={{ marginTop: 10, color: '#666' }}>메시지를 불러오는 중...</Text>
                    </LoadingContainer>
                </MainContainer>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <KeyboardAvoidingView 
                style={{flex: 1}} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <MainContainer>
                    <HeaderContainer>
                        <BackButton onPress={() => {
                            console.log('뒤로가기 버튼 클릭');
                            (navigation as any).goBack();
                        }}>
                            <Text style={{ fontSize: 20, color: '#333' }}>←</Text>
                        </BackButton>
                        <HeaderTitle>{userName}</HeaderTitle>
                    </HeaderContainer>

                    {error && (
                        <Text style={{ color: 'red', textAlign: 'center', padding: 10 }}>
                            {error}
                        </Text>
                    )}

                    {messages.length === 0 ? (
                        <EmptyContainer>
                            <EmptyText>아직 메시지가 없습니다.</EmptyText>
                        </EmptyContainer>
                    ) : (
                        <MessageContainer>
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            />
                        </MessageContainer>
                    )}

                    <InputContainer>
                        <MessageInput
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder="메시지를 입력하세요..."
                            multiline
                            maxLength={500}
                            onSubmitEditing={sendMessage}
                        />
                        <SendButton 
                            onPress={sendMessage} 
                            disabled={!newMessage.trim()}
                            style={{ opacity: !newMessage.trim() ? 0.5 : 1 }}
                        >
                            <SendButtonText>전송</SendButtonText>
                        </SendButton>
                    </InputContainer>
                </MainContainer>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default Chatting;