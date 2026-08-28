module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'insecure_dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB || 5),
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  RISK_LEVELS: ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
  ANALYSIS_TYPES: ['phishing_email', 'message', 'url', 'screenshot'],
};
