package com.example.onna.controller;

import com.example.onna.service.KakaoLoginService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    private final KakaoLoginService kakaoLoginService;

    public LoginController(KakaoLoginService kakaoLoginService) {
        this.kakaoLoginService = kakaoLoginService;
    }

    @PostMapping("/kakao")
    public Map<String, String> kakaoLogin(@RequestBody Map<String, String> body) {
        String kakaoAccessToken = body.get("kakaoAccessToken");
        String jwt = kakaoLoginService.kakaoLogin(kakaoAccessToken);
        return Map.of("token", jwt);
    }

}
