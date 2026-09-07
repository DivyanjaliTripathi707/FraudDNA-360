-- ====================================================
-- FraudDNA 360 - Database Schema
-- Database Name: frauddna360
-- Engine: InnoDB, Charset: utf8mb4
-- ====================================================

CREATE DATABASE IF NOT EXISTS frauddna360;
USE frauddna360;

-- Drop tables in reverse foreign key order if re-initializing
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS investigations;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS risk_scores;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS network_relationships;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS fraud_patterns;
DROP TABLE IF EXISTS atms;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'Investigator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Accounts Table
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(30) NOT NULL UNIQUE,
    holder_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(30) DEFAULT 'Savings',
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, SUSPICIOUS, BLOCKED, MULE_SUSPECT
    current_balance DECIMAL(15, 2) DEFAULT 0.00,
    risk_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Locations Table
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'Low', -- Low, Medium, High
    risk_score INT DEFAULT 20,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ATMs Table
CREATE TABLE atms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    atm_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    location_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Fraud Patterns Table
CREATE TABLE fraud_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'Medium', -- Low, Medium, High, Critical
    detection_rule TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(50) NOT NULL UNIQUE,
    source_account_id INT NOT NULL,
    target_account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(30) DEFAULT 'TRANSFER', -- TRANSFER, ATM_WITHDRAWAL, DEPOSIT
    status VARCHAR(20) DEFAULT 'COMPLETED',
    location_id INT,
    atm_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_suspicious TINYINT(1) DEFAULT 0,
    suspicious_reasons TEXT,
    FOREIGN KEY (source_account_id) REFERENCES accounts(id),
    FOREIGN KEY (target_account_id) REFERENCES accounts(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (atm_id) REFERENCES atms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Complaints Table
CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_ref VARCHAR(50) NOT NULL UNIQUE,
    victim_account_id INT NOT NULL,
    reported_amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',
    location_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (victim_account_id) REFERENCES accounts(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Network Relationships Table
CREATE TABLE network_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_account_id INT NOT NULL,
    target_account_id INT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL, -- DIRECT_TRANSFER, SHARED_IP, SHARED_PHONE, ATM_CLUSTER
    strength INT DEFAULT 1,
    shared_attribute VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_account_id) REFERENCES accounts(id),
    FOREIGN KEY (target_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Predictions Table
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_ref VARCHAR(50) NOT NULL UNIQUE,
    location_id INT NOT NULL,
    atm_cluster VARCHAR(100) NOT NULL,
    predicted_time_window VARCHAR(50) NOT NULL,
    confidence_score INT NOT NULL,
    contributing_factors TEXT,
    model_version VARCHAR(30) DEFAULT 'v1.0-prototype',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Risk Scores Table
CREATE TABLE risk_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(30) NOT NULL, -- ACCOUNT, LOCATION, ATM
    entity_id INT NOT NULL,
    old_score INT NOT NULL DEFAULT 0,
    new_score INT NOT NULL DEFAULT 0,
    risk_level VARCHAR(20) NOT NULL, -- Low, Medium, High
    confidence_score INT DEFAULT 85,
    contributing_reasons TEXT,
    recalculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Alerts Table
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_ref VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    priority VARCHAR(20) DEFAULT 'HIGH', -- LOW, MEDIUM, HIGH, CRITICAL
    risk_score INT NOT NULL,
    confidence INT NOT NULL,
    location_name VARCHAR(100),
    predicted_time VARCHAR(50),
    reasons TEXT,
    status VARCHAR(30) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Investigations Table
CREATE TABLE investigations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_ref VARCHAR(50) NOT NULL UNIQUE,
    alert_id INT,
    account_id INT,
    investigator_id INT,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, CLOSED
    priority VARCHAR(20) DEFAULT 'HIGH',
    lead_recommendation TEXT,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (investigator_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for optimal querying
CREATE INDEX idx_transactions_source ON transactions(source_account_id);
CREATE INDEX idx_transactions_target ON transactions(target_account_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_risk_scores_entity ON risk_scores(entity_type, entity_id);
CREATE INDEX idx_alerts_priority ON alerts(priority, status);
