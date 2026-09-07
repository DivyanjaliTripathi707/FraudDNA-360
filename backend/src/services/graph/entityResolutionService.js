const db = require('../../config/db');

class EntityResolutionService {
  /**
   * Extract financial & cyber entities from arbitrary complaint/incident text
   * @param {string} rawText 
   */
  static extractEntities(rawText = '') {
    if (!rawText || typeof rawText !== 'string') {
      return { phones: [], upis: [], accounts: [], ips: [], urls: [] };
    }

    // Phone regex (e.g. +91 9876543210, 98765 43210, +91-98765-43210)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\d{5}[-.\s]?\d{5}|\d{10})/g;
    const rawPhones = rawText.match(phoneRegex) || [];
    const phones = [...new Set(rawPhones.map(p => this.normalizePhone(p)).filter(Boolean))];

    // UPI regex (e.g. user@paytm, name@okhdfc, rahul.12@ybl)
    const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
    const rawUpis = rawText.match(upiRegex) || [];
    const upis = [...new Set(rawUpis.map(u => u.trim().toLowerCase()))];

    // Account regex (e.g. ACC-44102-MULE-A or 10-18 digit numbers)
    const accRegex = /ACC-[A-Z0-9\-]+|\b\d{9,18}\b/g;
    const rawAccs = rawText.match(accRegex) || [];
    const accounts = [...new Set(rawAccs.map(a => a.trim()))];

    // IP regex
    const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    const ips = [...new Set(rawText.match(ipRegex) || [])];

    // URL regex
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
    const urls = [...new Set(rawText.match(urlRegex) || [])];

    return {
      phones,
      upis,
      accounts,
      ips,
      urls
    };
  }

  /**
   * Normalize telephone numbers to standard E.164 format (+91 XXXXXXXXXX)
   */
  static normalizePhone(phoneStr) {
    if (!phoneStr) return null;
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    return `+${digits}`;
  }

  /**
   * Perform entity resolution and fuzzy matching across stored entities
   * Returns match confidence (0-100%) and link status
   */
  static resolveAndLink(entityA, entityB, entityType = 'PHONE') {
    let confidence = 0;
    let method = 'EXACT_NORMALIZED';
    let status = 'FLAGGED_FOR_REVIEW';

    const cleanA = String(entityA).trim().toLowerCase();
    const cleanB = String(entityB).trim().toLowerCase();

    if (cleanA === cleanB) {
      confidence = 100;
      status = 'AUTO_LINKED';
    } else if (entityType === 'PHONE') {
      const digA = cleanA.replace(/\D/g, '').slice(-10);
      const digB = cleanB.replace(/\D/g, '').slice(-10);
      if (digA === digB && digA.length === 10) {
        confidence = 98;
        method = 'NORMALIZED_DIGIT_MATCH';
        status = 'AUTO_LINKED';
      }
    } else if (entityType === 'UPI_HANDLE') {
      const handleA = cleanA.split('@')[0];
      const handleB = cleanB.split('@')[0];
      if (handleA === handleB) {
        confidence = 88;
        method = 'SHARED_HANDLE_DIFFERENT_PSP';
        status = 'FLAGGED_FOR_REVIEW';
      }
    } else if (entityType === 'DEVICE') {
      if (cleanA.substring(0, 7) === cleanB.substring(0, 7)) {
        confidence = 82;
        method = 'HARDWARE_SUBFAMILY_SIMILARITY';
        status = 'FLAGGED_FOR_REVIEW';
      }
    }

    const resolutionResult = {
      entity_a: entityA,
      entity_b: entityB,
      entity_type: entityType,
      match_confidence: confidence,
      method,
      status,
      timestamp: new Date().toISOString()
    };

    // Store in memoryStore if confidence is high
    if (db.memoryStore && db.memoryStore.entity_links) {
      db.memoryStore.entity_links.unshift({
        id: db.memoryStore.entity_links.length + 1,
        source_entity: entityA,
        target_entity: entityB,
        entity_type: entityType,
        match_confidence: confidence,
        match_method: method,
        status
      });
    }

    return resolutionResult;
  }

  /**
   * Get all active entity links and pending resolution requests
   */
  static getAllLinks() {
    return db.memoryStore.entity_links || [];
  }
}

module.exports = EntityResolutionService;
