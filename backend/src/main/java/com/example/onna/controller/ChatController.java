package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.dto.ChatRoomDto;
import com.example.onna.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 하트비트 처리
    @MessageMapping("/heartbeat")
    public void handleHeartbeat(SimpMessageHeaderAccessor headerAccessor) {
        log.info("=== 하트비트 수신 ===");
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("User: {}", headerAccessor.getUser());
        
        // 하트비트 응답 전송
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/heartbeat", "pong");
        }
    }

    // 메시지 전송 처리
    @MessageMapping("/chat/message")
    @SendTo("/topic/chat/room")
    public ChatMessageDto handleMessage(@Payload ChatMessageDto chatMessage, 
                                      SimpMessageHeaderAccessor headerAccessor) {
        log.info("=== STOMP 메시지 수신 ===");
        log.info("Received message: {}", chatMessage);
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("Headers: {}", headerAccessor.getSessionAttributes());
        log.info("User: {}", headerAccessor.getUser());
        
        // 메시지 ID 생성
        chatMessage.setId(UUID.randomUUID().toString());
        chatMessage.setTimestamp(LocalDateTime.now());
        
        // senderId가 없으면 JWT에서 추출한 사용자 ID 사용
        if (chatMessage.getSenderId() == null || chatMessage.getSenderId().isEmpty()) {
            String userId = getUserIdFromHeader(headerAccessor);
            chatMessage.setSenderId(userId);
        }
        
        log.info("Processed message: {}", chatMessage);
        
        // 메시지 저장 및 처리
        ChatMessageDto savedMessage = chatService.saveMessage(chatMessage);
        
        // 채팅방 참여자들에게 메시지 전송
        String destination = "/topic/chat/room/" + chatMessage.getRoomId();
        log.info("Sending message to: {}", destination);
        messagingTemplate.convertAndSend(destination, savedMessage);
        
        // 안읽음 메시지 알림 전송
        sendUnreadNotification(chatMessage);
        
        return savedMessage;
    }

    // 채팅방 입장
    @MessageMapping("/chat/join")
    public void handleJoinRoom(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("=== 채팅방 입장 ===");
        log.info("Room ID: {}", roomId);
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("User: {}", headerAccessor.getUser());
        
        String userId = getUserIdFromHeader(headerAccessor);
        
        // 채팅방 참여자 목록에 추가
        chatService.addRoomParticipant(roomId, userId);
        
        // 개인 구독 설정
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/joined", roomId);
        }
    }

    // 채팅방 퇴장
    @MessageMapping("/chat/leave")
    public void handleLeaveRoom(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("=== 채팅방 퇴장 ===");
        log.info("Room ID: {}", roomId);
        log.info("Session ID: {}", headerAccessor.getSessionId());
        
        String userId = getUserIdFromHeader(headerAccessor);
        
        // 채팅방 참여자 목록에서 제거
        chatService.removeRoomParticipant(roomId, userId);
        
        // 개인 구독 해제
        String sessionId = headerAccessor.getSessionId();
        if (sessionId != null) {
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/left", roomId);
        }
    }

    // 채팅방 목록 요청
    @MessageMapping("/chat/rooms")
    public void handleRoomListRequest(SimpMessageHeaderAccessor headerAccessor) {
        log.info("=== 채팅방 목록 요청 ===");
        log.info("Session ID: {}", headerAccessor.getSessionId());
        log.info("User: {}", headerAccessor.getUser());
        
        String userId = getUserIdFromHeader(headerAccessor);
        
        if (userId != null) {
            List<ChatRoomDto> rooms = chatService.getUserRooms(userId);
            
            // 개인에게 채팅방 목록 전송
            String sessionId = headerAccessor.getSessionId();
            if (sessionId != null) {
                messagingTemplate.convertAndSendToUser(sessionId, "/queue/rooms", rooms);
            }
        }
    }

    // 안읽음 메시지 알림 전송
    private void sendUnreadNotification(ChatMessageDto message) {
        try {
            // 채팅방 참여자들에게 안읽음 알림 전송
            List<String> participants = chatService.getRoomParticipants(message.getRoomId());
            
            for (String participantId : participants) {
                if (!participantId.equals(message.getSenderId())) {
                    // 개인에게 안읽음 알림 전송
                    messagingTemplate.convertAndSendToUser(
                        participantId, 
                        "/queue/notifications", 
                        createNotification(message)
                    );
                }
            }
        } catch (Exception e) {
            log.error("알림 전송 실패: {}", e.getMessage());
        }
    }

    // 알림 객체 생성
    private Object createNotification(ChatMessageDto message) {
        return new Object() {
            public final String type = "NEW_MESSAGE";
            public final String roomId = message.getRoomId();
            public final String message = message.getContent();
            public final String timestamp = message.getTimestamp().toString();
            public final String senderId = message.getSenderId();
        };
    }

    // 헤더에서 사용자 ID 추출 (JWT 토큰에서 추출)
    private String getUserIdFromHeader(SimpMessageHeaderAccessor headerAccessor) {
        try {
            // JWT에서 추출된 사용자 정보 사용
            if (headerAccessor.getUser() != null) {
                String userId = headerAccessor.getUser().getName();
                log.info("Extracted userId from JWT: {}", userId);
                return userId;
            }
            
            // 세션 속성에서 사용자 ID 확인
            Object sessionUserId = headerAccessor.getSessionAttributes().get("userId");
            if (sessionUserId != null) {
                log.info("Extracted userId from session: {}", sessionUserId);
                return sessionUserId.toString();
            }
            
            // 기본값으로 세션 ID 사용
            log.warn("No userId found, using session ID as fallback");
            return headerAccessor.getSessionId();
        } catch (Exception e) {
            log.error("Error extracting userId from header: {}", e.getMessage());
            return headerAccessor.getSessionId();
        }
    }
}
