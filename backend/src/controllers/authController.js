import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { getAuth } from '../config/firebase.js';
import { collectionRefs } from '../services/firestore.js';

async function upsertUserFromToken(idToken) {
  if (!idToken) {
    throw new AppError('idToken is required', 400);
  }

  const decoded = await getAuth().verifyIdToken(idToken);
  const profile = {
    uid: decoded.uid,
    email: decoded.email || '',
    name: decoded.name || decoded.email || 'User',
    photoURL: decoded.picture || '',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  await collectionRefs.users().doc(decoded.uid).set(profile, { merge: true });

  return { decoded, profile };
}

export const login = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { decoded, profile } = await upsertUserFromToken(idToken);

  res.json({
    message: 'Login successful',
    tokenPayload: decoded,
    user: profile
  });
});

export const register = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const { decoded, profile } = await upsertUserFromToken(idToken);

  res.status(201).json({
    message: 'Registration successful',
    tokenPayload: decoded,
    user: profile
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await collectionRefs.users().doc(req.user.uid).get();

  res.json({
    user: user.exists ? user.data() : {
      uid: req.user.uid,
      email: req.user.email || '',
      name: req.user.name || req.user.email || 'User'
    }
  });
});
