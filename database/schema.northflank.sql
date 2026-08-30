-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- PASSWORD RESET TOKENS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_prt_token (token)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ANALYSES  (one row per scan of any type)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  analysis_type ENUM('phishing_email', 'message', 'url', 'screenshot') NOT NULL,
  input_summary VARCHAR(500) NULL,       -- short, non-sensitive preview of what was analyzed
  risk_score INT NOT NULL DEFAULT 0,     -- 0-100
  risk_level ENUM('SAFE','LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'SAFE',
  verdict VARCHAR(255) NULL,
  ai_mode ENUM('ai','fallback') NOT NULL DEFAULT 'fallback',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_analyses_user (user_id),
  INDEX idx_analyses_type (analysis_type),
  INDEX idx_analyses_created (created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ANALYSIS RESULTS  (full structured JSON payload for a given analysis)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id INT NOT NULL,
  indicators JSON NULL,          -- array of detected indicator strings
  explanation TEXT NULL,
  recommendations JSON NULL,     -- array of recommended action strings
  raw_result JSON NULL,          -- full structured AI/fallback response
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- UPLOADED FILES  (screenshots)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploaded_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  analysis_id INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- CYBERSECURITY ARTICLES (awareness content)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cybersecurity_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM(
    'Phishing','Password Security','Social Engineering','Malware',
    'Ransomware','Safe Browsing','Public Wi-Fi','Social Media Security',
    'Account Security','Email Security','Data Privacy','Mobile Security'
  ) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NOT NULL,
  threat_explanation TEXT NOT NULL,
  warning_signs JSON NOT NULL,       -- array of strings
  prevention_tips JSON NOT NULL,     -- array of strings
  what_to_do TEXT NOT NULL,
  created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_articles_category (category)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- QUIZ QUESTIONS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('a','b','c','d') NOT NULL,
  explanation TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- QUIZ ATTEMPTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  performance_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_quiz_attempts_user (user_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- QUIZ ANSWERS (per-question answer within an attempt)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option ENUM('a','b','c','d') NOT NULL,
  is_correct TINYINT(1) NOT NULL,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ADMIN LOGS (audit trail for admin actions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  target_type VARCHAR(100) NULL,
  target_id INT NULL,
  details VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_logs_admin (admin_id)
) ENGINE=InnoDB;