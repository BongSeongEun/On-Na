package com.example.onna.controller;

import com.example.onna.service.SocialLoginService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    private final SocialLoginService socialLoginService;

    public LoginController(SocialLoginService socialLoginService) {
        this.socialLoginService = socialLoginService;
    }

    @PostMapping("/kakao")
    public Map<String, String> kakaoLogin(@RequestBody Map<String, String> body) {
        String kakaoAccessToken = body.get("kakaoAccessToken");
        String jwt = socialLoginService.kakaoLogin(kakaoAccessToken);
        return Map.of("token", jwt);
    }

    @PostMapping("/google")
    public Map<String, String> googleLogin(@RequestBody Map<String, String> body) {
        String googleAccessToken = body.get("googleAccessToken");
        String jwt = socialLoginService.googleLogin(googleAccessToken);
        return Map.of("token", jwt);
    }



}
