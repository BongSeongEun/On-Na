import * as Keychain from 'react-native-keychain';
import { jwtDecode } from 'jwt-decode';

export async function getUserIdFromToken() {
  const tokenObj = await Keychain.getGenericPassword();
  if (!tokenObj) return null;
  const token = tokenObj.password;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.sub ? Number(decoded.sub) : null;
  } catch (e) {
    return null;
  }
}