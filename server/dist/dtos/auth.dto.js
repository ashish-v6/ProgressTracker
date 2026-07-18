"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatUserResponse = void 0;
/**
 * Strips password hash and structural metadata from User models
 */
const formatUserResponse = (user) => {
    return {
        id: user._id ? user._id.toString() : user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
exports.formatUserResponse = formatUserResponse;
//# sourceMappingURL=auth.dto.js.map