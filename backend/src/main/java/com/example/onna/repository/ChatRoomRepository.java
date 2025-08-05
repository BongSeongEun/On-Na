package com.example.onna.repository;

import com.example.onna.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 특정 유저가 참여한 채팅방 목록 조회
    List<ChatRoom> findByUserAIdOrUserBId(Long userAId, Long userBId);

    // 두 유저 사이의 채팅방이 이미 있는지 확인
    Optional<ChatRoom> findByUserAIdAndUserBId(Long userAId, Long userBId);
    Optional<ChatRoom> findByUserBIdAndUserAId(Long userBId, Long userAId);

    // roomId로 조회
    Optional<ChatRoom> findByRoomId(String roomId);
}

