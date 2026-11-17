# P App — Legal Terms of Service & Privacy Policy Draft 📜

> **Notice**: This document serves as the official draft for the **Terms & Conditions** and **Privacy Policy** for **P App** (Architecture Licensure Examination Reviewer Mobile Application & Admin Portal), prepared in strict compliance with the **Philippine Data Privacy Act of 2012 (Republic Act No. 10173)**, its Implementing Rules and Regulations (IRR), and App Store / Google Play developer guidelines.

---

# Part 1: Privacy Policy (DPA 2012 Compliant)

**Effective Date:** [Insert Launch Date, e.g., November 2026]  
**Last Updated:** [Insert Date]  
**Personal Information Controller (PIC):** P App Development Team / [Registered Entity Name]  
**Contact / Data Protection Officer (DPO):** `privacy@thepapp.com` (or `support@thepapp.com`)

---

### 1. Introduction & General Statement
P App ("we", "us", or "our") respects your fundamental right to privacy and is committed to protecting the personal data of our users ("User", "Student", "Reviewee", or "you") in accordance with **Republic Act No. 10173 (The Data Privacy Act of 2012 or DPA)**, issued by the **National Privacy Commission (NPC)** of the Republic of the Philippines.

This Privacy Policy explains what information we collect, why we collect it, how it is processed and secured, how long it is stored, and your legal rights as a Data Subject.

---

### 2. Information We Collect
We collect only the minimum necessary information required to provide our architectural licensure examination review services, maintain your study progress, and manage subscriptions:

1. **Account & Identity Information**:
   - Name (First Name, Last Name)
   - Email address
   - Username and chosen display avatar/photo
   - Authentication credentials (passwords are cryptographically hashed; OAuth tokens via Google Sign-In)
2. **Academic & Performance Data**:
   - Examination and quiz scores, response history, time spent per subject
   - Flashcard review intervals, mastery levels, and study streaks
   - User-generated study notes and bookmarks
3. **Payment & Subscription Information (Critical Financial Data)**:
   - Subscription tier (e.g., Free, Pro Monthly, Pro Annual)
   - Subscription validity dates, transaction timestamps, and payment status
   - ⚠️ **Zero Card Storage Policy**: We **DO NOT** process, collect, or store full credit/debit card numbers, CVVs, or GCash/bank PINs on our servers. All financial transactions are processed securely through certified, PCI-DSS compliant third-party payment processors (e.g., PayMongo, Xendit, Stripe, or Apple/Google In-App Purchases).
4. **Technical & Device Information**:
   - Mobile device model, operating system version (iOS/Android)
   - Push notification tokens (Firebase Cloud Messaging - FCM)
   - Crash logs, error diagnostics, and offline synchronization timestamps

---

### 3. Purpose & Legal Basis of Processing
Under Section 12 and Section 13 of the DPA, we process your personal data under the lawful bases of **Contractual Necessity**, **Legitimate Interest**, and **Explicit Consent**:
* To authenticate you and grant access to review content, mock exams, and 3D architectural illustrations.
* To synchronize your local offline study data with the cloud once an internet connection is established.
* To compute personalized analytics, readiness scores, and recommendations for the ALE board exam.
* To manage pro subscriptions, feature access, and automated receipt generation.
* To deliver essential notifications (study reminders, exam countdowns, system announcements).

---

### 4. Storage, Security, and Data Retention
1. **Local-First On-Device Storage**:
   - Study materials, flashcards, and local answer attempts are stored securely on your device using `expo-sqlite`.
   - Sensitive auth tokens are encrypted using hardware-backed keychains (`expo-secure-store`).
2. **Cloud Infrastructure**:
   - Cloud data is hosted on Convex and encrypted in transit via Transport Layer Security (TLS 1.3) and at rest.
3. **Retention Period**:
   - We retain your personal data for as long as your account is active or as necessary to fulfill board review cycles.
   - If an account remains inactive for more than two (2) continuous years, or upon your explicit request for deletion, personal data will be anonymized or permanently purged from active databases.

---

### 5. Data Disclosure & Third-Party Sharing
We never sell, rent, or trade your personal information to third parties or marketing brokers. We disclose data solely to:
* **Cloud & Infrastructure Providers**: Convex (database/backend), Firebase (notifications), Resend (transactional email verification).
* **Payment Gateways**: PayMongo, Stripe, Google Play Billing, or Apple In-App Purchase solely for processing subscriptions.
* **Law Enforcement or Regulators**: When strictly mandated by a valid subpoena, court order, or Republic Act compliance.

---

### 6. Your Rights as a Data Subject (Under RA 10173)
Under the Philippine Data Privacy Act, you have the following enforceable rights:
1. **Right to be Informed**: You have the right to know whether personal data pertaining to you is being processed.
2. **Right to Access**: You may request a copy of the personal data we hold about you.
3. **Right to Rectification**: You have the right to correct any inaccurate or outdated information in your profile.
4. **Right to Erasure or Blocking (Account Deletion)**: You have the right to demand the deletion of your account and associated study data directly via the in-app **"Delete Account"** option in your Settings or by emailing `privacy@thepapp.com`.
5. **Right to Damages**: You have the right to be indemnified for any damages sustained due to inaccurate, incomplete, false, or unlawfully obtained personal data.
6. **Right to File a Complaint**: If your privacy rights are violated, you have the right to file a complaint before the **National Privacy Commission (NPC)** (`https://privacy.gov.ph`).

---

# Part 2: Terms and Conditions of Service

**Effective Date:** [Insert Launch Date, e.g., November 2026]

---

### 1. Acceptance of Terms
By downloading, creating an account, subscribing to, or using the P App mobile application or web admin portal, you agree to be legally bound by these Terms and Conditions. If you do not agree, please do not use the application.

### 2. Nature of the Service & Educational Disclaimer
* P App is an independent educational reviewer designed to aid candidates preparing for the **Architectural Licensure Examination (ALE)** in the Philippines.
* **PRC / BOA Disclaimer**: P App is **NOT** affiliated with, endorsed by, or an official representative of the **Professional Regulation Commission (PRC)** or the **Professional Regulatory Board of Architecture (PRBOA)**. 
* While our review questions, computations (e.g., NBCP Rule 7 & 8), and comprehensive notes are thoroughly researched and curated, P App **does not guarantee** that any user will pass the board examination. Licensure outcomes depend on individual diligence and examination day performance.

### 3. User Accounts & Security
* You must provide true, accurate, and current information upon registration.
* You are solely responsible for maintaining the confidentiality of your account credentials.
* Account sharing or simultaneous multi-device credential distribution is prohibited and may result in immediate suspension without refund.

### 4. Intellectual Property Rights
* All original study notes, question banks, computation drills, explanations, 3D interactive models, UI designs, and software code are the exclusive intellectual property of P App and its content contributors.
* You are granted a personal, non-exclusive, non-transferable, revocable license to access content for your individual study purposes.
* **Prohibited Acts**: You may NOT scrape, rip, screenshot for bulk distribution, resell, photocopy, decompile, or publicly broadcast any P App question banks or study materials. Violations will be prosecuted under the Intellectual Property Code of the Philippines (RA 8293).

### 5. Subscriptions, Payments & Cancellations
* **Pro Subscriptions**: Certain advanced mock exams, offline question caches, 3D models, and comprehensive notes may require an active Pro subscription.
* **Pricing & Renewals**: Subscription fees are displayed clearly before purchase in Philippine Peso (PHP) or local currency. Subscriptions purchased through Apple App Store or Google Play auto-renew unless canceled at least 24 hours before the end of the current billing cycle.
* **Refund Policy**: Purchases made through Apple App Store or Google Play are subject to Apple/Google refund policies. Subscriptions purchased via local payment gateways (GCash/Maya/Card) are non-refundable once content has been accessed, except as mandated by consumer protection laws.

### 6. Termination & Account Deletion
* You may terminate your account at any time via the in-app Settings menu.
* We reserve the right to suspend or terminate accounts that engage in exam leak sharing, reverse engineering, harassment in study rooms, or abuse of system APIs.

### 7. Governing Law & Dispute Resolution
These Terms are governed by and construed in accordance with the laws of the **Republic of the Philippines**. Any legal action arising from these Terms shall be instituted exclusively in the proper courts of Metro Manila, Philippines.
