import * as React from 'react';
import { View, Text, TextInput, Button, Image } from 'react-native';
import { styled } from 'styled-components/native';

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
function Login() {
    return (
        <LogoContainer>
            <Logo source={require('../assets/images/Logo.png')} />
            <LoginButtonContainer>
                <KakaoLoginButton>
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