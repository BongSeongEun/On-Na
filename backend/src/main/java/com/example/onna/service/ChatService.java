package com.example.onna.service;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.dto.ChatRoomDto;
import com.example.onna.dto.ChatMapper;
import com.example.onna.model.ChatRoom;
import com.example.onna.model.ChatRoomMember;
import com.example.onna.model.ChatMessage;
import com.example.onna.repository.ChatRoomRepository;
import com.example.onna.repository.ChatRoomMemberRepository;
import com.example.onna.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMapper chatMapper;

    // WebSocket용 임시 저장소
    private final Map<String, ChatMessageDto> wsMessages = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> roomParticipants = new ConcurrentHashMap<>();
    private final Map<String, String> userSessions = new ConcurrentHashMap<>();

    // 메시지 저장 (WebSocket용)
    public ChatMessageDto saveMessage(ChatMessageDto message) {
        log.info("Saving message: {}", message);
        
        try {
            // 데이터베이스에 메시지 저장
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setContent(message.getContent());
            chatMessage.setSenderId(Long.parseLong(message.getSenderId()));
            chatMessage.setSentAt(message.getTimestamp());
            
            // 채팅방 조회
            Long roomId = Long.parseLong(message.getRoomId());
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomId);
            if (chatRoomOpt.isPresent()) {
                chatMessage.setChatRoom(chatRoomOpt.get());
                
                // 메시지 저장
                ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
                
                // DTO로 변환하여 반환
                ChatMessageDto savedDto = chatMapper.toChatMessageDto(savedMessage);
                
                // WebSocket 메시지 저장 (임시)
                wsMessages.put(savedDto.getId(), savedDto);
                
                // 채팅방 정보 업데이트
                updateRoomLastMessage(savedDto);
                
                log.info("Message saved successfully: {}", savedDto);
                return savedDto;
            } else {
                log.error("Chat room not found: {}", message.getRoomId());
                return message;
            }
        } catch (Exception e) {
            log.error("Error saving message: {}", e.getMessage());
            // 에러가 발생해도 메시지는 전송
            wsMessages.put(message.getId(), message);
            return message;
        }
    }

    // 채팅방 마지막 메시지 업데이트
    private void updateRoomLastMessage(ChatMessageDto message) {
        // 실제 구현에서는 데이터베이스 업데이트
        log.info("Updating last message for room: {}", message.getRoomId());
    }

    // 사용자를 채팅방에 추가 (WebSocket용)
    public void addUserToRoom(String roomId, String userId, String sessionId) {
        log.info("Adding user {} to room {}", userId, roomId);
        
        // 사용자 세션 매핑
        userSessions.put(sessionId, userId);
        
        // 채팅방 참여자 목록에 추가
        roomParticipants.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(userId);
    }

    // 사용자를 채팅방에서 제거 (WebSocket용)
    public void removeUserFromRoom(String roomId, String userId, String sessionId) {
        log.info("Removing user {} from room {}", userId, roomId);
        
        // 사용자 세션 매핑 제거
        userSessions.remove(sessionId);
        
        // 채팅방 참여자 목록에서 제거
        Set<String> participants = roomParticipants.get(roomId);
        if (participants != null) {
            participants.remove(userId);
        }
    }

    // 채팅방 참여자 추가 (새로운 메서드)
    public void addRoomParticipant(String roomId, String userId) {
        log.info("Adding participant {} to room {}", userId, roomId);
        roomParticipants.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(userId);
    }

    // 채팅방 참여자 제거 (새로운 메서드)
    public void removeRoomParticipant(String roomId, String userId) {
        log.info("Removing participant {} from room {}", userId, roomId);
        Set<String> participants = roomParticipants.get(roomId);
        if (participants != null) {
            participants.remove(userId);
        }
    }

    // 채팅방 참여자 목록 조회 (새로운 메서드)
    public List<String> getRoomParticipants(String roomId) {
        Set<String> participants = roomParticipants.get(roomId);
        if (participants != null) {
            return new ArrayList<>(participants);
        }
        return new ArrayList<>();
    }

    // 사용자의 채팅방 목록 조회 (데이터베이스에서)
    public List<ChatRoomDto> getUserRooms(String userId) {
        log.info("Getting rooms for user: {}", userId);
        
        try {
            Long userIdLong = Long.parseLong(userId);
            
            // 사용자가 속한 채팅방 멤버십 조회
            List<ChatRoomMember> memberships = chatRoomMemberRepository.findByUserId(userIdLong);
            
            // 채팅방 정보 조회
            List<ChatRoom> chatRooms = memberships.stream()
                .map(ChatRoomMember::getChatRoom)
                .filter(Objects::nonNull)
                .toList();
            
            // DTO로 변환
            List<ChatRoomDto> roomDtos = chatMapper.toChatRoomDtoList(chatRooms);
            
            log.info("Found {} rooms for user {}", roomDtos.size(), userId);
            return roomDtos;
            
        } catch (NumberFormatException e) {
            log.error("Invalid user ID format: {}", userId);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error getting rooms for user {}: {}", userId, e.getMessage());
            return new ArrayList<>();
        }
    }

    // 채팅방 메시지 조회 (데이터베이스에서)
    public List<ChatMessageDto> getRoomMessages(String roomId) {
        log.info("Getting messages for room: {}", roomId);
        
        try {
            Long roomIdLong = Long.parseLong(roomId);
            
            // 채팅방 존재 확인
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomIdLong);
            if (chatRoomOpt.isEmpty()) {
                log.warn("Chat room not found: {}", roomId);
                return new ArrayList<>();
            }
            
            // 메시지 조회 (실제 구현에서는 페이지네이션 적용 권장)
            List<ChatMessage> messages = chatMessageRepository.findByChatRoomId(roomIdLong);
            
            // DTO로 변환
            List<ChatMessageDto> messageDtos = chatMapper.toChatMessageDtoList(messages);
            
            log.info("Found {} messages for room {}", messageDtos.size(), roomId);
            return messageDtos;
            
        } catch (NumberFormatException e) {
            log.error("Invalid room ID format: {}", roomId);
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error getting messages for room {}: {}", roomId, e.getMessage());
            return new ArrayList<>();
        }
    }

    // 메시지 읽음 처리
    public void markMessageAsRead(String messageId, String userId) {
        log.info("Marking message {} as read by user {}", messageId, userId);
        
        // 실제 구현에서는 데이터베이스에서 읽음 상태를 업데이트
        // 여기서는 로그만 출력
    }

    // 채팅방 생성 (데이터베이스에 저장)
    public ChatRoomDto createRoom(String roomName, List<String> participants) {
        log.info("Creating room: {} with participants: {}", roomName, participants);
        
        try {
            // 채팅방 생성
            ChatRoom chatRoom = new ChatRoom();
            chatRoom.setName(roomName);
            chatRoom.setCreatedAt(LocalDateTime.now());
            
            ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
            
            // 참여자 추가
            for (String participantId : participants) {
                try {
                    Long userId = Long.parseLong(participantId);
                    ChatRoomMember member = new ChatRoomMember();
                    member.setChatRoom(savedRoom);
                    member.setUserId(userId);
                    chatRoomMemberRepository.save(member);
                } catch (NumberFormatException e) {
                    log.warn("Invalid participant ID: {}", participantId);
                }
            }
            
            // DTO로 변환하여 반환
            ChatRoomDto roomDto = chatMapper.toChatRoomDto(savedRoom);
            log.info("Created room: {}", roomDto);
            return roomDto;
            
        } catch (Exception e) {
            log.error("Error creating room: {}", e.getMessage());
            throw new RuntimeException("Failed to create chat room", e);
        }
    }

    // 채팅방 정보 조회
    public ChatRoomDto getRoom(String roomId) {
        try {
            Long roomIdLong = Long.parseLong(roomId);
            Optional<ChatRoom> chatRoomOpt = chatRoomRepository.findById(roomIdLong);
            
            if (chatRoomOpt.isPresent()) {
                return chatMapper.toChatRoomDto(chatRoomOpt.get());
            } else {
                log.warn("Chat room not found: {}", roomId);
                return null;
            }
        } catch (NumberFormatException e) {
            log.error("Invalid room ID format: {}", roomId);
            return null;
        }
    }

    // 사용자 세션 조회
    public String getUserIdFromSession(String sessionId) {
        return userSessions.get(sessionId);
    }

    // 테스트용 샘플 채팅방 생성
    public void createSampleRooms() {
        log.info("Creating sample chat rooms...");
        
        try {
            // 샘플 채팅방 1: "대구 뭉티기 맛집 탐방러들"
            ChatRoom room1 = new ChatRoom();
            room1.setName("대구 뭉티기 맛집 탐방러들");
            room1.setCreatedAt(LocalDateTime.now());
            ChatRoom savedRoom1 = chatRoomRepository.save(room1);
            
            // 사용자 1을 채팅방에 추가
            ChatRoomMember member1 = new ChatRoomMember();
            member1.setChatRoom(savedRoom1);
            member1.setUserId(1L);
            chatRoomMemberRepository.save(member1);
            
            // 샘플 채팅방 2: "운동 메이트"
            ChatRoom room2 = new ChatRoom();
            room2.setName("운동 메이트");
            room2.setCreatedAt(LocalDateTime.now());
            ChatRoom savedRoom2 = chatRoomRepository.save(room2);
            
            // 사용자 1을 채팅방에 추가
            ChatRoomMember member2 = new ChatRoomMember();
            member2.setChatRoom(savedRoom2);
            member2.setUserId(1L);
            chatRoomMemberRepository.save(member2);
            
            log.info("Sample rooms created successfully");
            
        } catch (Exception e) {
            log.error("Error creating sample rooms: {}", e.getMessage());
        }
    }
}
