import {randomBytes, scryptSync, timingSafeEqual} from 'node:crypto';

export function loginEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function validPassword(value) {
  return typeof value === 'string' && value.length >= 10 && value.length <= 128;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password, storedHash) {
  const [salt, digest] = (storedHash || '0000000000000000:' + '0'.repeat(128)).split(':');
  const matches = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, 'hex'));
  return Boolean(storedHash && matches);
}
