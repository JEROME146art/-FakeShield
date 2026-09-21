# 🛡️ FakeShield - Deployment & Setup Guide

**FakeShield** is a multi-modal AI detector for **News Content (Text)**, **URLs**, and **Images**.

---

## ⚡ Option 1: Deploy to Vercel (Fastest & 100% Free)

You can deploy the **FakeShield Web App & Serverless API** to Vercel in under 2 minutes.

### Method A: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from this folder**:
   ```bash
   cd FakeShield-Vercel
   vercel
   ```

3. Follow the CLI prompts:
   - `Set up and deploy?` ➜ **Y**
   - `Which scope?` ➜ Choose your Vercel account
   - `Link to existing project?` ➜ **N**
   - `Project name?` ➜ **fakeshield**
   - `In which directory is your code located?` ➜ **./**
   - `Want to modify settings?` ➜ **N**

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

Your app will be live at `https://fakeshield-yourname.vercel.app`! 🎉

---

### Method B: Deploy via GitHub + Vercel Dashboard

1. Push your project or the `FakeShield-Vercel` directory to a GitHub repository.
2. Go to [https://vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** ➜ **"Project"**.
4. Import your GitHub repository.
5. In **Root Directory**, select `FakeShield-Vercel` (or root).
6. Click **Deploy**.

---

## 💻 Option 2: Run FakeShield Locally

### 1. Run Spring Boot Backend
From the `FakeShield` directory:
```bash
cd FakeShield
.\mvnw.cmd spring-boot:run
```
> Server runs on **`http://localhost:8090`**

### 2. Access Web App
Open your browser at:
```
http://localhost:8090/
```

### 3. Load Chrome Extension in Browser
1. Open Google Chrome (or Brave / Edge).
2. Navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** (toggle in the top-right corner).
4. Click **"Load unpacked"**.
5. Select the folder:
   `c:\Users\jerom\Downloads\Projects\findit-backend\FakeShield-Extension`
6. Pin the **FakeShield 🛡️** icon to your browser toolbar!

---

## 🧩 Chrome Extension Features

- 📝 **Content Analysis**: Paste headlines or WhatsApp forwards with instant verification presets.
- 🔗 **URL Analysis**: Analyze any website article or click **"📌 Current Tab"** to auto-fill.
- 🖼️ **Image Analysis**: Drag-and-drop screenshots or memes to run OCR text extraction & metadata checks.
- ⚙️ **Configurable Endpoint**: Click ⚙️ in the extension header to toggle between Local (`http://localhost:8090`), Vercel, or custom backend.
