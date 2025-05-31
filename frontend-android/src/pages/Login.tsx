import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image } from 'react-native';
import styled from '@emotion/native';
import { BASE_URL } from '@env';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { login } from '@react-native-seoul/kakao-login';

const Logo = styled.Image`
    width: 270px;
    height: 75px;
    justify-content: center;
    align-items: center;
    margin-bottom: 60px;
`;
const LogoContainer = styled.View`
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`
const LoginButtonContainer = styled.View`
    flex-direction: row;
    justify-content: center;
    align-items: center;

`
const KakaoLoginButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    margin-right: 40px;
    background-image: url(${require('../assets/images/KakaoLogin.png')});
`
const GoogleLoginButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    background-image: url(${require('../assets/images/GoogleLogin.png')});
`
const KakaoLoginImage = styled.Image`
    width: 75px;
    height: 75px;
`
const GoogleLoginImage = styled.Image`
    width: 70px;
    height: 70px;
`

const api = axios.create({
    baseURL: BASE_URL,
})

api.interceptors.request.use(async (config) => {
    const token = await Keychain.getGenericPassword();
    if (token) {
      config.headers.Authorization = `Bearer ${token.password}`;
    }
    return config;
  });

function Login() {
    const [me, setMe] = useState(null);
    
    const kakaoLogin = async () => {
        try {
          const result = await login();
          const kakaoAccessToken = result.accessToken;
    
          const response = await api.post("/auth/kakao", {
            kakaoAccessToken
          });
    
          const jwt = response.data.token;
          await Keychain.setGenericPassword("jwt", jwt);
        } catch (e) {
          console.error('Kakao login error:', e);
        }
      };

      const getMyInfo = async () => {
        try {
          const response = await api.get("/users/me");
          setMe(response.data);
        } catch (e) {
          console.error(e);
        }
      };


    return (
        <LogoContainer>
            <Logo source={require('../assets/images/Logo.png')} />
            <LoginButtonContainer>
                <KakaoLoginButton onPress={kakaoLogin}>
                    <KakaoLoginImage source={require('../assets/images/KakaoLogin.png')} />
                </KakaoLoginButton>
                <GoogleLoginButton>
                    <GoogleLoginImage source={require('../assets/images/GoogleLogin.png')} />
                </GoogleLoginButton>
            </LoginButtonContainer>
        </LogoContainer>
    );
}

export default Login;

