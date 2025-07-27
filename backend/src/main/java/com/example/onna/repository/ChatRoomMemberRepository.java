package com.example.onna.repository;

import com.example.onna.model.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByUserId(Long userId);
}
