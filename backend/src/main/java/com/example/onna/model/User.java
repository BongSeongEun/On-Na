package com.example.onna.model;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;           //  유저 아이디
    @Nullable
    private String socialId;
    private String userName;       //  유저 이름
    private String nickname;       //  닉네임
    private String email;          //  유저 이메일
    private Boolean is_foreign;    //  true = 외국인 | false = 내국인
    private String profile_image;  //  프로필 사진
    @Nullable
    private String password;
    private String refresh_token;

    public User(@Nullable String socialId, String email, String nickname, @Nullable String password) {
        this.socialId = socialId;
        this.email = email;
        this.nickname = nickname;
        this.password = password;
    }
}
