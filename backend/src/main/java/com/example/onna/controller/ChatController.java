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
        
        // senderId가 없으면 세션 ID 사용
        if (chatMessage.getSenderId() == null || chatMessage.getSenderId().isEmpty()) {
            chatMessage.setSenderId(getUserIdFromHeader(headerAccessor));
        }
        
        log.info("Processed message: {}", chatMessage);
        
        // 메시지 저장 및 처리
        ChatMessageDto savedMessage = chatService.saveMessage(chatMessage);
        
        // 채팅방 참여자들에게 메시지 전송
        String destination = "/topic/chat/room/" + chatMessage.getRoomId();
        log.info("Sending message to: {}", destination);
        messagingTemplate.convertAndSend(destination, savedMessage);
        
        return savedMessage;
    }

    // 채팅방 입장
    @MessageMapping("/chat/join")
    public void handleJoinRoom(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("User joining room: {}", roomId);
        
        String sessionId = headerAccessor.getSessionId();
        String userId = getUserIdFromHeader(headerAccessor);
        
        // 사용자를 채팅방에 추가
        chatService.addUserToRoom(roomId, userId, sessionId);
        
        // 채팅방 참여자들에게 입장 알림
        ChatMessageDto joinMessage = new ChatMessageDto();
        joinMessage.setId(UUID.randomUUID().toString());
        joinMessage.setRoomId(roomId);
        joinMessage.setSenderId("SYSTEM");
        joinMessage.setContent(userId + "님이 입장하셨습니다.");
        joinMessage.setTimestamp(LocalDateTime.now());
        joinMessage.setType(ChatMessageDto.MessageType.TEXT);
        
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, joinMessage);
    }

    // 채팅방 퇴장
    @MessageMapping("/chat/leave")
    public void handleLeaveRoom(@Payload String roomId, SimpMessageHeaderAccessor headerAccessor) {
        log.info("User leaving room: {}", roomId);
        
        String sessionId = headerAccessor.getSessionId();
        String userId = getUserIdFromHeader(headerAccessor);
        
        // 사용자를 채팅방에서 제거
        chatService.removeUserFromRoom(roomId, userId, sessionId);
        
        // 채팅방 참여자들에게 퇴장 알림
        ChatMessageDto leaveMessage = new ChatMessageDto();
        leaveMessage.setId(UUID.randomUUID().toString());
        leaveMessage.setRoomId(roomId);
        leaveMessage.setSenderId("SYSTEM");
        leaveMessage.setContent(userId + "님이 퇴장하셨습니다.");
        leaveMessage.setTimestamp(LocalDateTime.now());
        leaveMessage.setType(ChatMessageDto.MessageType.TEXT);
        
        messagingTemplate.convertAndSend("/topic/chat/room/" + roomId, leaveMessage);
    }

    // 채팅방 목록 요청
    @MessageMapping("/chat/rooms")
    public void handleRequestRooms(SimpMessageHeaderAccessor headerAccessor) {
        String userId = getUserIdFromHeader(headerAccessor);
        log.info("User requesting rooms: {}", userId);
        
        // 사용자의 채팅방 목록 조회
        List<ChatRoomDto> rooms = chatService.getUserRooms(userId);
        
        // 개인 메시지로 채팅방 목록 전송
        messagingTemplate.convertAndSendToUser(
            headerAccessor.getSessionId(),
            "/queue/rooms",
            rooms
        );
    }

    // 헤더에서 사용자 ID 추출 (JWT 토큰에서 추출하는 로직으로 대체 필요)
    private String getUserIdFromHeader(SimpMessageHeaderAccessor headerAccessor) {
        // 실제 구현에서는 JWT 토큰을 파싱하여 사용자 ID를 추출
        // 여기서는 임시로 세션 ID를 사용
        return headerAccessor.getSessionId();
    }
}
