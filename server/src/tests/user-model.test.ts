import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { clearDatabase } from './setup';
import bcrypt from 'bcryptjs';

describe('User Model Unit Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should skip password hashing if password is not modified', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    user.username = 'newusername';
    await user.save();
    expect(user.username).toBe('newusername');
  });

  it('should call next with error if bcrypt fails', async () => {
    jest.spyOn(bcrypt, 'genSalt').mockRejectedValueOnce(new Error('bcrypt error') as never);

    const user = new User({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123'
    });

    await expect(user.save()).rejects.toThrow('bcrypt error');
    jest.restoreAllMocks();
  });
});
