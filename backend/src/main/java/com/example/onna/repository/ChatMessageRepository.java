package com.example.onna.repository;

import com.example.onna.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 채팅방 메시지 목록 조회 (시간순)
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);

    // 안읽은 메시지 개수
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.roomId = :roomId AND m.senderId != :userId AND m.read = false")
    long countUnreadMessages(String roomId, Long userId);

    // 읽음 처리
    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.read = true WHERE m.roomId = :roomId AND m.senderId != :userId AND m.read = false")
    void markMessagesAsRead(String roomId, Long userId);
}
