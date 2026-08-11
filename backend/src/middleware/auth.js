import { getAuth } from '../config/firebase.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new AppError('Not authorized. Missing token.', 401);
  }

  const decoded = await getAuth().verifyIdToken(token);
  req.user = decoded;
  next();
});
