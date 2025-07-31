package com.example.onna.dto;

import com.example.onna.model.ChatMessage;
import com.example.onna.model.ChatRoom;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChatMapper {

    // ChatRoom -> ChatRoomDto 변환
    public ChatRoomDto toChatRoomDto(ChatRoom chatRoom) {
        if (chatRoom == null) return null;
        
        ChatRoomDto dto = new ChatRoomDto();
        dto.setId(chatRoom.getId().toString());
        dto.setName(chatRoom.getName());
        dto.setLastMessageTime(chatRoom.getCreatedAt());
        dto.setLastMessage("새로운 채팅방입니다."); // 기본 메시지
        dto.setUnreadCount(0); // 실제 구현에서는 계산 필요
        dto.setParticipants(
            chatRoom.getMembers().stream()
                .map(member -> member.getUserId().toString())
                .collect(Collectors.toList())
        );
        
        return dto;
    }

    // ChatMessage -> ChatMessageDto 변환
    public ChatMessageDto toChatMessageDto(ChatMessage chatMessage) {
        if (chatMessage == null) return null;
        
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(chatMessage.getId().toString());
        dto.setRoomId(chatMessage.getChatRoom().getId().toString());
        dto.setSenderId(chatMessage.getSenderId().toString());
        dto.setContent(chatMessage.getContent());
        dto.setTimestamp(chatMessage.getSentAt());
        dto.setType(ChatMessageDto.MessageType.TEXT); // 기본값
        
        return dto;
    }

    // List<ChatRoom> -> List<ChatRoomDto> 변환
    public List<ChatRoomDto> toChatRoomDtoList(List<ChatRoom> chatRooms) {
        if (chatRooms == null) return null;
        
        return chatRooms.stream()
            .map(this::toChatRoomDto)
            .collect(Collectors.toList());
    }

    // List<ChatMessage> -> List<ChatMessageDto> 변환
    public List<ChatMessageDto> toChatMessageDtoList(List<ChatMessage> chatMessages) {
        if (chatMessages == null) return null;
        
        return chatMessages.stream()
            .map(this::toChatMessageDto)
            .collect(Collectors.toList());
    }
} 