require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
app.use(cors()); // Allow all
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGemini(systemPrompt, userText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  });
  return result.response.text();
}

async function callGeminiWithImage(systemPrompt, userText, base64Image, mimeType) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: mimeType, data: base64Image } },
        { text: userText }
      ]
    }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
  });
  return result.response.text();
}

function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e1) {
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch (e2) {}
    return null;
  }
}

function parseExplainResponse(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let intro = '';
  let keyPoints = [];
  let funFact = '';

  for (const line of lines) {
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      keyPoints.push(line.replace(/^[•\-\*]\s+/, ''));
    } else if (line.toLowerCase().startsWith('fun fact:')) {
      funFact = line.replace(/^fun fact:\s*/i, '');
    } else if (!intro) {
      intro = line;
    }
  }

  if (!keyPoints.length) {
    const remaining = lines.filter(l => l !== intro && !l.toLowerCase().startsWith('fun fact:'));
    keyPoints = remaining.slice(0, 5);
  }
  if (!funFact && lines.length > 1) {
    funFact = lines[lines.length - 1];
  }

  return { explanation: intro || raw, keyPoints, funFact };
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
  }
});

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  }
});

function validateTopic(req, res) {
  const topic = req.body.topic || req.body.transcript;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    res.status(400).json({ error: 'A topic or question is required.' });
    return null;
  }
  if (topic.length > 500) {
    res.status(400).json({ error: 'Input must be under 500 characters.' });
    return null;
  }
  return topic.trim();
}

app.post('/api/explain', async (req, res) => {
  const topic = validateTopic(req, res);
  if (!topic) return;

  const systemPrompt = `You are a friendly AI tutor for students with cognitive disabilities. Explain the topic in very simple, clear, warm language. Structure your response exactly like this:
Line 1: One clear intro sentence with no bullet point and no label.
Lines 2 to 6: Between 3 and 5 key ideas. Each key idea must be on its own line and must start with exactly this: bullet symbol then a space (• ). Do not use dashes or asterisks.
Last line: A fun fact that starts with exactly this text: Fun fact: 
Use short sentences. Avoid jargon. Be encouraging and warm. Keep the total response under 200 words.`;

  try {
    const raw = await callGemini(systemPrompt, `Explain this topic: ${topic}`);
    const parsed = parseExplainResponse(raw);
    res.json(parsed);
  } catch (err) {
    console.error('[/api/explain]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/shorten', async (req, res) => {
  const topic = validateTopic(req, res);
  if (!topic) return;

  const systemPrompt = `You are a reading assistant for students with learning disabilities. Summarise the topic into exactly 3 short, simple sentences. Use the simplest words possible. Each sentence must stand alone and be easy to understand on its own. Return only the 3 sentences and nothing else. No bullet points. No labels. No extra text.`;

  try {
    const raw = await callGemini(systemPrompt, `Summarise this topic: ${topic}`);
    res.json({ summary: raw.trim() });
  } catch (err) {
    console.error('[/api/shorten]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/example', async (req, res) => {
  const topic = validateTopic(req, res);
  if (!topic) return;

  const systemPrompt = `You are a learning assistant for young students aged 10 to 16 who have learning disabilities. Give exactly 2 real-world, relatable examples that explain the topic. Each example MUST start with the words: For example, — then use everyday situations involving food, animals, sports, or familiar objects. Keep each example to a maximum of 2 sentences. Return only the 2 examples, one per line. No bullet points. No numbers. No extra text.`;

  try {
    const raw = await callGemini(systemPrompt, `Give examples for this topic: ${topic}`);
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.toLowerCase().includes('for example'));
    const examples = lines.slice(0, 2);
    if (!examples.length) {
      const fallback = raw.split('\n').filter(l => l.trim().length > 10).slice(0, 2);
      return res.json({ examples: fallback });
    }
    res.json({ examples });
  } catch (err) {
    console.error('[/api/example]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/quiz', async (req, res) => {
  const topic = validateTopic(req, res);
  if (!topic) return;
  const count = parseInt(req.body.questionCount) || 4;

  const systemPrompt = `Generate exactly ${count} multiple-choice quiz questions about the topic for students aged 10 to 16 with learning difficulties. You must return ONLY a valid JSON array. Do not include any markdown formatting. Do not use backticks. Do not write anything before or after the array. The array must start with [ and end with ]. Each object in the array must have exactly these 5 fields: question (a string), options (an array of exactly 4 strings), correct (a number from 0 to 3 representing the index of the correct option in the options array), emoji (a single relevant emoji as a string), funFact (a short encouraging sentence as a string). Example of the required format: [{"question":"What colour is the sky?","options":["Red","Blue","Green","Yellow"],"correct":1,"emoji":"☁️","funFact":"The sky looks blue because of how light scatters!"}]`;

  try {
    const raw = await callGemini(systemPrompt, `Topic: ${topic}`);
    const parsed = safeParseJSON(raw);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({ error: 'Could not generate quiz. Please try again.' });
    }
    res.json({ questions: parsed });
  } catch (err) {
    console.error('[/api/quiz]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/flashcard', async (req, res) => {
  const topic = validateTopic(req, res);
  if (!topic) return;

  const systemPrompt = `Generate exactly 5 flashcards about the topic. You must return ONLY a valid JSON array. Do not include any markdown formatting. Do not use backticks. Do not write anything before or after the array. The array must start with [ and end with ]. Each object in the array must have exactly these 4 fields: front (a simple question or key term as a string, maximum 8 words), back (a clear simple answer as a string, maximum 30 words), emoji (a single relevant emoji as a string), strength (a string that must be exactly one of these three values: easy, medium, or hard). Example of the required format: [{"front":"What is gravity?","back":"A force that pulls all objects toward each other and toward the ground.","emoji":"🌍","strength":"easy"}]`;

  try {
    const raw = await callGemini(systemPrompt, `Topic: ${topic}`);
    const parsed = safeParseJSON(raw);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({ error: 'Could not generate flashcards. Please try again.' });
    }
    res.json({ flashcards: parsed });
  } catch (err) {
    console.error('[/api/flashcard]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/voice-explain', async (req, res) => {
  const transcript = req.body.transcript;
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return res.status(400).json({ error: 'A voice transcript is required.' });
  }

  const systemPrompt = `You are a friendly AI tutor for students with cognitive disabilities. Explain the topic in very simple, clear, warm language. Structure your response exactly like this:
Line 1: One clear intro sentence with no bullet point and no label.
Lines 2 to 6: Between 3 and 5 key ideas. Each key idea must be on its own line and must start with exactly: • (bullet then space).
Last line: A fun fact that starts with exactly: Fun fact: 
Use short sentences. Avoid jargon. Keep total under 200 words.`;

  try {
    const raw = await callGemini(systemPrompt, `Explain this: ${transcript.trim()}`);
    const parsed = parseExplainResponse(raw);
    res.json(parsed);
  } catch (err) {
    console.error('[/api/voice-explain]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/image-explain', imageUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'An image file is required.' });
  }

  const userPrompt = (req.body.prompt && req.body.prompt.trim())
    ? req.body.prompt.trim()
    : 'Explain what you see in this image in simple terms for a student with cognitive disabilities.';

  const systemPrompt = `You are explaining an image to a student with a learning disability. Use simple, friendly, encouraging language. First describe clearly what you can see in the image. Then explain any text, labels, diagrams, or concepts that are visible. Use short sentences. Be warm, supportive, and easy to understand.`;

  try {
    const base64Image = req.file.buffer.toString('base64');
    const raw = await callGeminiWithImage(systemPrompt, userPrompt, base64Image, req.file.mimetype);
    res.json({ explanation: raw.trim() });
  } catch (err) {
    console.error('[/api/image-explain]', err.message);
    res.status(500).json({ error: 'Something went wrong processing the image. Please try again.' });
  }
});

app.post('/api/file-explain', fileUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'A PDF or DOCX file is required.' });
  }

  let extractedText = '';

  try {
    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = result.value;
    }
  } catch (err) {
    console.error('[/api/file-explain] File parsing error:', err.message);
    return res.status(500).json({ error: 'Could not read the file. Please try a different file.' });
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return res.status(400).json({ error: 'No text could be extracted from this file.' });
  }

  const truncated = extractedText.length > 3000 ? extractedText.slice(0, 3000) + '...' : extractedText;

  const systemPrompt = `You are an AI tutor for students with cognitive disabilities. The following text was extracted from an uploaded document. Explain it in extremely simple, clear, friendly language. Structure your response exactly like this:
Line 1: One clear intro sentence with no bullet point and no label.
Lines 2 to 6: Between 3 and 5 key ideas. Each key idea must be on its own line and must start with exactly: • (bullet then space).
Last line: A fun fact that starts with exactly: Fun fact: 
Keep total under 200 words.`;

  try {
    const raw = await callGemini(systemPrompt, `Document content:\n${truncated}`);
    const parsed = parseExplainResponse(raw);
    res.json({
      ...parsed,
      extractedTextPreview: extractedText.slice(0, 200)
    });
  } catch (err) {
    console.error('[/api/file-explain]', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cognify AI backend running on http://localhost:${PORT}`);
});
