const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Database / Supabase configuration
  databaseUrl: process.env.DATABASE_URL || '',
  pgHost: process.env.PGHOST || 'localhost',
  pgPort: parseInt(process.env.PGPORT || '5432', 10),
  pgUser: process.env.PGUSER || 'postgres',
  pgPassword: process.env.PGPASSWORD || 'postgres',
  pgDatabase: process.env.PGDATABASE || 'scriptify_db',
  pgSsl: process.env.PGSSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')),

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'scriptify_default_dev_jwt_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Email / Nodemailer configuration
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || '"Scriptify" <no-reply@scriptify.dev>',

  // Platform Economics
  initialCredits: parseInt(process.env.INITIAL_CREDITS || '100', 10),
  costPerScript: parseInt(process.env.COST_PER_SCRIPT || '1', 10),

  // CORS
  clientUrl: process.env.CLIENT_URL || '*'
};
