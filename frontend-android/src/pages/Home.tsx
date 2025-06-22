import React, { useState } from 'react';
import styled from '@emotion/native';
import { Image, ScrollView } from 'react-native';
import NavBar from '../components/NavBar';
import Home_TopInfo from '../components/Home_TopInfo';
import { SafeAreaView } from 'react-native-safe-area-context';

const NavContainer = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
`;
const MainContainer = styled.View`
    width: 100%;
    height: 100%;
    background-color: white;
    align-items: center;
`
const TopContainer = styled.View`
    width: 100%;
    height: 100px;
    background-color: white;
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`
const Hamburger = styled.TouchableOpacity`
    width: 10px;
    height: 10px;
    margin-left: 35px;
`
const Category = styled.TouchableOpacity`
    width: 14%;
    height: 20px;
    margin-left: 12px;
    border: 2px solid grey;
    border-radius: 8px;
`
const CategoryContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
`
const EventContainer = styled.View`
    width: 100%;
    height: 140px;
    align-items: center;
    margin-top: 42px;
    flex-direction: column;
`
const EventText = styled.Text`
    font-size: 14px;
    color: black;
    margin-right: auto;
    margin-left: 30px;
    font-weight: bold;
`
const Mate = styled.TouchableOpacity`
    width: 18%;
    height: 100px;
    margin-left: 16px;
    border: 2px solid grey;
    border-radius: 22px;
`
const MateContainer = styled.View`
    flex-direction: row;
    margin-top: 16px;
`
const MateText = styled.Text`
    font-size: 14px;
    color: black;
    font-weight: bold;
    margin-right: auto;
`
const MateTextContainer = styled.View`
    flex-direction: column;
    margin-top: 30px;
    align-items: center;
`
const Place = styled.TouchableOpacity`
    width: 25%;
    height: 140px;
    margin-left: 16px;
    border: 2px solid grey;
    border-radius: 22px;
`
const PlaceContainer = styled.View`
    flex-direction: row;
    margin-top: 16px;
`
const PlaceText = styled.Text`
    font-size: 14px;
    color: black;
    font-weight: bold;
    margin-right: auto;
`
const PlaceTextContainer = styled.View`
    flex-direction: column;
    margin-top: 30px;
    align-items: center;
`
function Home() {
    return (            
        <SafeAreaView style={{flex: 1}}>
            <MainContainer>
                <TopContainer>
                    <Hamburger>
                        <Image style={{width: 35, objectFit: 'contain'}} source={require('../assets/images_home/hamburger.png')} />
                    </Hamburger>
                    <Image style={{width: 100, objectFit: 'contain', marginRight: 35, marginTop: 20}} source={require('../assets/images_home/logo_home.png')} />
                </TopContainer>
                <Home_TopInfo />
                <CategoryContainer>
                    <Category style={{ marginLeft: 0 }}></Category>
                    <Category></Category>
                    <Category></Category>
                    <Category></Category>
                    <Category></Category>
                </CategoryContainer>
                <EventContainer>
                    <EventText>이벤트</EventText>
                    <Image style={{width: 360, height: 100, objectFit: 'contain', marginTop: 10}} source={require('../assets/images_home/event.png')} />
                </EventContainer>
                <MateTextContainer>
                    <MateText>옹비님과 베스트 메이트가 될 것 같아요!</MateText>
                    <MateContainer>
                        <Mate style={{ marginLeft: 0 }}></Mate>
                        <Mate></Mate>
                        <Mate></Mate>
                        <Mate></Mate>
                    </MateContainer>
                </MateTextContainer>
                <PlaceTextContainer>
                    <PlaceText>6월의 베스트 플레이스</PlaceText>
                    <PlaceContainer>
                        <Place style={{ marginLeft: 0 }}></Place>
                        <Place></Place>
                        <Place></Place>
                    </PlaceContainer>
                </PlaceTextContainer>
            </MainContainer>
            <NavContainer style={{ marginBottom: 'auto' }}>
                <NavBar />
            </NavContainer>
        </SafeAreaView>
    );
}

export default Home;
