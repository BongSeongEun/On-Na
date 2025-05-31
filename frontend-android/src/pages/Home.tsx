import React, { useState } from 'react';
import styled from '@emotion/native';
import { Text } from 'react-native';

const Container = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

function Home() {
    return (
        <Container>
            <Text>Home</Text>
        </Container>
    );
}

export default Home;
