package com.example.onna.service;

import com.example.onna.model.ChatMessage;
import com.example.onna.model.ChatMessageRead;
import com.example.onna.model.ChatRoom;
import com.example.onna.model.ChatRoomMember;
import com.example.onna.repository.ChatMessageReadRepository;
import com.example.onna.repository.ChatMessageRepository;
import com.example.onna.repository.ChatRoomMemberRepository;
import com.example.onna.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatMessageReadRepository chatMessageReadRepository;

    // 채팅방 생성
    public ChatRoom createRoom(String name, List<Long> userIds) {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        chatRoomRepository.save(room);

        for (Long userId : userIds) {
            ChatRoomMember member = new ChatRoomMember();
            member.setChatRoom(room);
            member.setUserId(userId);
            chatRoomMemberRepository.save(member);
        }
        return room;
    }

    // 채팅방 목록 (내가 속한)
    public List<ChatRoom> getMyRooms(Long userId) {
        List<ChatRoomMember> members = chatRoomMemberRepository.findByUserId(userId);
        return members.stream()
            .map(ChatRoomMember::getChatRoom)
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toList());
    }

    // 메시지 저장
    public ChatMessage saveMessage(Long roomId, Long senderId, String content) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSenderId(senderId);
        message.setContent(content);
        chatMessageRepository.save(message);
        return message;
    }

    // 메시지 읽음 처리
    public void markAsRead(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElseThrow();
        if (chatMessageReadRepository.findByUserIdAndMessage_ChatRoomId(userId, message.getChatRoom().getId())
                .stream().noneMatch(r -> r.getMessage().getId().equals(messageId))) {
            ChatMessageRead read = new ChatMessageRead();
            read.setMessage(message);
            read.setUserId(userId);
            chatMessageReadRepository.save(read);
        }
    }

    // 채팅방 메시지 목록
    public List<ChatMessage> getMessages(Long roomId) {
        return chatMessageRepository.findByChatRoomId(roomId);
    }
}
