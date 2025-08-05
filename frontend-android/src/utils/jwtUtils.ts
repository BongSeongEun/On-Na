import * as Keychain from 'react-native-keychain';

export interface JWTPayload {
  sub?: string; // 사용자 ID
  userId?: number; // 사용자 ID (다른 형태)
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

/**
 * JWT 토큰을 디코드하는 함수
 * @param token JWT 토큰
 * @returns 디코드된 페이로드
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT 토큰의 두 번째 부분(페이로드) 추출
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT 디코드 실패:', error);
    return null;
  }
};

/**
 * 저장된 토큰에서 사용자 ID를 가져오는 함수
 * @returns 사용자 ID 또는 null
 */
export const getCurrentUserId = async (): Promise<number | null> => {
  try {
    const token = await Keychain.getGenericPassword();
    if (!token) {
      console.log('저장된 토큰이 없습니다.');
      return null;
    }

    const payload = decodeJWT(token.password);
    if (!payload) {
      console.log('토큰 디코드 실패');
      return null;
    }

    // 다양한 형태의 사용자 ID 필드 확인
    const userId = payload.sub || payload.userId;
    
    if (userId) {
      // 문자열인 경우 숫자로 변환
      const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      return isNaN(numericUserId) ? null : numericUserId;
    }

    console.log('토큰에서 사용자 ID를 찾을 수 없습니다.');
    return null;
  } catch (error) {
    console.error('사용자 ID 가져오기 실패:', error);
    return null;
  }
};

/**
 * 토큰이 유효한지 확인하는 함수
 * @returns 토큰 유효성 여부
 */
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const token = await Keychain.getGenericPassword();
    if (!token) {
      return false;
    }

    const payload = decodeJWT(token.password);
    if (!payload) {
      return false;
    }

    // 만료 시간 확인
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime < payload.exp;
    }

    return true;
  } catch (error) {
    console.error('토큰 유효성 확인 실패:', error);
    return false;
  }
};

/**
 * 저장된 토큰을 삭제하는 함수
 */
export const clearToken = async (): Promise<void> => {
  try {
    await Keychain.resetGenericPassword();
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
  }
}; 