# 🛡️ FakeShield v2.0 - AI Fake News & Misinformation Detector

A complete, all-in-one web application for detecting fake news, misleading URLs, and manipulated images with **multi-language support** (English, Tamil, Hindi, Spanish, French, German) and **persistent local analysis history**.

---

## ✨ Features

- 📰 **Content / Text Analysis**: Scans articles, headlines, and claims using multi-factor linguistic signals, sensationalism heuristics, and claim structure.
- 🔗 **URL / Domain Verification**: Real-time domain reputation check against 100+ credible and suspicious media outlets, TLD risk score, and SSL integrity check.
- 🖼️ **Image & Screenshot Forensics**: Client-side canvas image forensics, metadata inspection, text-in-image OCR verification, and compression artifact detection.
- 🌍 **Full Multi-Language Support**: Complete interface & verdict translation for:
  - 🇬🇧 **English**
  - 🇮🇳 **தமிழ் (Tamil)**
  - 🇮🇳 **हिन्दी (Hindi)**
  - 🇪🇸 **Español (Spanish)**
  - 🇫🇷 **Français (French)**
  - 🇩🇪 **Deutsch (German)**
- 📜 **Interactive History & Dashboard**:
  - Saved persistently in your browser (`localStorage`).
  - Search by keyword or filter by type (Content / URL / Image) or verdict (Real / Fake / Suspicious).
  - Export history to JSON.
  - Delete individual records or clear all.
- 🎨 **Modern Dark Glassmorphic UI**: Animated confidence gauges, ambient lighting effects, glowing badges, and responsive mobile-first layout.

---

## 🚀 How to Run Locally

### Option 1: Double Click
Simply open [`index.html`](index.html) directly in any web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Server (Optional)
```bash
npx serve .
# Open http://localhost:3000
```

---

## ☁️ How to Deploy to Vercel (100% Free & Instant)

### Method A: Deploy via Vercel CLI
1. Open your terminal in this folder (`findit-backend`).
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the quick prompts (accept defaults). Your live link will be generated in 10 seconds!

### Method B: Deploy via GitHub & Vercel Dashboard
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Leave all build settings as default (Framework Preset: **Other**).
5. Click **"Deploy"**.

---

## 📁 Project Structure

```
├── index.html        # Complete Single-Page Web Application
├── styles.css        # Premium Glassmorphic Styling & Animations
├── app.js            # Detection Engine, Multi-Language Dictionaries & History
├── vercel.json       # Vercel Deployment Configuration
└── package.json      # Project Metadata & Scripts
```
