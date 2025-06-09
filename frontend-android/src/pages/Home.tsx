import React, { useState } from 'react';
import styled from '@emotion/native';
import { Text } from 'react-native';
import NavBar from '../components/NavBar';

const NavContainer = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
`;

const MainContainer = styled.View`
    width: 100%;
    height: 100%;
    background-color: white;
`

const UserInfoContainer = styled.View`
    width: 100%;
    height: 100px;
    background-color: blue;
    border-radius: 10px;

`
function Home() {
    return (            
        <MainContainer>
            <NavContainer>
                <NavBar />
            </NavContainer>
        </MainContainer>
    );
}

export default Home;
