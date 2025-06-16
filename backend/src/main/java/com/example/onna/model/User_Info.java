package com.example.onna.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User_Info {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long userInfoId;
    @OneToOne
    private User user;
    private String gender;
    private String age;
    private String address;
    private String travelRate;
    private String travelType;
    private String travelLocation;
    private String travelScheduleType;
}
