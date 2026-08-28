// Local, client-side-only password strength analysis.
// IMPORTANT: this password is NEVER sent to the backend or any
// external API — analysis happens entirely in the browser.

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password1',
  'iloveyou', '111111', '123123', 'admin', 'letmein', 'welcome',
  'monkey', 'dragon', 'football', 'passw0rd', '12345678', 'qwerty123',
];

function hasSequential(str) {
  const lower = str.toLowerCase();
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop'];
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      if (lower.includes(seq.slice(i, i + 3))) return true;
    }
  }
  return false;
}

function hasRepeated(str) {
  return /(.)\1\1/.test(str);
}

export function analyzePassword(pw) {
  if (!pw) {
    return { score: 0, label: 'Very Weak', checks: {}, tips: ['Enter a password to see its strength.'] };
  }

  const checks = {
    length12: pw.length >= 12,
    length8: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
    notCommon: !COMMON_PASSWORDS.includes(pw.toLowerCase()),
    noRepeats: !hasRepeated(pw),
    noSequential: !hasSequential(pw),
  };

  let score = 0;
  if (checks.length8) score += 15;
  if (checks.length12) score += 15;
  if (checks.uppercase) score += 12;
  if (checks.lowercase) score += 12;
  if (checks.number) score += 12;
  if (checks.special) score += 14;
  if (checks.notCommon) score += 10;
  if (checks.noRepeats) score += 5;
  if (checks.noSequential) score += 5;

  score = Math.max(0, Math.min(100, score));

  let label = 'Very Weak';
  if (score >= 85) label = 'Very Strong';
  else if (score >= 65) label = 'Strong';
  else if (score >= 45) label = 'Moderate';
  else if (score >= 25) label = 'Weak';

  const tips = [];
  if (!checks.length12) tips.push('Use at least 12 characters for stronger protection.');
  if (!checks.uppercase) tips.push('Add uppercase letters.');
  if (!checks.lowercase) tips.push('Add lowercase letters.');
  if (!checks.number) tips.push('Add numbers.');
  if (!checks.special) tips.push('Add special characters (e.g. ! @ # $ %).');
  if (!checks.notCommon) tips.push('Avoid extremely common passwords.');
  if (!checks.noRepeats) tips.push('Avoid repeating the same character 3+ times in a row.');
  if (!checks.noSequential) tips.push('Avoid sequential patterns like "abc" or "123".');
  if (!tips.length) tips.push('Great job — this password meets all the basic strength checks.');

  return { score, label, checks, tips };
}
