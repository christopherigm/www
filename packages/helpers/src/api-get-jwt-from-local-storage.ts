import { GetLocalStorageData } from '@repo/helpers/local-storage';
import type { JWTPayload } from '@repo/interfaces/jwt-interface';

const APIGetJWTFromLocalStorage = (): JWTPayload | null => {
  const jwt: JWTPayload = JSON.parse(GetLocalStorageData('jwt') || '{}');
  const access = jwt.access ? jwt : null;
  return access;
};

export default APIGetJWTFromLocalStorage;
