-- =====================================================================
-- Sample data: cybersecurity articles + quiz questions
-- NOTE: The admin account and demo user account are created by the
-- Node seed script (backend/utils/seedAdmin.js) so passwords are
-- hashed with bcrypt rather than pasted as a raw hash here.
-- Run:  npm run seed   (from /backend)
-- =====================================================================

USE cybersecurity_platform;

-- ---------------------------------------------------------------------
-- ARTICLES
-- ---------------------------------------------------------------------
INSERT INTO cybersecurity_articles
  (category, title, description, threat_explanation, warning_signs, prevention_tips, what_to_do)
VALUES
('Phishing',
 'Recognizing Phishing Emails',
 'Learn how attackers impersonate trusted brands to steal your credentials.',
 'Phishing emails impersonate legitimate organizations (banks, employers, delivery services) to trick you into revealing passwords, OTPs, or financial details. Attackers rely on urgency and fear to bypass careful thinking.',
 JSON_ARRAY('Urgent or threatening subject lines', 'Mismatched sender domain', 'Generic greeting ("Dear Customer")', 'Requests for passwords or OTPs', 'Suspicious links that don\'t match the claimed sender'),
 JSON_ARRAY('Hover over links before clicking', 'Verify sender domain carefully', 'Never share OTPs or passwords by email', 'Enable multi-factor authentication', 'Report suspicious emails to IT/security'),
 'Do not click any links or download attachments. Report the email, then delete it. If you already entered credentials, change your password immediately and enable MFA.'),

('Password Security',
 'Building Passwords Attackers Can\'t Guess',
 'Weak passwords remain one of the top causes of account takeover.',
 'Short, common, or reused passwords are easily cracked using brute-force or credential-stuffing attacks, especially when the same password is reused across multiple sites.',
 JSON_ARRAY('Password under 12 characters', 'Reused across multiple sites', 'Contains personal info (name, birthday)', 'No numbers, symbols, or mixed case', 'Common dictionary words'),
 JSON_ARRAY('Use a unique password per account', 'Use a password manager', 'Enable MFA everywhere possible', 'Use passphrases of 4+ random words', 'Change passwords after any breach notice'),
 'If you suspect a password was exposed, change it immediately on that site and everywhere else you reused it, then enable MFA.'),

('Social Engineering',
 'Spotting Manipulation Tactics',
 'Attackers exploit trust, urgency, and authority rather than technical flaws.',
 'Social engineering attacks manipulate human psychology — impersonating authority figures, creating false urgency, or building fake rapport — to get victims to bypass normal security practices.',
 JSON_ARRAY('Unsolicited contact creating urgency', 'Requests to bypass normal procedure', 'Impersonation of IT/HR/executives', 'Pressure to act before "verifying"', 'Requests for secrecy'),
 JSON_ARRAY('Verify requests through a separate channel', 'Slow down under pressure — real emergencies allow verification', 'Never bypass security procedures for anyone', 'Educate coworkers/family about common scripts'),
 'Do not comply immediately. Verify the requester\'s identity independently, then report the attempt to your security team.'),

('Malware',
 'Understanding Malware Basics',
 'Malicious software can steal data, spy on activity, or hold files hostage.',
 'Malware includes viruses, spyware, trojans, and worms that infect devices through malicious downloads, email attachments, or compromised websites.',
 JSON_ARRAY('Unexpected pop-ups or slowdowns', 'Unfamiliar programs/processes running', 'Files you didn\'t create', 'Browser homepage changed without consent', 'Antivirus disabled unexpectedly'),
 JSON_ARRAY('Keep OS and apps updated', 'Use reputable antivirus software', 'Avoid downloading from untrusted sources', 'Don\'t open unexpected attachments', 'Back up data regularly'),
 'Disconnect from the network, run a full antivirus scan, and restore from backup if needed. Change passwords from a clean device afterward.'),

('Ransomware',
 'Ransomware: Prevention and Response',
 'Ransomware encrypts your files and demands payment for the decryption key.',
 'Ransomware typically spreads via phishing attachments or unpatched vulnerabilities, encrypting files and demanding cryptocurrency payment, with no guarantee of recovery.',
 JSON_ARRAY('Files suddenly inaccessible or renamed', 'Ransom note appears on desktop', 'Unusual file extension changes', 'Sudden spike in disk activity'),
 JSON_ARRAY('Maintain offline/immutable backups', 'Patch systems promptly', 'Restrict admin privileges', 'Train staff to spot phishing attachments'),
 'Disconnect the affected device immediately. Do not pay the ransom. Report to authorities and restore from clean backups.'),

('Safe Browsing',
 'Browsing the Web Safely',
 'Not every website is what it appears to be.',
 'Malicious or compromised websites can host drive-by downloads, fake software updates, or phishing forms designed to look legitimate.',
 JSON_ARRAY('No HTTPS padlock on login pages', 'Excessive pop-ups or redirects', 'Urgent "your device is infected" warnings', 'Misspelled or lookalike domains'),
 JSON_ARRAY('Check for HTTPS before entering data', 'Use browser security extensions', 'Keep your browser updated', 'Avoid clicking fake "update" prompts'),
 'Close the tab immediately, run a malware scan if you downloaded anything, and avoid entering any credentials.'),

('Public Wi-Fi',
 'Staying Safe on Public Wi-Fi',
 'Open networks make it easy for attackers to intercept your traffic.',
 'On unsecured public Wi-Fi, attackers can perform man-in-the-middle attacks to intercept unencrypted traffic or set up fake "evil twin" hotspots.',
 JSON_ARRAY('Network has no password', 'Duplicate network names nearby', 'Login portal asking for unrelated personal info'),
 JSON_ARRAY('Use a VPN on public networks', 'Avoid logging into sensitive accounts on public Wi-Fi', 'Turn off auto-connect to open networks', 'Verify the network name with staff'),
 'Disconnect, switch to mobile data or a VPN, and change any passwords entered while on the network.'),

('Social Media Security',
 'Locking Down Your Social Accounts',
 'Social accounts are prime targets for impersonation and scams.',
 'Compromised social media accounts are used to scam friends/followers, spread malicious links, or harvest personal information for further attacks.',
 JSON_ARRAY('Login alerts from unfamiliar locations', 'Friends report strange messages "from you"', 'Unrecognized posts or messages sent'),
 JSON_ARRAY('Enable MFA on all social accounts', 'Review connected third-party apps regularly', 'Use a unique password per platform', 'Limit publicly visible personal info'),
 'Change your password immediately, revoke active sessions, and warn contacts not to click links from your account.'),

('Account Security',
 'Layered Account Protection',
 'A strong password alone is no longer enough.',
 'Attackers use credential stuffing and phishing at scale; a single layer of defense (password only) is increasingly insufficient.',
 JSON_ARRAY('No MFA enabled on sensitive accounts', 'Same password reused everywhere', 'Recovery email/phone out of date'),
 JSON_ARRAY('Enable MFA (preferably an authenticator app)', 'Keep recovery info current', 'Review account activity logs periodically', 'Use a password manager'),
 'Enable MFA today on your most sensitive accounts (email, banking) — it blocks the vast majority of automated takeover attempts.'),

('Email Security',
 'Hardening Your Email Account',
 'Your inbox is often the master key to your other accounts.',
 'Because password resets typically flow through email, a compromised inbox can cascade into full account takeover across many services.',
 JSON_ARRAY('Unrecognized "sent" emails', 'Missing security notification emails', 'Unfamiliar forwarding rules set up'),
 JSON_ARRAY('Enable MFA on your email account', 'Check forwarding/filter rules periodically', 'Use a strong, unique password for email', 'Be cautious with email-based password resets'),
 'Change your email password immediately, remove unfamiliar forwarding rules, and review recent account activity.'),

('Data Privacy',
 'Protecting Your Personal Data',
 'Oversharing online can fuel targeted attacks against you.',
 'Publicly available personal information (birthdate, pet names, employer) is often used to answer security questions or craft convincing social engineering attempts.',
 JSON_ARRAY('Public profiles showing full birthdate/location', 'Answering security-question info in public posts', 'Oversharing travel plans in real time'),
 JSON_ARRAY('Review privacy settings on social platforms', 'Avoid posting real-time location', 'Use fictitious answers for security questions where allowed', 'Limit data shared with third-party apps'),
 'Audit your public profiles, tighten privacy settings, and remove sensitive personal details where possible.'),

('Mobile Security',
 'Securing Your Smartphone',
 'Mobile devices carry as much sensitive data as your computer.',
 'Mobile malware, malicious apps, and unlocked devices expose emails, banking apps, and personal photos to theft or spying.',
 JSON_ARRAY('Apps requesting excessive permissions', 'Unexpected battery drain', 'Unfamiliar apps installed'),
 JSON_ARRAY('Only install apps from official stores', 'Review app permissions regularly', 'Keep the OS updated', 'Use a screen lock and biometric protection'),
 'Uninstall suspicious apps, run a mobile security scan, and change passwords for sensitive accounts accessed on the device.');

-- ---------------------------------------------------------------------
-- QUIZ QUESTIONS
-- ---------------------------------------------------------------------
INSERT INTO quiz_questions
  (category, question, option_a, option_b, option_c, option_d, correct_option, explanation)
VALUES
('Phishing', 'What is the most reliable way to verify a link in an email before clicking it?',
 'Click it quickly to see where it goes', 'Hover over it to preview the actual URL', 'Reply asking if it is safe', 'Ignore the sender name',
 'b', 'Hovering reveals the real destination URL without visiting the page.'),

('Passwords', 'Which of these passwords is strongest?',
 'password123', 'Correct-Horse-Battery-42!', '123456789', 'yourname2024',
 'b', 'Long passphrases with mixed characters resist brute-force attacks far better than short or common patterns.'),

('Social Engineering', 'A caller claims to be from IT and asks for your password to "fix an issue." What should you do?',
 'Give it since they said they are from IT', 'Verify through a separate, known channel before doing anything', 'Give a slightly wrong password', 'Hang up and ignore it entirely',
 'b', 'Legitimate IT staff never need your password. Always verify identity independently before acting.'),

('Malware', 'Which action is riskiest for malware infection?',
 'Downloading attachments only from known senders', 'Opening an unexpected .exe file from an unknown sender', 'Running antivirus scans weekly', 'Keeping your OS updated',
 'b', 'Unexpected executable attachments from unknown senders are a top malware delivery method.'),

('Safe Browsing', 'What does a padlock icon in the browser address bar indicate?',
 'The website is completely safe', 'The connection is encrypted (HTTPS)', 'The website is government-verified', 'The website has no ads',
 'b', 'HTTPS encrypts traffic in transit but does not guarantee the site itself is trustworthy.'),

('Online Scams', 'You receive a message saying you won a prize you never entered to win. This is likely:',
 'A legitimate reward', 'A giveaway scam designed to harvest info or payment', 'A system notification', 'A software update',
 'b', 'Unsolicited "you won" messages are a classic scam pattern used to harvest personal or payment info.'),

('Privacy', 'Which of these is safest to post publicly on social media?',
 'Your full birthdate and hometown', 'Real-time location while traveling', 'A general area you live in, without exact address', 'Your mother\'s maiden name',
 'c', 'Sharing broad, non-specific info reduces the risk of it being used for identity theft or security-question guessing.'),

('Phishing', 'An email claims your account will be suspended in 1 hour unless you "verify" your password. This is a sign of:',
 'A normal security update', 'Urgency tactics used in phishing', 'A software patch notice', 'A billing reminder',
 'b', 'Artificial urgency is a hallmark phishing tactic meant to prevent careful evaluation.'),

('Account Security', 'What is the biggest benefit of enabling multi-factor authentication (MFA)?',
 'It makes your password longer automatically', 'It blocks most automated account-takeover attempts even if your password leaks', 'It speeds up login', 'It removes the need for a password',
 'b', 'MFA adds a second proof of identity, stopping most attacks that rely on a stolen password alone.'),

('Public Wi-Fi', 'What is the safest way to access sensitive accounts on public Wi-Fi?',
 'Just log in normally', 'Use a VPN or switch to mobile data', 'Turn off your antivirus first', 'Use the same password everywhere',
 'b', 'A VPN encrypts your traffic, protecting it from interception on untrusted public networks.');
