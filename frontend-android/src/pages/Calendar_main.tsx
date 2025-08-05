import React from 'react';
import styled from '@emotion/native';
import NavBar from '../components/NavBar';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
function Calendar_main() {
    return (
        <SafeAreaView style={{flex: 1}}>
            <MainContainer>
                <Text>Calendar_main</Text>
            </MainContainer>
            <NavContainer>
                <NavBar />
            </NavContainer>
        </SafeAreaView>
    );
}

export default Calendar_main;