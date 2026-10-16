# Netlify Deployment Guide

This guide details how this project is configured for deployment on **Netlify** (Frontend + Express Serverless Functions).

---

## 1. Architecture Overview

- **Static Frontend**:
  - The static assets (`frontend/index.html`, `frontend/app.js`, `frontend/style.css`) are published directly by Netlify via `publish = "frontend"`.
  - All client routes fallback to `/index.html` via SPA rewrite rule in `netlify.toml`.
- **API Serverless Functions**:
  - All `/api/*` endpoints are rewritten to `/.netlify/functions/api/:splat` via `netlify.toml`.
  - Handled by `netlify/functions/api.ts`, which wraps the compiled Express app with `serverless-http`.
  - Binary handling is enabled for `.xlsx` spreadsheets (`/api/map-excel`).
- **Scheduled Automated Scans**:
  - Handled by `netlify/functions/scheduled-integrity-scan.ts` using `@netlify/functions` `schedule('0 6 * * *')`.
  - Runs automatically daily at 06:00 UTC (matching previous cron schedule).

---

## 2. Configuration Files Added / Modified

1. **`netlify.toml`**:
   - `publish = "frontend"`
   - `functions = "netlify/functions"`
   - `command = "npm run build"`
   - Redirects for `/api/*` (200 rewrite) and `/*` (SPA fallback).
   - Bundles `express`, `serverless-http`, and `xlsx` cleanly with `esbuild`.
   - Includes markdown prompts (`agents.md`, `skills.md`) and compiled backend files.
2. **`netlify/functions/api.ts`**:
   - Wraps the Express backend using `serverless-http`.
   - Automatically normalizes path prefixes (`/.netlify/functions/api` -> `/api`).
   - Supports binary MIME types for Excel file upload/download.
3. **`netlify/functions/scheduled-integrity-scan.ts`**:
   - Scheduled cron function that hits `/api/health/integrity-scan?sinceHours=24` with Bearer auth.
4. **`backend/src/app.ts` & `backend/src/core/generated_adapter_config.ts`**:
   - Added Netlify function prefix rewrite middleware.
   - Prevented `app.listen()` when running inside Netlify or AWS Lambda serverless execution environments.
   - Added Netlify environment check for serverless storage fallback (`/tmp`).
5. **Root `package.json`**:
   - Added `@netlify/functions` and `serverless-http`.
   - Configured unified build script: `"build": "npm --prefix backend install && npm --prefix backend run build"`.

---

## 3. How to Deploy to Netlify

### Option A: Via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Configure project for Netlify deployment"
   git push origin main
   ```
2. Log into [Netlify Dashboard](https://app.netlify.com/).
3. Click **"Add new site"** > **"Import an existing project"** > Choose **GitHub**.
4. Select your repository.
5. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
6. Click **Deploy Site**.

### Option B: Via Netlify CLI
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Log in and link site:
   ```bash
   netlify login
   netlify init
   ```
3. Deploy directly:
   ```bash
   netlify deploy --build --prod
   ```

---

## 4. Required Environment Variables

Configure these in Netlify under:
**Site configuration > Environment variables > Add environment variable**

### LLM Providers
- `GEMINI_API_KEY`: (Recommended) Google Gemini API Key
- `GROQ_API_KEY`: (Optional) Groq API Key
- `DEEPINFRA_API_KEY`: (Optional) DeepInfra API Key

### ServiceNow Instances (Multi-instance configuration)
- `SERVICENOW_INSTANCES`: e.g. `instance_001,instance_002`
- `SERVICENOW_INSTANCE_001_URL`: URL for instance 1 (e.g. `https://dev12345.service-now.com`)
- `SERVICENOW_INSTANCE_001_KEY`: API Key or basic auth credentials
- `SERVICENOW_INSTANCE_002_URL`: URL for instance 2
- `SERVICENOW_INSTANCE_002_KEY`: Credentials for instance 2

### Salesforce (Optional)
- `SALESFORCE_INSTANCE_URL`: e.g. `https://your-org.my.salesforce.com`
- `SALESFORCE_CLIENT_ID`: Connected App Client ID
- `SALESFORCE_CLIENT_SECRET`: Connected App Client Secret
- `SALESFORCE_USERNAME`: Salesforce Username
- `SALESFORCE_PASSWORD`: Salesforce Password + Security Token

### Cron & Health Scan
- `CRON_SECRET`: Secret token for authenticating scheduled integrity scans
