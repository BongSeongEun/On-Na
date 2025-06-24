import React from 'react';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';

const ImageBackground = styled.ImageBackground`
    object-fit: contain;
    height: 100%;
`

function Hamburger() {
    const navigation = useNavigation();

    return (
        <ImageBackground source={require('../assets/images_hamburger/hamburger_background.png')}>
            <Text>Hamburger</Text>
        </ImageBackground>
    )
}

export default Hamburger;