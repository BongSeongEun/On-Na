package com.example.onna.repository;

import com.example.onna.model.ChatMessageRead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageReadRepository extends JpaRepository<ChatMessageRead, Long> {
    List<ChatMessageRead> findByUserIdAndMessage_ChatRoomId(Long userId, Long chatRoomId);
}
