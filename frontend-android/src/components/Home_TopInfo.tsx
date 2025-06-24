import React from 'react';
import styled from '@emotion/native';

const MainContainer = styled.View`
    width: 85%;
    height: 19%;
    display: flex;
    margin-top: 15px;
`;
const MainBackground = styled.ImageBackground`
    width: 100%;
    height: 95%;
    flex-direction: column;
    align-items: center;
`;
const TopInfoContainer = styled.View`
    flex-direction: row;
`;
const NameText = styled.Text`
    font-size: 16px;
    margin-left: 10px;
`;
const NameTextContainer = styled.View`
    flex-direction: column;
    width: 30%;
    height: 100%;
    margin-right: 16px;
`;
const DateText = styled.Text`
    font-size: 12px;
    font-weight: bold;
    margin-left: auto;
    margin-right: 58px;
    margin-top: 18px;
`;
const TripDateText = styled.Text`
    font-size: 12px;
    font-weight: bold;
    margin-top: 16px;
    margin-left: 24px;
`;
const SearchDiv = styled.TextInput`
    flex-direction: row;
    width: 90%;
    height: 24%;
    background-color: #ffffff;
    border-radius: 12px;
    margin-top: 6%;
    font-size: 10px;
    padding-left: 14px;
`;


function Home_TopInfo() {
    return (
        <MainContainer>
            <MainBackground source={require('../assets/images_home/home_topInfo.png')} resizeMode='contain'>
                <TopInfoContainer>
                    <NameTextContainer>
                        <NameText style={{ fontSize: 8, marginTop: 2 }}>내국인 여행 메이트, </NameText>
                        <NameText style={{ fontWeight: 'bold' }}>옹비님 </NameText>
                    </NameTextContainer>
                    <DateText>오늘은 2025년 06월 14일 입니다!</DateText>
                </TopInfoContainer>
                <TripDateText>아직 ON : NA랑 여행을 떠나지 않았어요!</TripDateText>
                <SearchDiv placeholder='어디로 떠나고 싶으신가요?'>
                </SearchDiv>
            </MainBackground>
        </MainContainer>
    );
}

export default Home_TopInfo;
