import styled from '@emotion/native';

const MapButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`
const MapButtonImage = styled.Image`
    width: 55%;
    height: 55%;
`

const CalendarButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`
const CalendarButtonImage = styled.Image`
    width: 55%;
    height: 59%;
`

const ImageBackground = styled.ImageBackground`
    width: 100%;
    position: fixed;
    bottom: 0;
    align-items: center;
    height: 105px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`
const NavBarContainer = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
    margin-top: 10px;
`
const ChatButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`
const ChatButtonImage = styled.Image`
    width: 55%;
    height: 55%;
`
const ProfileButton = styled.TouchableOpacity`
    width: 70px;
    height: 70px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
`   
const ProfileButtonImage = styled.Image`
    width: 55%;
    height: 55%;
`
const HomeButton = styled.TouchableOpacity`
    width: 90px;
    height: 90px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    margin-top: -80px;
    z-index: 1;
`
const HomeButtonImage = styled.Image`
    width: 70%;
    height: 90%;
`

function NavBar() {
    return (
        <ImageBackground source={require('../assets/navBar/plainNavBar.png')}>
            <NavBarContainer style={{paddingLeft: 13}}>
                <MapButton>
                    <MapButtonImage source={require('../assets/navBar/Map.png')} />
                </MapButton>
                <CalendarButton>
                    <CalendarButtonImage source={require('../assets/navBar/Calendar.png')} />
                </CalendarButton>
            </NavBarContainer>
            <HomeButton>
                <HomeButtonImage source={require('../assets/navBar/Home.png')} />
            </HomeButton>
            <NavBarContainer style={{paddingRight: 13}}>
                <ChatButton>
                    <ChatButtonImage source={require('../assets/navBar/Chat.png')} />
                </ChatButton>
                <ProfileButton>
                    <ProfileButtonImage source={require('../assets/navBar/Chat.png')} />
                </ProfileButton>
            </NavBarContainer>
        </ImageBackground>
    );
}

export default NavBar;