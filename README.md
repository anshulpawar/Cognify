# Cognify AI — Neural Learning Platform

Cognify AI is a premium, adaptive cognitive learning platform tailored specifically for individuals with learning disabilities (like Dyslexia, ADHD, and Autism). Built entirely via autonomous AI agents, it features a gamified learning model designed for stress-free education.

## Technical Archictecture
This repo uses raw, performant frontend technologies (HTML5 Canvas, CSS Variables, Modular Vanilla JS) paired with a lightweight Express.js backend for server-side persistence and secure AI endpointing.
- **Frontend**: Custom DOM rendering, CSS Glassmorphism, Web Speech API (Dictation & TTS), interactive vector-driven components.
- **Backend / Proxy**: Node.js/Express (`server/index.js`), using Multer for file streaming and PDF/DOCX parsers for AI summaries.
- **Persistence**: Activity events are dispatched securely to `server/routes/progress.js` saving to `progress.json`.

## Features
- **Neural Home Page**: Dynamic hero and Canvas-driven neural network simulation.
- **Cognify AI Helper**:
  - Seamlessly interact with documents, images, text, and voice.
  - Generates perfectly structured, simple explanatory blocks utilizing Anthropic / Gemini logic systems.
- **Skills System**: Adaptive skill tracking modules encompassing Puzzles, Vedic Math (Reasoning), Word Recall, and Visual Matching.
- **Parental Dashboard**: Secure, real-time analytics providing day streaks, cumulative XP / stars tracking, and real activity chronologies from the user's lessons.

## Running Locally
1. `npm install`
2. Make sure `.env` is populated with keys if necessary.
3. `npm run dev` or `node server/index.js`
4. Serve the HTML directly or host the directory!
