/* ═══════ NEURAL CANVAS ═══════ */
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let nodes = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas(); window.addEventListener('resize', resizeCanvas);
for (let i = 0; i < 60; i++) {
  nodes.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 2 + 1 });
}
function drawNeural() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodes.forEach(n => {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,212,255,0.5)'; ctx.fill();
  });
  nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 140) {
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - d / 140)})`; ctx.lineWidth = 0.6; ctx.stroke();
    }
  }));
  requestAnimationFrame(drawNeural);
}
drawNeural();

/* ═══════ CURSOR ═══════ */
const cur = document.getElementById('cursor');
const curR = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cur.style.left = mx - 6 + 'px'; cur.style.top = my - 6 + 'px'; });
(function animRing() { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; curR.style.left = rx - 18 + 'px'; curR.style.top = ry - 18 + 'px'; requestAnimationFrame(animRing); })();
document.querySelectorAll('button,a,.skill-card,.fc-wrap,.big-fc').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.transform = 'scale(1.8)'; curR.style.transform = 'scale(1.4)'; curR.style.borderColor = 'rgba(0,212,255,0.8)'; });
  el.addEventListener('mouseleave', () => { cur.style.transform = ''; curR.style.transform = ''; curR.style.borderColor = ''; });
});

/* ═══════ NAVIGATION ═══════ */
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  window.scrollTo(0, 0);
}

/* ═══════ LOGIN ═══════ */
function doLogin() {
  const n = document.getElementById('nameInput').value.trim();
  if (!n) { showToast('Please enter your name 😊'); return; }
  loginOk(n);
}
function doGuest() { loginOk('Explorer'); }
function loginOk(name) {
  document.getElementById('loginCard').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('dashName').textContent = name.split(' ')[0];
  localStorage.setItem('cogniName', name);
  showToast('Welcome, ' + name.split(' ')[0] + '! 🌟');
}
window.onload = () => {
  const s = localStorage.getItem('cogniName');
  if (s) { document.getElementById('loginCard').style.display = 'none'; document.getElementById('mainContent').style.display = 'block'; document.getElementById('dashName').textContent = s.split(' ')[0]; }
  buildWeekChart(); buildPatGrid(); loadWRWords(); loadQuizQ(); loadBigCard();
  const quotes = ["Every expert was once a beginner. Keep going!", "You are braver than you believe!", "Small steps every day lead to big changes!", "Your brain grows stronger every practice session!", "Learning is not a race. Go at your own speed. 💜"];
  document.getElementById('dashQuote').textContent = '"' + quotes[Math.floor(Math.random() * quotes.length)] + '"';
};

/* ═══════ TTS ═══════ */
function speakText(t) {
  if (!t) return;
  const u = new SpeechSynthesisUtterance(t);
  u.rate = 0.9; u.pitch = 1.1;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
  showToast('🔊 Reading aloud...');
}

/* ═══════ FONT ═══════ */
let dyslexOn = false;
function toggleFont() {
  dyslexOn = !dyslexOn;
  document.body.style.fontFamily = dyslexOn ? "'OpenDyslexic',sans-serif" : "'DM Sans',sans-serif";
  showToast(dyslexOn ? 'Dyslexic font on 🔡' : 'Default font on');
}

/* ═══════ TOAST ═══════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

/* ═══════ AI MODE ═══════ */
let mode = 'text';
function setMode(m) {
  mode = m;
  ['text', 'voice', 'image', 'file'].forEach(x => {
    const cap = x.charAt(0).toUpperCase() + x.slice(1);
    document.getElementById('mode' + cap).classList.toggle('active', x === m);
    document.getElementById('input' + cap).style.display = x === m ? 'block' : 'none';
  });
}

/* ═══════ STT ═══════ */
let rec = null;
function startListen() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { showToast('Voice not supported'); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  rec = new SR(); rec.lang = 'en-IN'; rec.continuous = true; rec.interimResults = true;
  rec.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++)t += e.results[i][0].transcript; document.getElementById('voiceInput').value = t; };
  rec.start();
  document.getElementById('listenBtn').style.display = 'none';
  document.getElementById('stopBtn').style.display = 'inline-flex';
  document.getElementById('voiceActive').style.display = 'flex';
}
function stopListen() {
  if (rec) rec.stop();
  document.getElementById('listenBtn').style.display = 'inline-flex';
  document.getElementById('stopBtn').style.display = 'none';
  document.getElementById('voiceActive').style.display = 'none';
}
function onImgUpload(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => { document.getElementById('imgPreviewEl').src = ev.target.result; document.getElementById('imgPreview').style.display = 'block'; };
  r.readAsDataURL(f);
}
function onFileUpload(e) {
  const f = e.target.files[0]; if (!f) return;
  document.getElementById('fileName').textContent = '📄 ' + f.name + ' — ready!';
  document.getElementById('fileInfo').style.display = 'block';
}

/* ═══════ AI HELPER ═══════ */
const MOCK = {
  explain: ["Here's how it works:\n1. Think of it like a storage box 📦\n2. The box holds one piece of info at a time\n3. Repeat to make the box bigger\n4. Practice every day to keep it strong!"],
  shorten: ["Short version: Practice a little every day. That builds the strongest memories! 🎯"],
  example: ["Real example:\nLearning to ride a bike 🚲 — hard at first, automatic after practice. That is exactly how memory works!"],
  quiz: ["Quiz time!\n\nWhat helps memory the MOST?\nA) Sleeping well 😴\nB) Watching TV 📺\nC) Eating sugar 🍭\nD) Stressing out 😰\n\nHint: Your brain fixes itself during this activity!"],
  ask: ["Great question! 🌟\n1. Your brain makes tiny paths when you learn\n2. Repeating walks that path again and again\n3. The path gets stronger each time\n4. That is how memory is built!"]
};
function getInput() { return mode === 'text' ? document.getElementById('aiInput').value : mode === 'voice' ? document.getElementById('voiceInput').value : ''; }
async function askAI(type) {
  const loading = document.getElementById('aiLoading');
  const resp = document.getElementById('aiResponse');
  const txt = document.getElementById('aiRespText');
  const input = getInput();
  loading.style.display = 'flex'; resp.style.display = 'none';
  const prompts = {
    explain: `Explain this simply for a student with learning difficulties: "${input || 'memory'}". Use max 4 sentences, numbered steps.`,
    shorten: `Make this very short (2-3 sentences) for a young learner: "${input || 'memory'}"`,
    example: `Give one simple real-life example to explain: "${input || 'memory'}". Under 50 words. Relatable.`,
    quiz: `Create a simple 4-option MCQ about: "${input || 'memory'}". Label A B C D. State the answer at end.`,
    ask: `Answer simply for a student who finds learning hard: "${input || 'how does memory work?'}". Short sentences. Encouraging.`
  };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, system: 'Kind, patient AI tutor. Grade 3-4 reading level. Short sentences. Encouraging. No jargon. Under 150 words.', messages: [{ role: 'user', content: prompts[type] }] }) });
    if (!res.ok) throw new Error();
    const d = await res.json(); renderAIResp(d.content[0].text);
  } catch {
    await new Promise(r => setTimeout(r, 800));
    renderAIResp((MOCK[type] || MOCK.ask)[0]);
  }
}
function renderAIResp(text) {
  const loading = document.getElementById('aiLoading');
  const resp = document.getElementById('aiResponse');
  const txt = document.getElementById('aiRespText');
  loading.style.display = 'none'; resp.style.display = 'block';
  let html = '', sc = 0;
  text.split('\n').filter(l => l.trim()).forEach(line => {
    if (/^\d+[\.\)]/.test(line.trim())) {
      sc++; const t = line.replace(/^\d+[\.\)]\s*/, '');
      html += `<div class="step-item"><div class="step-n">${sc}</div><div style="font-size:14px;line-height:1.7;font-weight:300">${t}</div></div>`;
    } else {
      html += `<p style="margin-bottom:8px;font-size:14px;line-height:1.8;font-weight:300">${line}</p>`;
    }
  });
  txt.innerHTML = html; showToast('✨ Answer ready!');
}

/* ═══════ HOME FLASHCARD ═══════ */
let homeFCFlip = false;
function flipHomeCard() { homeFCFlip = !homeFCFlip; document.getElementById('homeFC').classList.toggle('flipped', homeFCFlip); }
let memCount = 2;
function memYes() {
  if (memCount < 3) { memCount++; const ps = document.querySelectorAll('#homeMem .brain-pip'); ps.forEach((p, i) => p.classList.toggle('lit', i < memCount)); showToast('🧠 Stronger memory!'); spawnConfetti(document.getElementById('homeMem')); }
  homeFCFlip = false; document.getElementById('homeFC').classList.remove('flipped');
}
function memNo() { homeFCFlip = false; document.getElementById('homeFC').classList.remove('flipped'); showToast('No worries! Keep practicing 💪'); }

/* ═══════ HOME QUIZ ═══════ */
let homeAnswered = false;
function ansHome(idx) {
  if (homeAnswered) return; homeAnswered = true;
  const opts = document.querySelectorAll('#homeOpts .q-opt');
  opts[1].classList.add('correct');
  if (idx !== 1) opts[idx].classList.add('wrong');
  if (idx === 1) { showToast('⭐ Correct! Amazing!'); spawnConfetti(opts[1]); document.getElementById('streakPill').style.display = 'flex'; document.getElementById('streakTxt').textContent = 'Correct! Keep it up! 🔥'; }
  else showToast('Good try! Exercise helps memory most 💪');
  setTimeout(() => { homeAnswered = false; opts.forEach(o => o.classList.remove('correct', 'wrong')); }, 2500);
}

/* ═══════ SKILLS ═══════ */
const skillDB = {
  math_reasoning: {
    name: 'Mathematical Reasoning', emoji: '🧮', steps: [
      { title: 'Add Left to Right', concept: 'In Vedic Math, we add big numbers first!', analogy: 'Like counting money 💰', visual: '34 + 25 → 59 ✅', type: 'choice', q: 'Using this method: 42 + 35 = ?', opts: ['67', '77 ✅', '87', '57'], correct: 1 },
    ]
  },
  puzzles: {
    name: 'Puzzles & Reasoning', emoji: '🧩', steps: [
      { title: 'What is a Pattern?', concept: 'A pattern is something that repeats.', analogy: 'Like zebra stripes 🦓', visual: '🔴 🔵 🔴 🔵 🔴 ___?', type: 'choice', q: 'What comes next? 🔴🔵🔴🔵🔴___', opts: ['🔴 Red', '🔵 Blue', '🟡 Yellow', '🟢 Green'], correct: 1 },
    ]
  },
  match_cards: {
    name: 'Match the Cards', emoji: '🃏', steps: [
      { title: 'Visual Memory', concept: 'Remember where you saw the card last.', analogy: 'Like finding your keys 🔑', visual: '🃏 🃏', type: 'choice', q: 'Where was the red card?', opts: ['Left', 'Right', 'Top', 'Bottom'], correct: 0 },
    ]
  },
  word_recall: {
    name: 'Word Recall', emoji: '📝', steps: [
      { title: 'Remember the List', concept: 'Read a list of words, then repeat them.', analogy: 'Like a grocery list 🛒', visual: 'Cat, Dog, Bird', type: 'choice', q: 'Which word was NOT in the list? Cat, Dog, Bird', opts: ['Cat', 'Dog', 'Lion', 'Bird'], correct: 2 },
    ]
  },
  audio_recall: {
    name: 'Audio Recall', emoji: '🎧', steps: [
      { title: 'Listen Closely', concept: 'Listen to the sound and connect it to a picture.', analogy: 'Like recognizing a friends voice 🗣️', visual: '🎵 🎵', type: 'choice', q: 'What makes a MOO sound?', opts: ['Dog', 'Cat', 'Cow', 'Bird'], correct: 2 },
    ]
  }
};
let curSkill = null, curStep = 0;
function openSkill(id) {
  curSkill = id; curStep = 0;
  document.getElementById('skillsCat').style.display = 'none';
  document.getElementById('lessonView').style.display = 'block';
  document.getElementById('lessonBread').textContent = skillDB[id].name;
  document.getElementById('lessonEmoji').textContent = skillDB[id].emoji;
  renderStep();
}
function closeLesson() {
  document.getElementById('skillsCat').style.display = 'block';
  document.getElementById('lessonView').style.display = 'none';
}
function renderStep() {
  const d = skillDB[curSkill]; const s = d.steps[curStep];
  document.getElementById('lessonTitle').textContent = s.title;
  document.getElementById('conceptTxt').textContent = s.concept;
  document.getElementById('analogyTxt').innerHTML = '💡 ' + s.analogy;
  document.getElementById('lessonVisual').textContent = s.visual;
  document.getElementById('lessonStepNum').textContent = curStep + 1;
  document.getElementById('prevBtn').style.display = curStep === 0 ? 'none' : 'inline-flex';
  const pips = document.getElementById('stepPips');
  pips.innerHTML = d.steps.map((x, i) => `<div class="step-pip ${i < curStep ? 'done' : i === curStep ? 'now' : ''}"></div>`).join('');
  const z = document.getElementById('interactContent');
  document.getElementById('feedbackPanel').style.display = 'none';
  document.getElementById('hintPanel').style.display = 'none';
  if (s.type === 'choice') {
    z.innerHTML = `<p style="font-size:14px;font-weight:500;margin-bottom:12px;color:var(--text)">${s.q}</p><div>${s.opts.map((o, i) => `<button class="choice-opt" onclick="checkChoice(${i},${s.correct})">${o}</button>`).join('')}</div>`;
  } else if (s.type === 'blank') {
    z.innerHTML = `<p style="font-size:14px;font-weight:500;margin-bottom:12px">${s.q}</p><div class="word-chips">${s.opts.map((o, i) => `<button class="word-chip" onclick="checkBlank(this,${i === s.correct},'${o}')">${o}</button>`).join('')}</div>`;
  } else if (s.type === 'order') {
    z.innerHTML = `<p style="font-size:14px;font-weight:500;margin-bottom:12px">${s.q}</p><div>${s.opts.map(o => `<button class="choice-opt" onclick="this.classList.toggle('picked')">${o}</button>`).join('')}</div><button class="btn btn-primary btn-sm" style="margin-top:12px;border-radius:10px" onclick="checkOrder()">Check Order ✓</button>`;
  }
}
function checkChoice(idx, correct) {
  const fb = document.getElementById('feedbackPanel');
  if (idx === correct) { fb.className = 'feedback-panel ok'; fb.style.display = 'block'; fb.innerHTML = '🎉 Correct! You are doing amazing!'; spawnConfetti(fb); showToast('⭐ Correct!'); }
  else { fb.className = 'feedback-panel hint'; fb.style.display = 'block'; fb.innerHTML = 'Good try! The answer was: <strong>' + skillDB[curSkill].steps[curStep].opts[correct] + '</strong>. You can do it! 💪'; }
}
function checkBlank(btn, isRight, opt) {
  btn.classList.add('used'); const fb = document.getElementById('feedbackPanel');
  if (isRight) { fb.className = 'feedback-panel ok'; fb.style.display = 'block'; fb.innerHTML = '🎉 Perfect! "' + opt + '" is correct!'; spawnConfetti(btn); }
  else { fb.className = 'feedback-panel hint'; fb.style.display = 'block'; fb.innerHTML = 'Good effort! Look for the word with "bh" in it 💡'; }
}
function checkOrder() {
  const fb = document.getElementById('feedbackPanel');
  fb.className = 'feedback-panel ok'; fb.style.display = 'block';
  fb.innerHTML = '🎯 Well done for trying! The correct order is: Start → Turn → Stop. Commands always go in order!';
}
function showHint() {
  const s = skillDB[curSkill].steps[curStep];
  const h = document.getElementById('hintPanel');
  h.className = 'feedback-panel hint'; h.style.display = 'block';
  h.innerHTML = '💡 Hint: ' + s.analogy;
}
function nextStep() {
  const d = skillDB[curSkill];
  if (curStep < d.steps.length - 1) { curStep++; renderStep(); }
  else { showToast('🎉 Skill complete! Amazing!'); spawnConfetti(document.getElementById('lessonView')); setTimeout(closeLesson, 1800); }
}
function prevStep() { if (curStep > 0) { curStep--; renderStep(); } }

/* ═══════ PRACTICE TABS ═══════ */
function switchTab(name, el) {
  document.querySelectorAll('.prac-sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.tab-pill').forEach(b => b.classList.remove('on'));
  document.getElementById('tab-' + name).classList.add('on');
  el.classList.add('on');
}
function fFilter(el, cat) {
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); showToast('Showing ' + cat + ' cards 📇');
}

/* ═══════ BIG FLASHCARDS ═══════ */
const bigCards = [
  { e: '🎵', q: 'What is a musical note?', a: 'A musical note is a sound with a specific pitch. Each "la" when you sing is a note!' },
  { e: '🧠', q: 'What is Working Memory?', a: 'Working memory is your brain\'s sticky note — holds a few pieces of info for a short time!' },
  { e: '💻', q: 'What does a loop do?', a: 'A loop repeats the same command many times automatically! "Jump 5 times" instead of writing jump 5 times.' },
  { e: '🕉️', q: 'What does "Bhur" mean in Gayatri Mantra?', a: '"Bhur" means the Earth — the physical world we live in!' },
  { e: '🧮', q: 'In Vedic Math, which numbers go first?', a: 'Add the BIG numbers first (tens), then the small ones (units). Much faster!' },
  { e: '🛒', q: 'Why make a shopping list?', a: 'It helps you remember everything you need and stay within budget!' },
  { e: '🔵', q: 'What is a pattern?', a: 'Something that repeats in order! Red, blue, red, blue — next is blue!' },
  { e: '🎵', q: 'What is Tempo in music?', a: 'Tempo is the speed of music. Fast = dance music. Slow = lullaby!' },
];
let bigIdx = 0, bigFlip = false;
function flipBigCard() { bigFlip = !bigFlip; document.getElementById('bigFC').classList.toggle('flip', bigFlip); }
function loadBigCard() {
  const c = bigCards[bigIdx];
  document.getElementById('bigFCEmoji').textContent = c.e;
  document.getElementById('bigFCQ').textContent = c.q;
  document.getElementById('bigFCA').textContent = c.a;
  document.getElementById('cardCtr').textContent = 'Card ' + (bigIdx + 1) + ' of ' + bigCards.length;
  bigFlip = false; document.getElementById('bigFC').classList.remove('flip');
}
function nextCard() { bigIdx = (bigIdx + 1) % bigCards.length; loadBigCard(); }
function prevCard() { bigIdx = (bigIdx - 1 + bigCards.length) % bigCards.length; loadBigCard(); }
function cardRemember() {
  showToast('🧠 Great! Neural pathway strengthened!');
  spawnConfetti(document.getElementById('bigFC'));
  const ps = document.querySelectorAll('#bigMem .mem-pip');
  let f = 0; ps.forEach(p => { if (p.classList.contains('lit')) f++; });
  if (f < 5) ps[f].classList.add('lit');
  setTimeout(nextCard, 600);
}
function cardAgain() { showToast('No problem! Repeat builds mastery 💪'); nextCard(); }

/* ═══════ QUIZ ═══════ */
const quizData = [
  { cat: '🧠 Memory', q: 'How many items can working memory hold at once?', opts: ['A — About 2-3 items', 'B — About 7 items', 'C — About 50 items', 'D — Unlimited'], correct: 1, exp: 'Working memory holds about 7 items. That is why phone numbers have 7 digits!' },
  { cat: '🎵 Music', q: 'What is "tempo" in music?', opts: ['A — Pitch of notes', 'B — Volume of sound', 'C — Speed of music', 'D — Type of instrument'], correct: 2, exp: 'Tempo is the speed! Fast tempo = energetic music. Slow = calm.' },
  { cat: '💻 Coding', q: 'What does a LOOP do?', opts: ['A — Stops the program', 'B — Repeats commands many times', 'C — Deletes code', 'D — Changes color'], correct: 1, exp: 'A loop repeats the same instruction automatically!' },
  { cat: '🧮 Vedic Math', q: 'Using Vedic Math, what is 23 + 45?', opts: ['A — 78', 'B — 58', 'C — 68', 'D — 88'], correct: 2, exp: '20+40=60, then 3+5=8, total = 68! Add big numbers first!' },
  { cat: '🧩 Patterns', q: 'What comes next? 🔴🔵🔴🔵🔴___', opts: ['A — 🔴 Red', 'B — 🔵 Blue', 'C — 🟡 Yellow', 'D — 🟢 Green'], correct: 1, exp: 'Pattern is red-blue repeating, so blue comes next!' },
];
let qIdx = 0, qStars = 0, qAns = false, qTotal = 0;
function loadQuizQ() {
  const q = quizData[qIdx % quizData.length];
  document.getElementById('qCat').textContent = q.cat;
  document.getElementById('qQuestion').textContent = q.q;
  document.getElementById('qOpts').innerHTML = q.opts.map((o, i) => `<button class="q-opt" onclick="ansQuiz(${i})">${o}</button>`).join('');
  document.getElementById('qFeedback').style.display = 'none';
  document.getElementById('nextQBtn').style.display = 'none';
  qAns = false;
}
function ansQuiz(idx) {
  if (qAns) return; qAns = true; qTotal++;
  const q = quizData[qIdx % quizData.length];
  const opts = document.querySelectorAll('#qOpts .q-opt');
  opts[q.correct].classList.add('correct');
  if (idx !== q.correct) opts[idx].classList.add('wrong');
  document.getElementById('qCount').textContent = qTotal;
  const fb = document.getElementById('qFeedback'); fb.style.display = 'block';
  if (idx === q.correct) { qStars++; document.getElementById('qStars').textContent = '⭐ ' + qStars; fb.className = 'feedback-panel ok'; fb.innerHTML = '🎉 Correct! ' + q.exp; spawnConfetti(opts[q.correct]); showToast('⭐ +1 Star!'); }
  else { fb.className = 'feedback-panel hint'; fb.innerHTML = 'Good try! ' + q.exp + ' You can do it next time! 💪'; }
  document.getElementById('nextQBtn').style.display = 'block';
}
function nextQuizQ() { qIdx++; loadQuizQ(); }

/* ═══════ PATTERN GAME ═══════ */
let patSeq = [], patUser = [], patShow = false, patScore = 0, patLen = 3;
const patEmojis = ['🔵', '🔴', '🟡', '🟢', '🟣', '🟠', '⚪', '🔶'];
function buildPatGrid() {
  const g = document.getElementById('patGrid'); g.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const t = document.createElement('div'); t.className = 'p-tile';
    t.dataset.i = i; t.textContent = patEmojis[i % 8];
    t.onclick = () => tapPat(i); g.appendChild(t);
  }
}
function startPattern() {
  patSeq = []; patUser = []; patLen = 3; patScore = 0;
  document.getElementById('patScore').textContent = '0';
  document.getElementById('patBtn').style.display = 'none';
  document.getElementById('patFeedback').style.display = 'none';
  genPatSeq();
}
function genPatSeq() {
  patSeq = []; document.getElementById('patLevel').textContent = 'Level ' + patLen;
  for (let i = 0; i < patLen; i++)patSeq.push(Math.floor(Math.random() * 16));
  patUser = []; showPatSeq();
}
async function showPatSeq() {
  patShow = true;
  const tiles = document.querySelectorAll('.p-tile');
  tiles.forEach(t => t.style.pointerEvents = 'none');
  await new Promise(r => setTimeout(r, 600));
  for (const idx of patSeq) {
    tiles[idx].classList.add('flash');
    await new Promise(r => setTimeout(r, 500));
    tiles[idx].classList.remove('flash');
    await new Promise(r => setTimeout(r, 200));
  }
  patShow = false; tiles.forEach(t => t.style.pointerEvents = 'auto');
}
function tapPat(idx) {
  if (patShow) return;
  const tiles = document.querySelectorAll('.p-tile');
  patUser.push(idx); const pos = patUser.length - 1;
  if (patUser[pos] === patSeq[pos]) {
    tiles[idx].classList.add('hit'); setTimeout(() => tiles[idx].classList.remove('hit'), 300);
    if (patUser.length === patSeq.length) {
      patScore++; document.getElementById('patScore').textContent = patScore; patLen++;
      showToast('🎉 Perfect! Level up!'); spawnConfetti(document.getElementById('patGrid'));
      setTimeout(genPatSeq, 1000);
    }
  } else {
    tiles[idx].classList.add('miss'); setTimeout(() => tiles[idx].classList.remove('miss'), 400);
    const fb = document.getElementById('patFeedback');
    fb.className = 'feedback-panel hint'; fb.style.display = 'block';
    fb.innerHTML = 'Good try! You got ' + patUser.length + ' tiles right. Let\'s try again! 💪';
    document.getElementById('patBtn').style.display = 'inline-flex';
    document.getElementById('patBtn').textContent = '▶ Try Again';
  }
}

/* ═══════ WORD RECALL ═══════ */
const wrSets = [
  [{ w: '🌳 Tree' }, { w: '🎵 Music' }, { w: '🏡 Home' }, { w: '📚 Book' }, { w: '☀️ Sun' }],
  [{ w: '🐘 Elephant' }, { w: '🍎 Apple' }, { w: '⭐ Star' }, { w: '🚂 Train' }, { w: '🌊 Wave' }],
];
let wrSet = [], wrAnswers = [];
function loadWRWords() {
  wrSet = wrSets[Math.floor(Math.random() * wrSets.length)];
  document.getElementById('wrList').innerHTML = wrSet.map(w => `<div class="wr-tile">${w.w}</div>`).join('');
}
function startWordRecall() {
  document.getElementById('wrStudy').style.display = 'none';
  document.getElementById('wrRecall').style.display = 'block';
  wrAnswers = []; document.getElementById('wrAnswers').innerHTML = '';
  document.getElementById('wrFeedback').style.display = 'none';
}
function addWord() {
  const inp = document.getElementById('wrInput');
  const v = inp.value.trim().toLowerCase(); if (!v) return;
  wrAnswers.push(v); inp.value = '';
  const d = document.getElementById('wrAnswers');
  const chip = document.createElement('div');
  chip.className = 'word-chip'; chip.style.opacity = '1'; chip.textContent = v;
  d.appendChild(chip);
}
function checkWords() {
  const fb = document.getElementById('wrFeedback'); let found = 0;
  wrSet.forEach(w => {
    const base = w.w.split(' ').slice(-1)[0].toLowerCase();
    if (wrAnswers.includes(base) || wrAnswers.some(a => base.includes(a) || a.includes(base))) found++;
  });
  fb.className = 'feedback-panel ' + (found >= 3 ? 'ok' : 'hint'); fb.style.display = 'block';
  fb.innerHTML = found >= 3 ? '🎉 Brilliant! You remembered ' + found + ' of 5 words! Neural pathway locked in!' : 'Great effort! You remembered ' + found + ' of 5. The words were: ' + wrSet.map(w => w.w.split(' ')[0]).join(' ') + '. Keep practicing! 💪';
  if (found >= 3) { spawnConfetti(fb); showToast('🧠 Neural Champion!'); }
  setTimeout(() => { document.getElementById('wrStudy').style.display = 'block'; document.getElementById('wrRecall').style.display = 'none'; loadWRWords(); fb.style.display = 'none'; }, 3000);
}

/* ═══════ DASHBOARD ═══════ */
const weekVals = [2, 4, 3, 5, 2, 4, 3];
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
function buildWeekChart() {
  const chart = document.getElementById('weekChart');
  const max = Math.max(...weekVals);
  chart.innerHTML = weekVals.map((v, i) => `
    <div class="w-bar">
      <div class="w-val">${v}</div>
      <div class="w-fill" style="height:${Math.round((v / max) * 90) + 8}px"></div>
      <div class="w-label">${weekDays[i]}</div>
    </div>
  `).join('');
}
function countUp(el, target, dur) {
  let s = 0; const step = Math.ceil(target / 30);
  const iv = setInterval(() => { s += step; if (s >= target) { el.textContent = target; clearInterval(iv); return; } el.textContent = s; }, dur / 30);
}
document.getElementById('nav-dashboard').addEventListener('click', () => {
  setTimeout(() => {
    countUp(document.getElementById('sSk'), 4, 800);
    countUp(document.getElementById('sStars'), 28, 800);
    countUp(document.getElementById('sStr'), 3, 800);
    countUp(document.getElementById('sAct'), 14, 800);
  }, 200);
});

/* ═══════ CONFETTI ═══════ */
function spawnConfetti(el) {
  const r = el.getBoundingClientRect();
  const cols = ['#00d4ff', '#00ffe0', '#f5c842', '#ff5e8f', '#7c3aed'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div'); p.className = 'cf-piece';
    p.style.cssText = `left:${r.left + Math.random() * r.width}px;top:${r.top + 20}px;background:${cols[i % 5]};transform:rotate(${Math.random() * 360}deg);animation-delay:${Math.random() * 0.3}s`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 1100);
  }
}

/* ═══════ STANDALONE MODULES INTEGRATION ═══════ */

let totalXP = 0;
let challengesCompleted = 0;

window.addXP = function(amount) {
  totalXP += amount;
  const xpValue = document.getElementById('xpValue');
  const badge = document.getElementById('xpBadge');
  if (xpValue && badge) {
    badge.style.display = 'flex';
    let current = parseInt(xpValue.innerText);
    const target = totalXP;
    const inc = Math.max(1, Math.floor((target - current) / 10));
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) { current = target; clearInterval(timer); }
      xpValue.innerText = current;
    }, 30);
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  }
};

window.checkCompletion = function() {
  challengesCompleted++;
  if (challengesCompleted >= 10) {
    setTimeout(() => {
      const banner = document.getElementById('congratsBanner');
      if (banner) {
        banner.style.display = 'flex';
        banner.classList.add('visible');
      }
    }, 1000);
  }
};

let currentMathIdx = 0;
const mathQuestions = [
    { level: 1, color: 'cyan', title: 'Beginner', visualHtml: `<div style="display:flex;gap:5px" class="animate-float"><span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span><span style="margin:0 15px">+</span><span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span></div>`, text: "If you have 3 apples and someone gives you 2 more, how many apples do you have?", options: ["A) 4", "B) 5", "C) 6", "D) 3"], correctIdx: 1, fact: "Great job! Addition means combining groups together 🎉" },
    { level: 2, color: 'green', title: 'Easy', visualHtml: `<div style="width:100%;max-width:300px;height:4px;background:rgba(255,255,255,0.2);position:relative;border-radius:2px"><div style="position:absolute;left:10%;top:-10px;width:24px;height:24px;background:var(--green);border-radius:50%;box-shadow:0 0 10px var(--green);animation:bounce 1s infinite"></div><div style="display:flex;justify-content:space-between;margin-top:15px;font-size:16px;font-weight:700"><span>2</span><span>4</span><span>6</span><span>8</span><span>?</span></div></div>`, text: "What number comes next in this pattern? 2, 4, 6, 8, ___", options: ["A) 9", "B) 10", "C) 11", "D) 12"], correctIdx: 1, fact: "You found the pattern! These are called even numbers ✨" },
    { level: 3, color: 'gold', title: 'Medium', visualHtml: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;animation:pulse-scale 2s infinite alternate"><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span></div>`, text: "There are 3 rows of stars with 4 stars in each row. How many stars are there in total?", options: ["A) 7", "B) 10", "C) 12", "D) 14"], correctIdx: 2, fact: "Multiplication is just fast adding! 3 × 4 = 12 🌟" },
    { level: 4, color: 'orange', title: 'Intermediate', visualHtml: `<svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="var(--orange)" stroke-width="4"/><line x1="50" y1="50" x2="50" y2="20" stroke="var(--text-main)" stroke-width="4" stroke-linecap="round"/><line x1="50" y1="50" x2="70" y2="70" stroke="var(--orange)" stroke-width="6" stroke-linecap="round" style="--target-angle:45deg; transform-origin:50px 50px; animation: draw-clock-hand 2s ease forwards"/></svg>`, text: "A movie starts at 2:00 PM and lasts 1 hour 30 minutes. What time does it end?", options: ["A) 3:00 PM", "B) 3:30 PM", "C) 4:00 PM", "D) 2:30 PM"], correctIdx: 1, fact: "Time math is used every day — great thinking! ⏰" },
    { level: 5, color: 'violet', title: 'Challenging', visualHtml: `<svg width="80" height="80" viewBox="0 0 32 32" style="transform: rotate(-90deg)"><circle r="16" cx="16" cy="16" fill="var(--violet)" opacity="0.3"/><circle r="16" cx="16" cy="16" fill="transparent" stroke="var(--violet)" stroke-width="32" stroke-dasharray="100 100" style="--target-offset:35; animation: draw-pie 2s ease forwards"/></svg>`, text: "Maya has 20 stickers. She gives half to her friend and then uses 3 herself. How many does she have left?", options: ["A) 10", "B) 8", "C) 7", "D) 9"], correctIdx: 2, fact: "Two steps — first divide, then subtract. You're a problem solver! 🧠" }
];

window.openMathModule = function() {
  document.getElementById('skillsCat').style.display = 'none';
  const tm = document.getElementById('mathModule');
  tm.style.display = 'block';
  tm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  currentMathIdx = 0; window.renderMathQuestion(0);
};

window.renderMathQuestion = function(idx) {
  const tm = document.getElementById('mathModule');
  if (idx >= mathQuestions.length) return renderMathCompletion();
  const q = mathQuestions[idx]; const pct = ((idx) / 5) * 100;
  tm.innerHTML = `<div style="margin-bottom:12px"><span style="cursor:pointer;color:#00d4ff" onclick="document.getElementById('mathModule').style.display='none';document.getElementById('skillsCat').style.display='block'">← Back to Skills</span></div><div class="module-header fade-in"><div class="module-progress-text">Question ${idx + 1} of 5</div><div class="module-level-badge lvl-${q.level}">Level ${q.level} — ${q.title}</div></div><div class="mod-progress-bar fade-in"><div class="mod-progress-fill" style="width: ${pct}%"></div></div><div class="question-area fade-in"><div class="question-visual">${q.visualHtml}</div><div class="question-text">${q.text}</div></div><div class="options-grid fade-in" id="mathOptions">${q.options.map((opt, i) => `<button class="option-btn" onclick="selectMathOption(${i}, ${q.correctIdx}, '${q.fact}')">${opt} <span class="option-icon"></span></button>`).join('')}</div><div class="fun-fact-bubble" id="mathFactBubble"></div><div class="next-action-area" id="mathNextArea"><button class="btn btn-primary" onclick="nextMathQ()">Next Question →</button></div>`;
  setTimeout(() => { const fill = tm.querySelector('.mod-progress-fill'); if (fill) fill.style.width = `${((idx + 1) / 5) * 100}%`; }, 100);
};

window.selectMathOption = function(sIdx, cIdx, fact) {
  const opts = document.querySelectorAll('#mathOptions .option-btn');
  opts.forEach(btn => btn.style.pointerEvents = 'none');
  if (sIdx === cIdx) {
    opts[sIdx].classList.add('correct'); opts[sIdx].querySelector('.option-icon').innerHTML = '✓';
    window.addXP(10); window.checkCompletion(); spawnConfetti(opts[sIdx]); showToast('⭐ +10 XP!');
    const b = document.getElementById('mathFactBubble'); b.innerHTML = '✨ ' + fact; b.classList.add('show');
    document.getElementById('mathNextArea').classList.add('show');
  } else {
    opts[sIdx].classList.add('wrong'); opts[sIdx].querySelector('.option-icon').innerHTML = '✗';
    setTimeout(() => { opts[sIdx].classList.remove('wrong'); opts.forEach(b => b.style.pointerEvents = 'auto'); }, 600);
  }
};
window.nextMathQ = function() { currentMathIdx++; window.renderMathQuestion(currentMathIdx); };
window.renderMathCompletion = function() { document.getElementById('mathModule').innerHTML = `<div style="text-align:center; padding:40px 20px" class="fade-in"><div style="font-size:60px; margin-bottom:20px; animation:bounce 2s infinite">🏆</div><h2 style="font-family:'Syne',sans-serif; font-size:32px; margin-bottom:15px; color:#00d4ff">Math Mastery Complete!</h2><p style="color:rgba(255,255,255,0.65); font-size:18px; margin-bottom:30px">You earned 50 XP and leveled up your mathematical reasoning.</p><button class="btn btn-primary" onclick="document.getElementById('mathModule').style.display='none';document.getElementById('skillsCat').style.display='block';window.scrollTo({top:0,behavior:'smooth'})">Return to Skills</button></div>`; spawnConfetti(document.getElementById('mathModule')); };

let currentPuzzleIdx = 0;
const puzzleQuestions = [
  { level: 1, color: 'cyan', title: 'Beginner', text: "Tap the shape that does NOT belong in this group!", type: 'odd-one', fact: "Great eye! The square is different — it has corners, circles don't 🔵" },
  { level: 2, color: 'green', title: 'Easy', text: "Which emoji completes the pattern?", type: 'pattern', fact: "Patterns repeat — once you see it, you can predict what comes next 🌙" },
  { level: 3, color: 'gold', title: 'Medium', text: "Match each shape to its shadow! Tap the correct pair.", type: 'shadow', fact: "Matching shapes builds visual thinking — a superpower of the brain! 🧠" },
  { level: 4, color: 'orange', title: 'Intermediate', text: "Arrange these steps in the correct order! Tap them 1, 2, 3, 4.", type: 'sequence', fact: "Sequencing is how our brain organises stories and plans 🌸" },
  { level: 5, color: 'violet', title: 'Challenging', text: "Flip the cards and find the matching pairs! Remember what you saw.", type: 'memory', fact: "Memory games literally grow your hippocampus — the brain's memory center! 🌟" }
];

window.openPuzzleModule = function() {
  document.getElementById('skillsCat').style.display = 'none';
  const pm = document.getElementById('puzzleModule');
  pm.style.display = 'block';
  pm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  currentPuzzleIdx = 0; window.renderPuzzle(0);
};

window.renderPuzzle = function(idx) {
  const pm = document.getElementById('puzzleModule');
  if (idx >= puzzleQuestions.length) return renderPuzzleCompletion();
  const p = puzzleQuestions[idx]; const pct = ((idx) / 5) * 100;
  pm.innerHTML = `<div style="margin-bottom:12px"><span style="cursor:pointer;color:#f5c842" onclick="document.getElementById('puzzleModule').style.display='none';document.getElementById('skillsCat').style.display='block'">← Back to Skills</span></div><div class="module-header fade-in"><div class="module-progress-text">Puzzle ${idx + 1} of 5</div><div class="module-level-badge lvl-${p.level}">Level ${p.level} — ${p.title}</div></div><div class="mod-progress-bar fade-in"><div class="mod-progress-fill" style="width: ${pct}%"></div></div><div class="puzzle-instruction fade-in">${p.text}</div><div class="puzzle-stage fade-in" id="puzzleStage"></div><div class="fun-fact-bubble" id="puzzleFactBubble"></div><div class="next-action-area" id="puzzleNextArea"><button class="btn btn-puzzle" onclick="nextPuzzle()">Next Puzzle →</button></div>`;
  setTimeout(() => { const fill = pm.querySelector('.mod-progress-fill'); if (fill) fill.style.width = `${((idx + 1) / 5) * 100}%`; }, 100);
  const stage = document.getElementById('puzzleStage');
  if (p.type === 'odd-one') renderOddOne(stage);
  if (p.type === 'pattern') renderPattern(stage);
  if (p.type === 'shadow') renderShadow(stage);
  if (p.type === 'sequence') renderSequence(stage);
  if (p.type === 'memory') renderMemory(stage);
};

function showPuzzleSuccess() {
  window.addXP(15); window.checkCompletion(); spawnConfetti(document.getElementById('puzzleStage')); showToast('⭐ +15 XP!');
  const fb = document.getElementById('puzzleFactBubble');
  fb.innerHTML = '✨ ' + puzzleQuestions[currentPuzzleIdx].fact; fb.classList.add('show');
  document.getElementById('puzzleNextArea').classList.add('show');
}
function renderOddOne(c) { c.innerHTML = `<div class="shape-row"><div class="puzzle-shape circle" onclick="handleOddOne(this,false)"></div><div class="puzzle-shape circle" onclick="handleOddOne(this,false)"></div><div class="puzzle-shape square" onclick="handleOddOne(this,true)"></div><div class="puzzle-shape circle" onclick="handleOddOne(this,false)"></div><div class="puzzle-shape circle" onclick="handleOddOne(this,false)"></div></div>`; }
window.handleOddOne = function(el, ok) { if (ok) { el.classList.add('selected-correct'); el.innerHTML='<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#050d1f;font-size:32px">✓</div>'; document.querySelectorAll('.puzzle-shape').forEach(s=>{if(s!==el)s.classList.add('dimmed');}); showPuzzleSuccess(); } else { el.classList.add('selected-wrong'); setTimeout(() => el.classList.remove('selected-wrong'), 500); } };
function renderPattern(c) { c.innerHTML = `<div class="pattern-row"><span>🌞</span><span>🌙</span><span>🌞</span><span>🌙</span><span>🌞</span><div class="pattern-blank" id="patBlank">?</div></div><div class="shape-row" id="patOptions"><button class="option-btn" onclick="handlePat(this,'🌙',true)">🌙</button><button class="option-btn" onclick="handlePat(this,'🌞',false)">🌞</button><button class="option-btn" onclick="handlePat(this,'⭐',false)">⭐</button><button class="option-btn" onclick="handlePat(this,'🌈',false)">🌈</button></div>`; }
window.handlePat = function(btn, emoji, ok) { if (ok) { const b=document.getElementById('patBlank'); b.classList.add('filled'); b.innerHTML=emoji; btn.classList.add('correct'); document.getElementById('patOptions').style.pointerEvents='none'; showPuzzleSuccess(); } else { btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 500); } };
let shadowSelected = null, shadowMatches = 0;
function renderShadow(c) { shadowMatches = 0; c.innerHTML = `<div class="shadow-wrapper"><div class="shadow-row" id="shadowShapes"><div class="match-tile" data-shape="star" onclick="selectShadowShape(this)">⭐</div><div class="match-tile" data-shape="heart" onclick="selectShadowShape(this)">❤️</div><div class="match-tile" data-shape="tri" onclick="selectShadowShape(this)">🔺</div></div><div class="shadow-row" id="shadowTargets"><div class="match-tile shadow" data-shape="heart" onclick="selectShadowTarget(this)">❤️</div><div class="match-tile shadow" data-shape="tri" onclick="selectShadowTarget(this)">🔺</div><div class="match-tile shadow" data-shape="star" onclick="selectShadowTarget(this)">⭐</div></div></div>`; }
window.selectShadowShape = function(el) { if(el.classList.contains('matched')) return; document.querySelectorAll('#shadowShapes .match-tile').forEach(t=>t.classList.remove('active')); el.classList.add('active'); shadowSelected=el; };
window.selectShadowTarget = function(el) { if(!shadowSelected||el.classList.contains('matched')) return; if(shadowSelected.dataset.shape===el.dataset.shape){ el.classList.add('matched'); shadowSelected.classList.add('matched'); shadowSelected.classList.remove('active'); el.innerHTML=shadowSelected.innerHTML; el.style.textShadow='none'; el.style.color='#fff'; shadowMatches++; shadowSelected=null; if(shadowMatches>=3)showPuzzleSuccess(); }else{ el.style.animation='shake 0.5s ease'; setTimeout(()=>el.style.animation='',500); } };
let seqExpected = 1;
function renderSequence(c) { seqExpected = 1; c.innerHTML = `<div class="sequence-grid"><div class="seq-tile" onclick="handleSeq(this,3)"><div class="seq-graphic">🌿</div><div style="font-weight:600">Sprout</div></div><div class="seq-tile" onclick="handleSeq(this,1)"><div class="seq-graphic">🌱</div><div style="font-weight:600">Seed</div></div><div class="seq-tile" onclick="handleSeq(this,4)"><div class="seq-graphic">🌸</div><div style="font-weight:600">Flower</div></div><div class="seq-tile" onclick="handleSeq(this,2)"><div class="seq-graphic">💧</div><div style="font-weight:600">Watering</div></div></div>`; }
window.handleSeq = function(el, ord) { if(el.classList.contains('numbered')) return; if(ord===seqExpected) { el.classList.add('numbered'); el.innerHTML+=`<div class="seq-badge">${ord}</div>`; seqExpected++; if(seqExpected>4) showPuzzleSuccess(); }else{ el.style.animation='shake 0.5s ease'; setTimeout(()=>el.style.animation='',500); } };
let firstFlipped = null, secondFlipped = null, memMatches = 0;
function renderMemory(c) { memMatches = 0; const ems=['🦁','🦁','🐘','🐘','🦋','🦋','🐬','🐬','🌈','🌈','🎯','🎯']; ems.sort(()=>0.5-Math.random()); let html='<div class="memory-grid">'; ems.forEach(e=>{html+=`<div class="mem-card" data-emoji="${e}" onclick="handleMem(this)"><div class="mem-face mem-back">?</div><div class="mem-face mem-front">${e}</div></div>`;}); html+='</div>'; c.innerHTML=html; }
window.handleMem = function(el) { if(el.classList.contains('flipped')||secondFlipped) return; el.classList.add('flipped'); if(!firstFlipped) firstFlipped=el; else { secondFlipped=el; if(firstFlipped.dataset.emoji===secondFlipped.dataset.emoji) { setTimeout(() => { firstFlipped.classList.add('matched'); secondFlipped.classList.add('matched'); firstFlipped=null; secondFlipped=null; memMatches++; if(memMatches>=6) showPuzzleSuccess(); },500); } else { setTimeout(() => { firstFlipped.classList.remove('flipped'); secondFlipped.classList.remove('flipped'); firstFlipped=null; secondFlipped=null; },1000); } } };
window.nextPuzzle = function() { currentPuzzleIdx++; window.renderPuzzle(currentPuzzleIdx); };
window.renderPuzzleCompletion = function() { document.getElementById('puzzleModule').innerHTML = `<div style="text-align:center; padding:40px 20px" class="fade-in"><div style="font-size:60px; margin-bottom:20px; animation:bounce 2s infinite">🏅</div><h2 style="font-family:'Syne',sans-serif; font-size:32px; margin-bottom:15px; color:#f5c842">Puzzle Master Complete!</h2><p style="color:rgba(255,255,255,0.65); font-size:18px; margin-bottom:30px">You earned 75 XP and sharpened your memory reasoning.</p><button class="btn btn-ghost" onclick="document.getElementById('puzzleModule').style.display='none';document.getElementById('skillsCat').style.display='block';window.scrollTo({top:0,behavior:'smooth'})">Back to Skills</button></div>`; spawnConfetti(document.getElementById('puzzleModule')); };
