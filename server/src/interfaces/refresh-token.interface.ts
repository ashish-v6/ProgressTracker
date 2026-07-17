import { Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
  revoked: boolean;
  replacedByToken?: string | null;
  createdAt: Date;
  isExpired: boolean;
  isActive: boolean;
}
