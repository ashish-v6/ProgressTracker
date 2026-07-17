import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../interfaces/refresh-token.interface';

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    revoked: {
      type: Boolean,
      default: false
    },
    replacedByToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Virtual properties to check expiration and activity
RefreshTokenSchema.virtual('isExpired').get(function (this: IRefreshToken) {
  return new Date() >= this.expiresAt;
});

RefreshTokenSchema.virtual('isActive').get(function (this: IRefreshToken) {
  return !this.revoked && !this.isExpired;
});

RefreshTokenSchema.set('toJSON', { virtuals: true });
RefreshTokenSchema.set('toObject', { virtuals: true });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
