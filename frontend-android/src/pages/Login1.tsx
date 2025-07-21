import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '@env';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { login as kakaoLoginModule } from '@react-native-seoul/kakao-login';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Background = styled.ImageBackground`
  flex: 1;
  width: 100%;
  height: 100%;
`;
const Container = styled.View`
  flex: 1;
  background-color: transparent;
  align-items: center;
  justify-content: center;
`;
const Logo = styled.Image`
  width: 240px;
  height: 68px;
  margin-bottom: 40px;
`;
const Input = styled.TextInput`
  width: 306px;
  height: 45px;
  background-color: #ECECEC;
  border-radius: 31px;
  margin-bottom: 16px;
  padding: 0 20px;
  font-size: 16px;
`;
const Label = styled.Text`
  font-size: 12px;
  color: #000;
  margin-bottom: 4px;
  margin-left: 5px;
`;
const LoginButton = styled.TouchableOpacity`
  width: 306px;
  height: 56px;
  background-color: #FFEB3B;
  border-radius: 31px;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
`;
const LoginButtonText = styled.Text`
  font-size: 16px;
  color: #000;
  font-weight: bold;
`;
const SocialContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
`;
const SocialButton = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  margin: 0 12px;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  elevation: 2;
`;
const SocialIcon = styled.Image`
  width: 40px;
  height: 40px;
`;
const LinkContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: 16px;
`;
const LinkText = styled.Text`
  font-size: 10px;
  color: #000;
  margin: 0 8px;
`;

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await Keychain.getGenericPassword();
  if (token) {
    config.headers.Authorization = `Bearer ${token.password}`;
  }
  return config;
});

function Login1() {
  const navigation = useNavigation();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      console.log('BASE_URL:', BASE_URL);
      console.log('로그인 요청 시작');
      const response = await api.post('/api/auth/login', {
        email: id,
        password: password,
      });
      console.log('로그인 요청 성공', response);
      const { accessToken, refreshToken } = response.data;
      await Keychain.setGenericPassword('jwt', accessToken);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.response?.data || '아이디 또는 비밀번호를 확인하세요.');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const result = await kakaoLoginModule();
      const kakaoAccessToken = result.accessToken;
      const response = await api.post('/api/auth/kakao', { kakaoAccessToken });
      const jwt = response.data.token;
      await Keychain.setGenericPassword('jwt', jwt);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (e) {
      Alert.alert('카카오 로그인 실패', '카카오 로그인에 실패했습니다.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const googleAccessToken = (await GoogleSignin.getTokens()).accessToken;
      const response = await api.post('/api/auth/google', { googleAccessToken });
      const jwt = response.data.token;
      await Keychain.setGenericPassword('jwt', jwt);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch (e) {
      Alert.alert('구글 로그인 실패', '구글 로그인에 실패했습니다.');
    }
  };

  return (
    <Background source={require('../assets/images_login/Login_background.png')} resizeMode="cover">
      <Container>
        <Logo source={require('../assets/images/Logo.png')} />
        <Input
          placeholder="아이디를 입력하세요"
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
        />
        <Input
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <LoginButton onPress={handleLogin}>
          <LoginButtonText>로그인</LoginButtonText>
        </LoginButton>
        <SocialContainer>
          <SocialButton onPress={handleKakaoLogin}>
            <SocialIcon source={require('../assets/images_login/KakaoLogin.png')} />
          </SocialButton>
          <Text style={{marginHorizontal: 8, fontSize: 12}}>카카오톡으로 로그인</Text>
          <SocialButton onPress={handleGoogleLogin}>
            <SocialIcon source={require('../assets/images_login/GoogleLogin.png')} />
          </SocialButton>
          <Text style={{marginHorizontal: 8, fontSize: 12}}>Google 계정으로 로그인</Text>
        </SocialContainer>
        <LinkContainer>
          <TouchableOpacity onPress={() => {}}>
            <LinkText>{'> 회원가입'}</LinkText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <LinkText>{'> 아이디/비밀번호 찾기'}</LinkText>
          </TouchableOpacity>
        </LinkContainer>
      </Container>
    </Background>
  );
}

export default Login1; 