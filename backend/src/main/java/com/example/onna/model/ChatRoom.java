package com.example.onna.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatRoom {
    @Id
    @GeneratedValue
    private Long id;
    private String roomId; // UUID 또는 고유 ID
    private Long userAId;
    private Long userBId;
}
