/**
 * urlAnalysisService.js
 * ---------------------------------------------------------------------
 * Safe, local URL structure analysis. This service NEVER visits the
 * submitted URL from the backend — it only parses the string itself,
 * plus optionally queries configured threat-intel APIs (VirusTotal /
 * Google Safe Browsing) if keys are present in .env.
 * ---------------------------------------------------------------------
 */

const fetch = require('node-fetch');

const VT_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const GSB_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY || '';

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly'];
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.click', '.zip', '.gq', '.tk', '.ml'];
const COMMON_BRANDS = ['paypal', 'apple', 'microsoft', 'amazon', 'google', 'facebook', 'netflix', 'bankofamerica', 'chase', 'irs'];

function analyzeUrlStructure(rawUrl) {
  const threats = [];
  let score = 0;
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      riskScore: 60,
      riskLevel: 'MEDIUM',
      classification: 'Suspicious',
      reasons: ['URL is malformed and could not be parsed safely.'],
      recommendations: ['Do not visit this link. Double-check the source that shared it.'],
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (parsed.protocol !== 'https:') {
    score += 20;
    threats.push('Does not use HTTPS (unencrypted connection).');
  }

  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    score += 30;
    threats.push('Uses a raw IP address instead of a domain name.');
  }

  if (SHORTENERS.some((s) => hostname.includes(s))) {
    score += 15;
    threats.push('Uses a URL shortener, which hides the real destination.');
  }

  if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
    score += 15;
    threats.push('Uses a top-level domain commonly associated with abuse.');
  }

  if ((rawUrl.match(/-/g) || []).length >= 3) {
    score += 10;
    threats.push('Domain contains an unusually high number of hyphens.');
  }

  if (hostname.split('.').length > 4) {
    score += 10;
    threats.push('Unusually long/nested subdomain structure.');
  }

  const lookalike = COMMON_BRANDS.find(
    (brand) => hostname.includes(brand) && !hostname.endsWith(`${brand}.com`) && !hostname.startsWith(`${brand}.`)
  );
  if (lookalike) {
    score += 25;
    threats.push(`Domain references "${lookalike}" but is not that brand's official domain (possible lookalike).`);
  }

  if (/xn--/.test(hostname)) {
    score += 20;
    threats.push('Domain uses punycode encoding, sometimes used to spoof lookalike characters.');
  }

  if (parsed.username || parsed.password) {
    score += 20;
    threats.push('URL embeds credentials in the address, a common obfuscation trick.');
  }

  score = Math.max(0, Math.min(100, score));
  let classification = 'Safe';
  if (score >= 60) classification = 'Dangerous';
  else if (score >= 25) classification = 'Suspicious';

  const riskLevel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : score >= 15 ? 'LOW' : 'SAFE';

  return {
    riskScore: score,
    riskLevel,
    classification,
    reasons: threats.length ? threats : ['No structural red flags detected in the URL itself.'],
    recommendations: score >= 60
      ? ['Do not visit this link.', 'Do not enter any credentials if you already opened it.', 'Report the link to your IT/security team.']
      : score >= 25
      ? ['Proceed with caution — verify the destination independently before entering any information.']
      : ['No major red flags found, but always verify unexpected links before entering sensitive info.'],
  };
}

async function checkVirusTotal(rawUrl) {
  if (!VT_KEY) return null;
  try {
    const urlId = Buffer.from(rawUrl).toString('base64url');
    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': VT_KEY },
      timeout: 10000,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats;
    if (!stats) return null;
    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
    };
  } catch (err) {
    console.warn('[urlAnalysisService] VirusTotal check failed:', err.message);
    return null;
  }
}

async function checkGoogleSafeBrowsing(rawUrl) {
  if (!GSB_KEY) return null;
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GSB_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { clientId: 'cybersecurity-platform', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: rawUrl }],
        },
      }),
      timeout: 10000,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { matches: data.matches || [] };
  } catch (err) {
    console.warn('[urlAnalysisService] Safe Browsing check failed:', err.message);
    return null;
  }
}

async function scanUrl(rawUrl) {
  const structural = analyzeUrlStructure(rawUrl);
  const [vt, gsb] = await Promise.all([checkVirusTotal(rawUrl), checkGoogleSafeBrowsing(rawUrl)]);

  let score = structural.riskScore;
  const reasons = [...structural.reasons];
  let intelUsed = false;

  if (vt) {
    intelUsed = true;
    if (vt.malicious > 0) {
      score = Math.max(score, 90);
      reasons.push(`VirusTotal: flagged malicious by ${vt.malicious} security vendor(s).`);
    } else if (vt.suspicious > 0) {
      score = Math.max(score, 60);
      reasons.push(`VirusTotal: flagged suspicious by ${vt.suspicious} security vendor(s).`);
    }
  }
  if (gsb && gsb.matches.length) {
    intelUsed = true;
    score = Math.max(score, 95);
    reasons.push('Google Safe Browsing: this URL is on a known threat list.');
  }

  score = Math.max(0, Math.min(100, score));
  const riskLevel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 35 ? 'MEDIUM' : score >= 15 ? 'LOW' : 'SAFE';
  const classification = score >= 60 ? 'Dangerous' : score >= 25 ? 'Suspicious' : 'Safe';

  return {
    riskScore: score,
    riskLevel,
    classification,
    reasons,
    recommendations: structural.recommendations,
    threatIntelUsed: intelUsed,
  };
}

module.exports = { scanUrl, analyzeUrlStructure };
