package com.example.onna.dto;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private Long chatRoomId;
    private Long senderId;
    private String content;
    private Long messageId; // 읽음 처리용
}
