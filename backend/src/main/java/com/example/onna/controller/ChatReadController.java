package com.example.onna.controller;

import com.example.onna.dto.ChatMessageDto;
import com.example.onna.dto.ChatRoomListDto;
import com.example.onna.model.ChatMessage;
import com.example.onna.model.ChatRoom;
import com.example.onna.model.User;
import com.example.onna.repository.ChatMessageRepository;
import com.example.onna.repository.ChatRoomRepository;
import com.example.onna.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatReadController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/rooms/{userId}")
    public ResponseEntity<List<ChatRoomListDto>> getChatRooms(@PathVariable Long userId) {
        List<ChatRoom> chatRooms = chatRoomRepository.findByUserAIdOrUserBId(userId, userId);
        
        List<ChatRoomListDto> chatRoomList = chatRooms.stream()
            .map(room -> {
                // 상대방 ID 찾기
                Long otherUserId = room.getUserAId().equals(userId) ? room.getUserBId() : room.getUserAId();
                User otherUser = userRepository.findById(otherUserId).orElse(null);
                
                // 마지막 메시지 찾기
                List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(room.getRoomId());
                ChatMessage lastMessage = messages.isEmpty() ? null : messages.get(messages.size() - 1);
                
                // 읽지 않은 메시지 수
                long unreadCount = chatMessageRepository.countUnreadMessages(room.getRoomId(), userId);
                
                return ChatRoomListDto.builder()
                    .roomId(room.getRoomId())
                    .userId(otherUserId)
                    .userName(otherUser != null ? otherUser.getUserName() : "Unknown")
                    .lastMessage(lastMessage != null ? lastMessage.getMessage() : "")
                    .timestamp(lastMessage != null ? lastMessage.getTimestamp().toString() : "")
                    .unreadCount((int) unreadCount)
                    .build();
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(chatRoomList);
    }

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable String roomId) {
        List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        
        List<ChatMessageDto> messageDtos = messages.stream()
            .map(message -> ChatMessageDto.builder()
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .message(message.getMessage())
                .timestamp(message.getTimestamp().toString())
                .read(message.isRead())
                .build())
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(messageDtos);
    }

    @PostMapping("/read/{roomId}/{userId}")
    public ResponseEntity<Void> markAsRead(@PathVariable String roomId, @PathVariable Long userId) {
        chatMessageRepository.markMessagesAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }
}
