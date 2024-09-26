const crypto = require('crypto');

// 使用环境变量存储密钥，不要直接在代码中硬编码
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'your-secret-key-must-be-32-chars-long';
const ALGORITHM = 'aes-256-cbc';

// 确保密钥长度为32字节
function getKey(key) {
  return crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = getKey(SECRET_KEY);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = getKey(SECRET_KEY);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = { encrypt, decrypt };