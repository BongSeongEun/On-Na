import React from 'react';
import styled from '@emotion/native';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, Image } from 'react-native';

const Bg = styled.ImageBackground`
  flex: 1;
  width: 100%;
  height: 100%;
`;
const Container = styled.View`
  flex: 1;
  justify-content: space-between;
  padding: 40px 24px 32px 24px;
`;
const ProfileSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;
const ProfileBox = styled.View`
  width: 60px;
  height: 60px;
  background-color: #D9D9D9;
  border-radius: 14px;
  margin-right: 16px;
`;
const ProfileText = styled.Text`
  font-size: 13px;
  color: #000;
  line-height: 20px;
`;
const MenuSection = styled.View`
  flex: 1;
  justify-content: flex-start;
`;
const MenuTitle = styled.Text`
  font-size: 10px;
  color: #000;
  margin-top: 16px;
  margin-bottom: 8px;
`;
const MenuItem = styled.Text`
  font-size: 13px;
  color: #000;
  margin-bottom: 12px;
`;
const BottomSection = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin-top: 24px;
`;
const LogoutText = styled.Text`
  font-size: 13px;
  color: #000;
  margin-right: 16px;
`;
const GearIcon = styled.Image`
  width: 24px;
  height: 24px;
`;

function Hamburger() {
  const navigation = useNavigation();
  return (
    <Bg source={require('../assets/images_hamburger/hamburger_background.png')} resizeMode="cover">
      <Container>
        <ProfileSection>
          <ProfileBox />
          <ProfileText>내국인 여행 메이트,{"\n"}옹비 님</ProfileText>
        </ProfileSection>
        <MenuSection>
          <MenuTitle>여행 온나!</MenuTitle>
          <MenuItem>내가 스크랩 한 장소 보기</MenuItem>
          <MenuItem>최근 본 장소 보기</MenuItem>
          <MenuItem>BEST 장소 보기</MenuItem>
          <MenuItem>다른 메이트가 생각하는 여행 보러가기</MenuItem>
          <MenuTitle>친구 만났나!</MenuTitle>
          <MenuItem>New 메이트 찾으러 가기</MenuItem>
          <MenuItem>인연을 맺은 메이트 보기</MenuItem>
        </MenuSection>
        <BottomSection>
          <LogoutText>LOGOUT</LogoutText>
          <GearIcon source={require('../assets/images_hamburger/setting.png')} />
        </BottomSection>
      </Container>
    </Bg>
  );
}

export default Hamburger;