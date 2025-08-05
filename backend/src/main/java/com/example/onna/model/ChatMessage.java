package com.example.onna.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatMessage {
    @Id
    @GeneratedValue
    private Long id;
    private String roomId;
    private Long senderId;
    private String message;
    @Column(name = "is_read")
    private boolean read;
    private LocalDateTime timestamp;
}

