import React from 'react';
import styled from '@emotion/native';
import NavBar from '../components/NavBar';
import { Text } from 'react-native';

const MainContainer = styled.View`
    width: 100%;
    height: 100%;
    background-color: white;
`
const NavContainer = styled.View`
    position: absolute;
    bottom: 0;
    width: 100%;
`;
function Map_main() {
    return (
        <MainContainer>
            <Text>Map_main</Text>
            <NavContainer>
                <NavBar />
            </NavContainer>
        </MainContainer>
    );
}

export default Map_main;