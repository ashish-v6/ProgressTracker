import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';
import { BaseRepository } from './base.repository';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, selectPassword = false): Promise<IUser | null> {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (selectPassword) {
      query.select('+password');
    }
    return query.exec();
  }
}

export const userRepository = new UserRepository();
export default userRepository;
