import React from 'react';
import styled from '@emotion/native';

const MainContainer = styled.View`
    width: 85%;
    height: 19%;
    display: flex;
    flex-direction: column;
    margin-top: 15px;
`;
const MainBackground = styled.ImageBackground`
    width: 100%;
    height: 87%;
    object-fit: cover;
`;
const NameText = styled.Text`
    font-size: 20px;
    font-weight: bold;
`;


function Home_TopInfo() {
    return (
        <MainContainer>
            <MainBackground source={require('../assets/images_home/home_topInfo.png')}>
                <NameText>Home_TopInfo</NameText>
            </MainBackground>
        </MainContainer>
    );
}

export default Home_TopInfo;
