import React, { useState } from 'react';
import styled from '@emotion/native';
import { Image, Text } from 'react-native';
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
            <NavContainer>
                <NavBar />
                </NavContainer>
            </MainContainer>
        </SafeAreaView>
    );
}

export default Home;
