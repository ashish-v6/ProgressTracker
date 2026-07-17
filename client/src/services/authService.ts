import api, { setAccessToken } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

class AuthService {
  /**
   * Register a new user
   */
  public async register(username: string, email: string, password: string, avatar?: string): Promise<User> {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      avatar
    });
    return response.data.data;
  }

  /**
   * Log in user, store access token in memory
   */
  public async login(email: string, password: string): Promise<AuthResponseData> {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    
    const { user, accessToken } = response.data.data;
    
    // Save accessToken in memory
    setAccessToken(accessToken);
    
    return { user, accessToken };
  }

  /**
   * Log out from server and clear memory tokens
   */
  public async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear local memory even if endpoint request fails
      setAccessToken(null);
    }
  }

  /**
   * Fetch current authenticated user details
   */
  public async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  }
}

export const authService = new AuthService();
export default authService;
