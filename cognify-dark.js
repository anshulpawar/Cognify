/* ═══════ NEURAL CANVAS ═══════ */
const canvas=document.getElementById('neural-canvas');
const ctx=canvas.getContext('2d');
let nodes=[];
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
resizeCanvas();window.addEventListener('resize',resizeCanvas);
for(let i=0;i<60;i++){
  nodes.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,r:Math.random()*2+1});
}
function drawNeural(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  nodes.forEach(n=>{
    n.x+=n.vx;n.y+=n.vy;
    if(n.x<0||n.x>canvas.width)n.vx*=-1;
    if(n.y<0||n.y>canvas.height)n.vy*=-1;
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle='rgba(0,212,255,0.5)';ctx.fill();
  });
  nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
    const d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<140){
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.strokeStyle=`rgba(0,212,255,${0.15*(1-d/140)})`;ctx.lineWidth=0.6;ctx.stroke();
    }
  }));
  requestAnimationFrame(drawNeural);
}
drawNeural();

/* ═══════ CURSOR ═══════ */
const cur=document.getElementById('cursor');
const curR=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx-6+'px';cur.style.top=my-6+'px';});
(function animRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;curR.style.left=rx-18+'px';curR.style.top=ry-18+'px';requestAnimationFrame(animRing);})();
document.querySelectorAll('button,a,.skill-card,.fc-wrap,.big-fc').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.style.transform='scale(1.8)';curR.style.transform='scale(1.4)';curR.style.borderColor='rgba(0,212,255,0.8)';});
  el.addEventListener('mouseleave',()=>{cur.style.transform='';curR.style.transform='';curR.style.borderColor='';});
});

/* ═══════ Progress Manager ═══════ */
const ProgressManager = {
  data: {
    skillsExplored: 0,
    starsCollected: 0,
    dayStreak: 0,
    activitiesDone: 0,
    recentActivity: [],
    skillProgress: {}
  },
  async load() {
    try {
      const r = await fetch('http://localhost:3000/api/progress');
      if (r.ok) {
        this.data = await r.json();
      }
      this.updateUI();
    } catch(e) { console.warn('Progress load failed', e); }
  },
  async save(updates) {
    if(!updates) return;
    
    // Optimistic local update
    if (updates.skillsExplored) this.data.skillsExplored = (this.data.skillsExplored || 0) + updates.skillsExplored;
    if (updates.starsCollected) this.data.starsCollected = (this.data.starsCollected || 0) + updates.starsCollected;
    if (updates.activitiesDone) this.data.activitiesDone = (this.data.activitiesDone || 0) + updates.activitiesDone;
    
    if (updates.skillId && updates.completedCount !== undefined) {
      if (!this.data.skillProgress) this.data.skillProgress = {};
      if (!this.data.skillProgress[updates.skillId] || updates.completedCount > this.data.skillProgress[updates.skillId]) {
        this.data.skillProgress[updates.skillId] = updates.completedCount;
      }
    }
    
    if (updates.activity) {
      if (!this.data.recentActivity) this.data.recentActivity = [];
      this.data.recentActivity.unshift({
        emoji: updates.activity.emoji || '📝',
        title: updates.activity.title || 'Activity',
        desc: updates.activity.desc || '',
        time: new Date().toISOString()
      });
      if (this.data.recentActivity.length > 5) this.data.recentActivity.pop();
      
      const today = new Date().toISOString().split('T')[0];
      if (!this.data.weeklyActivity) this.data.weeklyActivity = {};
      this.data.weeklyActivity[today] = (this.data.weeklyActivity[today] || 0) + 1;
    }
    
    // Instantly update the UI
    this.updateUI();

    try {
      const r = await fetch('http://localhost:3000/api/progress', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
      });
      if (r.ok) {
        this.data = await r.json();
        this.updateUI(); // run again to sync exactly with server truth
      }
    } catch(e) { console.warn('Progress save failed - using local optimistic data', e); }
  },
  updateUI() {
    renderDashboard();
    updateSkillsPage();
  }
};

function updateSkillsPage() {
  const data = ProgressManager.data;
  if (!data.skillProgress) return;
  Object.keys(skillDB).forEach(key => {
    const card = document.getElementById('skCard-' + key);
    if (!card) return;
    const s = skillDB[key];
    const completed = data.skillProgress[key] || 0;
    const total = s.steps.length;
    
    const ring = card.querySelector('.ring-fill');
    if (ring) {
      const offset = 100.5 - ((completed / total) * 100.5);
      ring.style.strokeDashoffset = offset;
    }

    const dotsDiv = card.querySelector('.sk-dots');
    if (dotsDiv) {
      let dotsHtml = '';
      for (let i = 0; i < total; i++) {
        dotsHtml += `<div class="sk-dot ${i < completed ? 'on' : ''}"></div>`;
      }
      dotsDiv.innerHTML = dotsHtml;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => ProgressManager.load());


function goPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.getElementById('nav-'+name).classList.add('active');
  window.scrollTo(0,0);
}

/* ═══════ LOGIN ═══════ */
function doLogin(){
  const n=document.getElementById('nameInput').value.trim();
  if(!n){showToast('Please enter your name 😊');return;}
  loginOk(n);
}
function doGuest(){loginOk('Explorer');}
function loginOk(name){
  document.getElementById('loginCard').style.display='none';
  document.getElementById('mainContent').style.display='block';
  document.getElementById('dashName').textContent=name.split(' ')[0];
  localStorage.setItem('cogniName',name);
  showToast('Welcome, '+name.split(' ')[0]+'! 🌟');
}
window.onload=()=>{
  const s=localStorage.getItem('cogniName');
  if(s){document.getElementById('loginCard').style.display='none';document.getElementById('mainContent').style.display='block';document.getElementById('dashName').textContent=s.split(' ')[0];}
  buildWeekChart();buildPatGrid();loadWRWords();loadQuizQ();loadBigCard();
  const quotes=["Every expert was once a beginner. Keep going!","You are braver than you believe!","Small steps every day lead to big changes!","Your brain grows stronger every practice session!","Learning is not a race. Go at your own speed. 💜"];
  document.getElementById('dashQuote').textContent='"'+quotes[Math.floor(Math.random()*quotes.length)]+'"';
};

/* ═══════ TTS ═══════ */
function speakText(t){
  if(!t)return;
  const u=new SpeechSynthesisUtterance(t);
  u.rate=0.9;u.pitch=1.1;
  speechSynthesis.cancel();speechSynthesis.speak(u);
  showToast('🔊 Reading aloud...');
}

/* ═══════ FONT ═══════ */
let dyslexOn=false;
function toggleFont(){
  dyslexOn=!dyslexOn;
  document.body.style.fontFamily=dyslexOn?"'OpenDyslexic',sans-serif":"'DM Sans',sans-serif";
  showToast(dyslexOn?'Dyslexic font on 🔡':'Default font on');
}

/* ═══════ TOAST ═══════ */
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}

/* ═══════ AI MODE ═══════ */
let mode='text';
function setMode(m){
  mode=m;
  ['text','voice','image','file'].forEach(x=>{
    const cap=x.charAt(0).toUpperCase()+x.slice(1);
    document.getElementById('mode'+cap).classList.toggle('active',x===m);
    document.getElementById('input'+cap).style.display=x===m?'block':'none';
  });
}

/* ═══════ STT ═══════ */
let rec=null;
function startListen(){
  if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){showToast('Voice not supported');return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  rec=new SR();rec.lang='en-IN';rec.continuous=true;rec.interimResults=true;
  rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;document.getElementById('voiceInput').value=t;};
  rec.start();
  document.getElementById('listenBtn').style.display='none';
  document.getElementById('stopBtn').style.display='inline-flex';
  document.getElementById('voiceActive').style.display='flex';
}
function stopListen(){
  if(rec)rec.stop();
  document.getElementById('listenBtn').style.display='inline-flex';
  document.getElementById('stopBtn').style.display='none';
  document.getElementById('voiceActive').style.display='none';
}
function onImgUpload(e){
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=ev=>{document.getElementById('imgPreviewEl').src=ev.target.result;document.getElementById('imgPreview').style.display='block';};
  r.readAsDataURL(f);
}
function onFileUpload(e){
  const f=e.target.files[0];if(!f)return;
  document.getElementById('fileName').textContent='📄 '+f.name+' — ready!';
  document.getElementById('fileInfo').style.display='block';
}

/* ═══════ AI HELPER ═══════ */
const MOCK={
  explain:["Here's how it works:\n1. Think of it like a storage box 📦\n2. The box holds one piece of info at a time\n3. Repeat to make the box bigger\n4. Practice every day to keep it strong!"],
  shorten:["Short version: Practice a little every day. That builds the strongest memories! 🎯"],
  example:["Real example:\nLearning to ride a bike 🚲 — hard at first, automatic after practice. That is exactly how memory works!"],
  quiz:["Quiz time!\n\nWhat helps memory the MOST?\nA) Sleeping well 😴\nB) Watching TV 📺\nC) Eating sugar 🍭\nD) Stressing out 😰\n\nHint: Your brain fixes itself during this activity!"],
  ask:["Great question! 🌟\n1. Your brain makes tiny paths when you learn\n2. Repeating walks that path again and again\n3. The path gets stronger each time\n4. That is how memory is built!"]
};
function getInput(){return mode==='text'?document.getElementById('aiInput').value:mode==='voice'?document.getElementById('voiceInput').value:'';}
async function askAI(type){
  const loading=document.getElementById('aiLoading');
  const resp=document.getElementById('aiResponse');
  const txt=document.getElementById('aiRespText');
  const input=getInput();
  loading.style.display='flex';resp.style.display='none';
  const prompts={
    explain:`Explain this simply for a student with learning difficulties: "${input||'memory'}". Use max 4 sentences, numbered steps.`,
    shorten:`Make this very short (2-3 sentences) for a young learner: "${input||'memory'}"`,
    example:`Give one simple real-life example to explain: "${input||'memory'}". Under 50 words. Relatable.`,
    quiz:`Create a simple 4-option MCQ about: "${input||'memory'}". Label A B C D. State the answer at end.`,
    ask:`Answer simply for a student who finds learning hard: "${input||'how does memory work?'}". Short sentences. Encouraging.`
  };
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,system:'Kind, patient AI tutor. Grade 3-4 reading level. Short sentences. Encouraging. No jargon. Under 150 words.',messages:[{role:'user',content:prompts[type]}]})});
    if(!res.ok)throw new Error();
    const d=await res.json();renderAIResp(d.content[0].text);
  }catch{
    await new Promise(r=>setTimeout(r,800));
    renderAIResp((MOCK[type]||MOCK.ask)[0]);
  }
}
function renderAIResp(text){
  const loading=document.getElementById('aiLoading');
  const resp=document.getElementById('aiResponse');
  const txt=document.getElementById('aiRespText');
  loading.style.display='none';resp.style.display='block';
  let html='',sc=0;
  text.split('\n').filter(l=>l.trim()).forEach(line=>{
    if(/^\d+[\.\)]/.test(line.trim())){
      sc++;const t=line.replace(/^\d+[\.\)]\s*/,'');
      html+=`<div class="step-item"><div class="step-n">${sc}</div><div style="font-size:14px;line-height:1.7;font-weight:300">${t}</div></div>`;
    } else {
      html+=`<p style="margin-bottom:8px;font-size:14px;line-height:1.8;font-weight:300">${line}</p>`;
    }
  });
  txt.innerHTML=html;showToast('✨ Answer ready!');
}

/* ═══════ HOME FLASHCARD ═══════ */
let homeFCFlip=false;
function flipHomeCard(){homeFCFlip=!homeFCFlip;document.getElementById('homeFC').classList.toggle('flipped',homeFCFlip);}
let memCount=2;
function memYes(){
  if(memCount<3){memCount++;const ps=document.querySelectorAll('#homeMem .brain-pip');ps.forEach((p,i)=>p.classList.toggle('lit',i<memCount));showToast('🧠 Stronger memory!');spawnConfetti(document.getElementById('homeMem'));}
  homeFCFlip=false;document.getElementById('homeFC').classList.remove('flipped');
}
function memNo(){homeFCFlip=false;document.getElementById('homeFC').classList.remove('flipped');showToast('No worries! Keep practicing 💪');}

/* ═══════ HOME QUIZ ═══════ */
let homeAnswered=false;
function ansHome(idx){
  if(homeAnswered)return;homeAnswered=true;
  const opts=document.querySelectorAll('#homeOpts .q-opt');
  opts[1].classList.add('correct');
  if(idx!==1)opts[idx].classList.add('wrong');
  if(idx===1){showToast('⭐ Correct! Amazing!');spawnConfetti(opts[1]);document.getElementById('streakPill').style.display='flex';document.getElementById('streakTxt').textContent='Correct! Keep it up! 🔥';}
  else showToast('Good try! Exercise helps memory most 💪');
  setTimeout(()=>{homeAnswered=false;opts.forEach(o=>o.classList.remove('correct','wrong'));},2500);
}

/* ═══════ SKILLS ═══════ */
const skillDB={
  puzzles:{name:'Puzzles',emoji:'🧩',steps:[
    {title:'What is a Pattern?',concept:'A pattern is something that repeats in a predictable way. Red, blue, red, blue, red — what comes next? Blue! Finding patterns is a superpower for your brain.',analogy:'Like zebra stripes 🦓 — always black, white, black, white!',visual:'🔴 🔵 🔴 🔵 🔴 ___?',type:'choice',q:'What comes next? 🔴🔵🔴🔵🔴___',opts:['🔴 Red','🔵 Blue','🟡 Yellow','🟢 Green'],correct:1},
  ]},
  reasoning:{name:'Reasoning Questions',emoji:'🧮',steps:[
    {title:'If–Then Thinking',concept:'Reasoning means figuring out what must be true. If all apples are fruits, and a Fuji is an apple — then a Fuji must be a fruit! We follow clues step by step.',analogy:'It is like being a detective 🔍 — gather the clues and find the answer!',visual:'🍎 Apple → 🍓 Fruit → 🎯 Fuji is a Fruit!',type:'choice',q:'If all birds have wings, and a sparrow is a bird — what must be true?',opts:['Sparrows can swim 🏊','Sparrows have wings ✅','All wings are birds','Sparrows have no legs'],correct:1},
    {title:'Odd One Out',concept:'Look at a group of things. Find the one that does NOT belong. Think about what makes the others similar — colour, shape, category — then remove the odd one!',analogy:'Like a puzzle piece that does not fit the box 🧩!',visual:'🍎 🍊 🍋 🚗 🍇',type:'choice',q:'Which is the odd one out? 🍎 🍊 🍋 🚗 🍇',opts:['🍎 Apple','🍊 Orange','🚗 Car ✅','🍇 Grapes'],correct:2},
    {title:'Number Sequences',concept:'Numbers can follow a pattern — adding, subtracting, or skipping by the same amount. Spot the rule, then predict the next number!',analogy:'Like steps on a staircase 🪜 — each step goes up by the same amount!',visual:'2 → 4 → 6 → 8 → ___?',type:'choice',q:'What comes next? 5, 10, 15, 20, ___',opts:['22','24','25 ✅','30'],correct:2},
    {title:'True or False Reasoning',concept:'Read a statement carefully. Use what you know to decide if it is TRUE or FALSE. Look for trick words like "always", "never", "all", or "some".',analogy:'Like a judge in a courtroom ⚖️ — weigh the evidence before deciding!',visual:'Statement → Evidence → Verdict ✅ or ❌',type:'choice',q:'All squares are rectangles. Is this TRUE or FALSE?',opts:['False — squares are different','True ✅ — squares have 4 right angles like rectangles','False — rectangles are bigger','True — all shapes are rectangles'],correct:1},
  ]},
  matchcard:{name:'Match the Card',emoji:'🃏',steps:[
    {title:'What is Visual Memory?',concept:'Visual memory is your brain\'s ability to remember what you see. When you flip a card and remember where its pair is hiding, that is visual memory at work!',analogy:'It is like a photo album in your brain 📸 — you can look back at what you saw!',visual:'🃏 ❓ → 🎵 → Remember where 🎵 is!',type:'choice',q:'Visual memory helps you remember:',opts:['Smells','What you have seen 👁️ ✅','How things taste','What you heard'],correct:1},
    {title:'Matching Pairs Strategy',concept:'When playing match-the-card, start from the corners. Turn two cards at a time and really focus on where each one was. Say the card name out loud to remember better!',analogy:'Like a library 📚 — everything has a place, you just have to learn where!',visual:'🔵 Top-left → 🔵 Bottom-right = Match! ✅',type:'choice',q:'Which strategy helps most when matching cards?',opts:['Flip randomly and hope','Focus and say card names aloud ✅','Close your eyes','Flip very fast'],correct:1},
    {title:'Concentration Technique',concept:'To improve at memory games, take a breath before each turn. Look carefully. Picture the card in your mind BEFORE flipping the next one. Slow and steady wins!',analogy:'Like a chess player ♟️ — think before you move!',visual:'Breathe → Look → Picture → Flip 🃏',type:'choice',q:'What helps most before flipping each card?',opts:['Guess quickly','Picture the card in your mind first ✅','Flip as fast as possible','Skip difficult pairs'],correct:1},
    {title:'Building Your Memory',concept:'Every time you play a memory matching game, your brain gets a tiny bit stronger. Scientists call this neuroplasticity — your brain literally changes and grows with practice!',analogy:'Like lifting weights 🏋️ — each practice session builds your brain\'s muscle!',visual:'🧠 Practice → Stronger Connections → Better Memory!',type:'choice',q:'What happens to your brain when you practice memory games?',opts:['Nothing changes','It gets tired and stops','It grows stronger ✅','It forgets faster'],correct:2},
  ]},
  wordrecall:{name:'Word Recall',emoji:'📝',steps:[
    {title:'How Word Memory Works',concept:'Your brain stores words in a special area. To recall a word, you retrace the path your brain made when you first learned it. The more you practise, the easier the path becomes!',analogy:'Like walking through a forest 🌲 — the more you walk the same path, the clearer it gets!',visual:'Learn 🌳 → Path forms → Recall 🌳 easily!',type:'choice',q:'Why does repeating a word help you remember it?',opts:['It writes the word on paper','It strengthens the brain path ✅','It erases old memories','It slows your thinking'],correct:1},
    {title:'Chunking Words Together',concept:'Grouping words by category makes them easier to remember. Instead of random words, group them: animals together, colours together, foods together. Your brain loves categories!',analogy:'Like organising a drawer 🗂️ — socks with socks, shirts with shirts!',visual:'🐘🦁🐬 = Animals | 🍎🍊🍋 = Fruits',type:'choice',q:'Which set of words would be easiest to remember?',opts:['Car, Cloud, Drum, Apple, Lamp','Dog, Cat, Tiger, Lion, Parrot ✅','Blue, Run, Three, Loud, Think','Jump, Slow, Hot, Long, Far'],correct:1},
    {title:'The Visualisation Trick',concept:'To remember a word, picture it vividly in your mind. If the word is "elephant", imagine a giant elephant dancing in your room! Strong, silly images stick in memory the best.',analogy:'The funnier and bigger the picture, the stronger the memory! 🐘🎪',visual:'Word: STAR → Picture: ⭐ shining on your head!',type:'choice',q:'Which image would best help you remember the word "OCEAN"?',opts:['Think of the letters O-C-E-A-N','Picture yourself swimming in deep blue waves 🌊 ✅','Write it 10 times','Look it up in a dictionary'],correct:1},
    {title:'Spaced Repetition',concept:'Don\'t try to memorise everything at once! Study a few words, rest, then review again. Each time you return to a word after a break, your memory of it grows stronger.',analogy:'Like watering a plant 🌱 — a little water every day is better than flooding it once!',visual:'Day 1: Learn → Day 2: Review → Day 4: Review → 💪',type:'choice',q:'What is the best way to memorise 10 new words?',opts:['Cram all 10 in one hour','Study, rest, and review over several days ✅','Never look at them again','Read them once very fast'],correct:1},
  ]},
};
let curSkill=null,curStep=0;
function openSkill(id){
  curSkill=id;curStep=0;
  ProgressManager.save({ skillsExplored: 1, activity: { emoji: skillDB[id].emoji, title: 'Started ' + skillDB[id].name, desc: 'Explored a new skill!' } });
  document.getElementById('skillsCat').style.display='none';
  document.getElementById('lessonView').style.display='block';
  document.getElementById('lessonBread').textContent=skillDB[id].name;
  document.getElementById('lessonEmoji').textContent=skillDB[id].emoji;
  renderStep();
}
function closeLesson(){
  document.getElementById('skillsCat').style.display='block';
  document.getElementById('lessonView').style.display='none';
}
function renderStep(){
  const d=skillDB[curSkill];const s=d.steps[curStep];
  document.getElementById('lessonTitle').textContent=s.title;
  document.getElementById('conceptTxt').textContent=s.concept;
  document.getElementById('analogyTxt').innerHTML='💡 '+s.analogy;
  document.getElementById('lessonVisual').textContent=s.visual;
  document.getElementById('lessonStepNum').textContent=curStep+1;
  document.getElementById('prevBtn').style.display=curStep===0?'none':'inline-flex';
  const pips=document.getElementById('stepPips');
  pips.innerHTML=d.steps.map((x,i)=>`<div class="step-pip ${i<curStep?'done':i===curStep?'now':''}"></div>`).join('');
  const z=document.getElementById('interactContent');
  document.getElementById('feedbackPanel').style.display='none';
  document.getElementById('hintPanel').style.display='none';
  if(s.type==='choice'){
    z.innerHTML=`<p style="font-size:14px;font-weight:500;margin-bottom:12px;color:var(--text)">${s.q}</p><div>${s.opts.map((o,i)=>`<button class="choice-opt" onclick="checkChoice(${i},${s.correct})">${o}</button>`).join('')}</div>`;
  } else if(s.type==='blank'){
    z.innerHTML=`<p style="font-size:14px;font-weight:500;margin-bottom:12px">${s.q}</p><div class="word-chips">${s.opts.map((o,i)=>`<button class="word-chip" onclick="checkBlank(this,${i===s.correct},'${o}')">${o}</button>`).join('')}</div>`;
  } else if(s.type==='order'){
    z.innerHTML=`<p style="font-size:14px;font-weight:500;margin-bottom:12px">${s.q}</p><div>${s.opts.map(o=>`<button class="choice-opt" onclick="this.classList.toggle('picked')">${o}</button>`).join('')}</div><button class="btn btn-primary btn-sm" style="margin-top:12px;border-radius:10px" onclick="checkOrder()">Check Order ✓</button>`;
  }
}
function checkChoice(idx,correct){
  const fb=document.getElementById('feedbackPanel');
  if(idx===correct){
    fb.className='feedback-panel ok';fb.style.display='block';fb.innerHTML='🎉 Correct! You are doing amazing!';spawnConfetti(fb);showToast('⭐ Correct!');
    ProgressManager.save({ skillId: curSkill, completedCount: curStep + 1 });
  }
  else{fb.className='feedback-panel hint';fb.style.display='block';fb.innerHTML='Good try! The answer was: <strong>'+skillDB[curSkill].steps[curStep].opts[correct]+'</strong>. You can do it! 💪';}
}
function checkBlank(btn,isRight,opt){
  btn.classList.add('used');const fb=document.getElementById('feedbackPanel');
  if(isRight){
    fb.className='feedback-panel ok';fb.style.display='block';fb.innerHTML='🎉 Perfect! "'+opt+'" is correct!';spawnConfetti(btn);
    ProgressManager.save({ skillId: curSkill, completedCount: curStep + 1 });
  }
  else{fb.className='feedback-panel hint';fb.style.display='block';fb.innerHTML='Good effort! Look for the word with "bh" in it 💡';}
}
function checkOrder(){
  const fb=document.getElementById('feedbackPanel');
  fb.className='feedback-panel ok';fb.style.display='block';
  fb.innerHTML='🎯 Well done for trying! The correct order is: Start → Turn → Stop. Commands always go in order!';
  ProgressManager.save({ skillId: curSkill, completedCount: curStep + 1 });
}
function showHint(){
  const s=skillDB[curSkill].steps[curStep];
  const h=document.getElementById('hintPanel');
  h.className='feedback-panel hint';h.style.display='block';
  h.innerHTML='💡 Hint: '+s.analogy;
}
function nextStep(){
  const d=skillDB[curSkill];
  if(curStep<d.steps.length-1){curStep++;renderStep();}
  else{
    showToast('🎉 Skill complete! Amazing!');
    ProgressManager.save({ activitiesDone: 1, activity: { emoji: d.emoji, title: 'Completed ' + d.name, desc: 'Mastered the skill levels!' } });
    spawnConfetti(document.getElementById('lessonView'));
    setTimeout(closeLesson,1800);
  }
}
function prevStep(){if(curStep>0){curStep--;renderStep();}}

/* ═══════ PRACTICE TABS ═══════ */
function switchTab(name,el){
  document.querySelectorAll('.prac-sec').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.tab-pill').forEach(b=>b.classList.remove('on'));
  document.getElementById('tab-'+name).classList.add('on');
  el.classList.add('on');
}
function fFilter(el,cat){
  document.querySelectorAll('.fchip').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');showToast('Showing '+cat+' cards 📇');
}

/* ═══════ BIG FLASHCARDS ═══════ */
const bigCards=[
  {e:'🎵',q:'What is a musical note?',a:'A musical note is a sound with a specific pitch. Each "la" when you sing is a note!'},
  {e:'🧠',q:'What is Working Memory?',a:'Working memory is your brain\'s sticky note — holds a few pieces of info for a short time!'},
  {e:'💻',q:'What does a loop do?',a:'A loop repeats the same command many times automatically! "Jump 5 times" instead of writing jump 5 times.'},
  {e:'🕉️',q:'What does "Bhur" mean in Gayatri Mantra?',a:'"Bhur" means the Earth — the physical world we live in!'},
  {e:'🧮',q:'In Vedic Math, which numbers go first?',a:'Add the BIG numbers first (tens), then the small ones (units). Much faster!'},
  {e:'🛒',q:'Why make a shopping list?',a:'It helps you remember everything you need and stay within budget!'},
  {e:'🔵',q:'What is a pattern?',a:'Something that repeats in order! Red, blue, red, blue — next is blue!'},
  {e:'🎵',q:'What is Tempo in music?',a:'Tempo is the speed of music. Fast = dance music. Slow = lullaby!'},
];
let bigIdx=0,bigFlip=false;
function flipBigCard(){bigFlip=!bigFlip;document.getElementById('bigFC').classList.toggle('flip',bigFlip);}
function loadBigCard(){
  const c=bigCards[bigIdx];
  document.getElementById('bigFCEmoji').textContent=c.e;
  document.getElementById('bigFCQ').textContent=c.q;
  document.getElementById('bigFCA').textContent=c.a;
  document.getElementById('cardCtr').textContent='Card '+(bigIdx+1)+' of '+bigCards.length;
  bigFlip=false;document.getElementById('bigFC').classList.remove('flip');
}
function nextCard(){bigIdx=(bigIdx+1)%bigCards.length;loadBigCard();}
function prevCard(){bigIdx=(bigIdx-1+bigCards.length)%bigCards.length;loadBigCard();}
function cardRemember(){
  showToast('🧠 Great! Neural pathway strengthened!');
  spawnConfetti(document.getElementById('bigFC'));
  const ps=document.querySelectorAll('#bigMem .mem-pip');
  let f=0;ps.forEach(p=>{if(p.classList.contains('lit'))f++;});
  if(f<5)ps[f].classList.add('lit');
  setTimeout(nextCard,600);
}
function cardAgain(){showToast('No problem! Repeat builds mastery 💪');nextCard();}

/* ═══════ QUIZ ═══════ */
const quizData=[
  {cat:'🧠 Memory',q:'How many items can working memory hold at once?',opts:['A — About 2-3 items','B — About 7 items','C — About 50 items','D — Unlimited'],correct:1,exp:'Working memory holds about 7 items. That is why phone numbers have 7 digits!'},
  {cat:'🎵 Music',q:'What is "tempo" in music?',opts:['A — Pitch of notes','B — Volume of sound','C — Speed of music','D — Type of instrument'],correct:2,exp:'Tempo is the speed! Fast tempo = energetic music. Slow = calm.'},
  {cat:'💻 Coding',q:'What does a LOOP do?',opts:['A — Stops the program','B — Repeats commands many times','C — Deletes code','D — Changes color'],correct:1,exp:'A loop repeats the same instruction automatically!'},
  {cat:'🧮 Vedic Math',q:'Using Vedic Math, what is 23 + 45?',opts:['A — 78','B — 58','C — 68','D — 88'],correct:2,exp:'20+40=60, then 3+5=8, total = 68! Add big numbers first!'},
  {cat:'🧩 Patterns',q:'What comes next? 🔴🔵🔴🔵🔴___',opts:['A — 🔴 Red','B — 🔵 Blue','C — 🟡 Yellow','D — 🟢 Green'],correct:1,exp:'Pattern is red-blue repeating, so blue comes next!'},
];
let qIdx=0,qStars=0,qAns=false,qTotal=0;
function loadQuizQ(){
  const q=quizData[qIdx%quizData.length];
  document.getElementById('qCat').textContent=q.cat;
  document.getElementById('qQuestion').textContent=q.q;
  document.getElementById('qOpts').innerHTML=q.opts.map((o,i)=>`<button class="q-opt" onclick="ansQuiz(${i})">${o}</button>`).join('');
  document.getElementById('qFeedback').style.display='none';
  document.getElementById('nextQBtn').style.display='none';
  qAns=false;
}
function ansQuiz(idx){
  if(qAns)return;qAns=true;qTotal++;
  const q=quizData[qIdx%quizData.length];
  const opts=document.querySelectorAll('#qOpts .q-opt');
  opts[q.correct].classList.add('correct');
  if(idx!==q.correct)opts[idx].classList.add('wrong');
  document.getElementById('qCount').textContent=qTotal;
  const fb=document.getElementById('qFeedback');fb.style.display='block';
  if(idx===q.correct){qStars++;document.getElementById('qStars').textContent='⭐ '+qStars;fb.className='feedback-panel ok';fb.innerHTML='🎉 Correct! '+q.exp;spawnConfetti(opts[q.correct]);showToast('⭐ +1 Star!');}
  else{fb.className='feedback-panel hint';fb.innerHTML='Good try! '+q.exp+' You can do it next time! 💪';}
  document.getElementById('nextQBtn').style.display='block';
}
function nextQuizQ(){qIdx++;loadQuizQ();}

/* ═══════ PATTERN GAME ═══════ */
let patSeq=[],patUser=[],patShow=false,patScore=0,patLen=3;
const patEmojis=['🔵','🔴','🟡','🟢','🟣','🟠','⚪','🔶'];
function buildPatGrid(){
  const g=document.getElementById('patGrid');g.innerHTML='';
  for(let i=0;i<16;i++){
    const t=document.createElement('div');t.className='p-tile';
    t.dataset.i=i;t.textContent=patEmojis[i%8];
    t.onclick=()=>tapPat(i);g.appendChild(t);
  }
}
function startPattern(){
  patSeq=[];patUser=[];patLen=3;patScore=0;
  document.getElementById('patScore').textContent='0';
  document.getElementById('patBtn').style.display='none';
  document.getElementById('patFeedback').style.display='none';
  genPatSeq();
}
function genPatSeq(){
  patSeq=[];document.getElementById('patLevel').textContent='Level '+patLen;
  for(let i=0;i<patLen;i++)patSeq.push(Math.floor(Math.random()*16));
  patUser=[];showPatSeq();
}
async function showPatSeq(){
  patShow=true;
  const tiles=document.querySelectorAll('.p-tile');
  tiles.forEach(t=>t.style.pointerEvents='none');
  await new Promise(r=>setTimeout(r,600));
  for(const idx of patSeq){
    tiles[idx].classList.add('flash');
    await new Promise(r=>setTimeout(r,500));
    tiles[idx].classList.remove('flash');
    await new Promise(r=>setTimeout(r,200));
  }
  patShow=false;tiles.forEach(t=>t.style.pointerEvents='auto');
}
function tapPat(idx){
  if(patShow)return;
  const tiles=document.querySelectorAll('.p-tile');
  patUser.push(idx);const pos=patUser.length-1;
  if(patUser[pos]===patSeq[pos]){
    tiles[idx].classList.add('hit');setTimeout(()=>tiles[idx].classList.remove('hit'),300);
    if(patUser.length===patSeq.length){
      patScore++;document.getElementById('patScore').textContent=patScore;patLen++;
      showToast('🎉 Perfect! Level up!');spawnConfetti(document.getElementById('patGrid'));
      ProgressManager.save({ skillId: 'matchcard', completedCount: 4, activitiesDone: 1, activity: { emoji: '🃏', title: 'Pattern Streak', desc: 'Reached level ' + patLen } });
      setTimeout(genPatSeq,1000);
    }
  } else {
    tiles[idx].classList.add('miss');setTimeout(()=>tiles[idx].classList.remove('miss'),400);
    const fb=document.getElementById('patFeedback');
    fb.className='feedback-panel hint';fb.style.display='block';
    fb.innerHTML='Good try! You got '+patUser.length+' tiles right. Let\'s try again! 💪';
    document.getElementById('patBtn').style.display='inline-flex';
    document.getElementById('patBtn').textContent='▶ Try Again';
  }
}

/* ═══════ WORD RECALL ═══════ */
const wrSets=[
  [{w:'🌳 Tree'},{w:'🎵 Music'},{w:'🏡 Home'},{w:'📚 Book'},{w:'☀️ Sun'}],
  [{w:'🐘 Elephant'},{w:'🍎 Apple'},{w:'⭐ Star'},{w:'🚂 Train'},{w:'🌊 Wave'}],
];
let wrSet=[],wrAnswers=[];
function loadWRWords(){
  wrSet=wrSets[Math.floor(Math.random()*wrSets.length)];
  document.getElementById('wrList').innerHTML=wrSet.map(w=>`<div class="wr-tile">${w.w}</div>`).join('');
}
function startWordRecall(){
  document.getElementById('wrStudy').style.display='none';
  document.getElementById('wrRecall').style.display='block';
  wrAnswers=[];document.getElementById('wrAnswers').innerHTML='';
  document.getElementById('wrFeedback').style.display='none';
}
function addWord(){
  const inp=document.getElementById('wrInput');
  const v=inp.value.trim().toLowerCase();if(!v)return;
  wrAnswers.push(v);inp.value='';
  const d=document.getElementById('wrAnswers');
  const chip=document.createElement('div');
  chip.className='word-chip';chip.style.opacity='1';chip.textContent=v;
  d.appendChild(chip);
}
function checkWords(){
  const fb=document.getElementById('wrFeedback');let found=0;
  wrSet.forEach(w=>{
    const base=w.w.split(' ').slice(-1)[0].toLowerCase();
    if(wrAnswers.includes(base)||wrAnswers.some(a=>base.includes(a)||a.includes(base)))found++;
  });
  fb.className='feedback-panel '+(found>=3?'ok':'hint');fb.style.display='block';
  fb.innerHTML=found>=3?'🎉 Brilliant! You remembered '+found+' of 5 words! Neural pathway locked in!':'Great effort! You remembered '+found+' of 5. The words were: '+wrSet.map(w=>w.w.split(' ')[0]).join(' ')+'. Keep practicing! 💪';
  if(found>=3){
    spawnConfetti(fb);showToast('🧠 Neural Champion!');
    ProgressManager.save({ skillId: 'wordrecall', completedCount: 4, activitiesDone: 1, activity: { emoji: '📝', title: 'Word Champion', desc: 'Remembered ' + found + ' words!' } });
  }
  setTimeout(()=>{document.getElementById('wrStudy').style.display='block';document.getElementById('wrRecall').style.display='none';loadWRWords();fb.style.display='none';},3000);
}

/* ═══════ DASHBOARD ═══════ */
function buildWeekChart(weeklyActivity){
  const chart=document.getElementById('weekChart');
  const weekVals = [];
  const weekDays = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
    weekVals.push(weeklyActivity[dateStr] || 0);
    weekDays.push(dayStr);
  }
  const max=Math.max(...weekVals, 5);
  chart.innerHTML=weekVals.map((v,i)=>`
    <div class="w-bar">
      <div class="w-val">${v}</div>
      <div class="w-fill" style="height:${Math.round((v/max)*90)+8}px"></div>
      <div class="w-label">${weekDays[i]}</div>
    </div>
  `).join('');
}

function renderCognitiveProfile(data) {
  const getPct = (key) => {
    const s = skillDB[key];
    if (!s) return 0;
    const completed = data.skillProgress[key] || 0;
    return Math.round((completed / s.steps.length) * 100) || 0;
  };

  const logicScore = Math.round((getPct('puzzles') + getPct('reasoning')) / 2) || 0;
  const memoryScore = Math.round((getPct('matchcard') + getPct('wordrecall')) / 2) || 0;

  const profDiv = document.getElementById('cognitiveProfile');
  if (!profDiv) return;

  profDiv.innerHTML = `
    <div class="card" style="margin-bottom:24px;">
      
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;font-weight:700;">
          <span style="color:var(--cyan)">🧩 Logic & Reasoning (Left Brain)</span>
          <span>${logicScore}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${logicScore}%;background:var(--cyan)"></div></div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">Derived from Puzzles & Reasoning Modules</div>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px;font-weight:700;">
          <span style="color:var(--gold)">🃏 Memory Retention (Right Brain)</span>
          <span>${memoryScore}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${memoryScore}%;background:var(--gold)"></div></div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:6px;">Derived from Match the Card & Word Recall</div>
      </div>

    </div>
  `;
}

function countUp(el,target,dur){
  let s=0;const step=Math.ceil(target/30);
  const iv=setInterval(()=>{s+=step;if(s>=target){el.textContent=target;clearInterval(iv);return;}el.textContent=s;},dur/30);
}
function renderDashboard() {
  const data = ProgressManager.data;
  const sStr = data.dayStreak > 0 ? data.dayStreak : 1;
  const statsHtml = `
      <div class="stat-box">
        <span class="stat-ico">🧠</span>
        <span class="stat-n cyan" id="sSk">0</span>
        <span class="stat-l">Skills Explored</span>
      </div>
      <div class="stat-box">
        <span class="stat-ico">⭐</span>
        <span class="stat-n gold" id="sStars">0</span>
        <span class="stat-l">Stars Collected</span>
      </div>
      <div class="stat-box">
        <span class="stat-ico">🔥</span>
        <span class="stat-n violet" id="sStr">0</span>
        <span class="stat-l">Day Streak</span>
      </div>
      <div class="stat-box">
        <span class="stat-ico">✅</span>
        <span class="stat-n mint" id="sAct">0</span>
        <span class="stat-l">Activities Done</span>
      </div>
  `;
  document.getElementById('dashStats').innerHTML = statsHtml;
  setTimeout(()=>{
    countUp(document.getElementById('sSk'), data.skillsExplored || 0, 800);
    countUp(document.getElementById('sStars'), data.starsCollected || 0, 800);
    countUp(document.getElementById('sStr'), sStr, 800);
    countUp(document.getElementById('sAct'), data.activitiesDone || 0, 800);
  }, 200);

  buildWeekChart(data.weeklyActivity || {});
  renderCognitiveProfile(data);

  let highestSkill = null;
  let lowestSkill = null;
  let maxPct = -1;
  let minPct = 101;
  const activeKeys = Object.keys(skillDB);
  
  activeKeys.forEach(key => {
    const s = skillDB[key];
    const completed = data.skillProgress[key] || 0;
    const pct = Math.round((completed / s.steps.length) * 100) || 0;
    
    if (pct > maxPct) { maxPct = pct; highestSkill = s; }
    if (pct < minPct) { minPct = pct; lowestSkill = s; }
  });

  const insightsDiv = document.getElementById('parentalInsights');
  if (data.skillsExplored === 0) {
    insightsDiv.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);font-size:14px">Allow your learner to explore some skills to generate real-time cognitive insights! 🌱</div>`;
  } else {
    insightsDiv.innerHTML = `
      <div class="card" style="margin-bottom:12px;background:linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 255, 224, 0.05) 100%); border-left: 4px solid var(--cyan);">
        <div style="font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px">
          ${highestSkill.emoji} Strongest Area: ${highestSkill.name}
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,0.8)">
          The learner shows excellent aptitude in this area (${maxPct}% mastered)! This builds great confidence.
        </div>
      </div>
      <div class="card" style="background:linear-gradient(135deg, rgba(245, 200, 66, 0.05) 0%, rgba(255, 94, 143, 0.05) 100%); border-left: 4px solid var(--gold);">
         <div style="font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px">
          🎯 Focus Recommended: ${lowestSkill.name}
        </div>
        <div style="font-size:14px;color:rgba(255,255,255,0.8)">
          We recommend a 5-minute session in <strong>${lowestSkill.name}</strong> to balance their cognitive development.
        </div>
      </div>
    `;
  }

  let skillsHtml = '';
  Object.keys(skillDB).forEach(key => {
    const s = skillDB[key];
    const completed = data.skillProgress[key] || 0;
    const total = s.steps.length;
    const pct = Math.round((completed / total) * 100) || 0;
    skillsHtml += `
    <div class="sk-prog-item">
      <span class="sk-prog-ico">${s.emoji}</span>
      <div class="sk-prog-info">
        <div class="sk-prog-name">${s.name}</div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <span class="sk-prog-pct">${pct}%</span>
    </div>`;
  });
  document.getElementById('dashSkills').innerHTML = skillsHtml;

  let actHtml = '';
  const recent = data.recentActivity || [];
  if (recent.length === 0) {
    actHtml = `<div style="color:var(--muted);font-size:13px;padding:12px;text-align:center">No recent activity yet. Start exploring skills!</div>`;
  } else {
    recent.forEach(act => {
      let tStr = "Just now";
      if(act.time) {
        const diff = Math.floor((new Date() - new Date(act.time))/60000);
        if(diff > 1440) tStr = Math.floor(diff/1440) + "d ago";
        else if(diff > 60) tStr = Math.floor(diff/60) + "h ago";
        else if(diff > 0) tStr = diff + "m ago";
      }
      actHtml += `
      <div class="act-item">
        <div class="act-dot">${act.emoji}</div>
        <div class="act-body"><strong>${act.title}</strong><br><span>${act.desc}</span></div>
        <div class="act-time">${tStr}</div>
      </div>`;
    });
  }
  document.getElementById('actFeed').innerHTML = actHtml;
}

document.getElementById('nav-dashboard').addEventListener('click',()=>{
  renderDashboard();
});

/* ═══════ CONFETTI ═══════ */
function spawnConfetti(el){
  const r=el.getBoundingClientRect();
  const cols=['#00d4ff','#00ffe0','#f5c842','#ff5e8f','#7c3aed'];
  for(let i=0;i<22;i++){
    const p=document.createElement('div');p.className='cf-piece';
    p.style.cssText=`left:${r.left+Math.random()*r.width}px;top:${r.top+20}px;background:${cols[i%5]};transform:rotate(${Math.random()*360}deg);animation-delay:${Math.random()*0.3}s`;
    document.body.appendChild(p);setTimeout(()=>p.remove(),1100);
  }
}

/* ═══════════════════════════════════════════
   INTERACTIVE MODULES — MATH & PUZZLE
═══════════════════════════════════════════ */

/* ── Shared globals ── */
let globalXP = 0;
let mathCompleted = false;
let puzzleCompleted = false;

function addGlobalXP(n){
  globalXP += n;
  ProgressManager.save({ starsCollected: Math.floor(n/10) || 1, activity: { emoji:'⭐', title:'Earned XP', desc: `Earned ${n} XP in practice module!` } });
  const badge = document.getElementById('globalXP');
  badge.textContent = '⭐ ' + globalXP + ' XP';
  badge.classList.add('visible');
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
  if(mathCompleted && puzzleCompleted) showChampionBanner();
}

function showChampionBanner(){
  const b = document.getElementById('championBanner');
  b.style.display = 'block';
  b.onclick = () => b.style.display='none';
  spawnIQConfetti();
}

function spawnIQConfetti(){
  const cols = ['#00d4ff','#00ffe0','#f5c842','#ff5e8f','#7c3aed'];
  for(let i=0;i<30;i++){
    const d = document.createElement('div');
    d.className = 'iq-confetti-dot';
    d.style.cssText = `left:${Math.random()*100}vw;bottom:80px;background:${cols[i%5]};animation-delay:${Math.random()*.5}s;animation-duration:${.8+Math.random()*.6}s`;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(), 1500);
  }
}

/* ── Module open / close ── */
function openSkillModule(moduleId){
  document.getElementById('skillsCat').style.display = 'none';
  document.getElementById('lessonView').style.display  = 'none';
  document.getElementById('mathModule').classList.remove('active');
  document.getElementById('puzzleModule').classList.remove('active');
  document.getElementById(moduleId).classList.add('active');
  document.getElementById(moduleId).scrollIntoView({behavior:'smooth',block:'start'});
}

function closeModule(moduleId){
  document.getElementById(moduleId).classList.remove('active');
  document.getElementById('skillsCat').style.display = 'block';
  window.scrollTo({top: document.getElementById('page-skills').offsetTop, behavior:'smooth'});
}

function launchPuzzleFromCompletion(){
  closeModule('mathModule');
  setTimeout(()=>{ startPuzzleModule(); }, 400);
}

/* ════════════════════════════════════════
   MATH QUESTIONS MODULE
════════════════════════════════════════ */
const mathQuestions = [
  {
    level: 1, lvClass:'',
    visual: () => {
      let h = '';
      for(let i=0;i<5;i++) h += `<span class="iq-apple">🍎</span>`;
      return h;
    },
    question: 'If you have 3 apples and someone gives you 2 more, how many apples do you have?',
    opts: ['A) 4','B) 5','C) 6','D) 3'],
    correct: 1,
    fact: '🎉 Great job! Addition means combining groups together!'
  },
  {
    level: 2, lvClass:'lv2',
    visual: () => {
      let h = '<div class="iq-num-row">';
      for(let i=1;i<=12;i++){
        const classes = (i%2===0?'even':'') + (i===10?' active':'');
        h += `<div class="iq-num-dot ${classes}">${i}</div>`;
      }
      h += '</div>';
      return h;
    },
    question: 'What number comes next in this pattern? 2, 4, 6, 8, ___',
    opts: ['A) 9','B) 10','C) 11','D) 12'],
    correct: 1,
    fact: '✨ You found the pattern! These are called even numbers.'
  },
  {
    level: 3, lvClass:'lv3',
    visual: () => {
      let h = '<div class="iq-star-rows">';
      for(let r=0;r<3;r++){
        h += '<div class="iq-star-row">';
        for(let c=0;c<4;c++) h += '<span class="iq-star">⭐</span>';
        h += '</div>';
      }
      h += '</div>';
      return h;
    },
    question: 'There are 3 rows of stars with 4 stars in each row. How many stars are there in total?',
    opts: ['A) 7','B) 10','C) 12','D) 14'],
    correct: 2,
    fact: '🌟 Multiplication is just fast adding! 3 × 4 = 12'
  },
  {
    level: 4, lvClass:'lv4',
    visual: () => `
      <svg class="iq-clock" viewBox="0 0 90 90">
        <circle class="clock-face" cx="45" cy="45" r="40"/>
        <text x="45" y="18" text-anchor="middle" font-size="9" fill="rgba(0,212,255,0.5)" font-family="Syne">12</text>
        <text x="45" y="76" text-anchor="middle" font-size="9" fill="rgba(0,212,255,0.5)" font-family="Syne">6</text>
        <text x="14" y="49" text-anchor="middle" font-size="9" fill="rgba(0,212,255,0.5)" font-family="Syne">9</text>
        <text x="76" y="49" text-anchor="middle" font-size="9" fill="rgba(0,212,255,0.5)" font-family="Syne">3</text>
        <line class="clock-hour" x1="45" y1="45" x2="45" y2="22" style="transform:rotate(60deg)"/>
        <line class="clock-minute" x1="45" y1="45" x2="45" y2="16"/>
        <circle cx="45" cy="45" r="3" fill="var(--cyan)"/>
      </svg>
      <span style="font-size:1rem;color:var(--muted);font-weight:300">2:00 PM → ?</span>`,
    question: 'A movie starts at 2:00 PM and lasts 1 hour 30 minutes. What time does it end?',
    opts: ['A) 3:00 PM','B) 3:30 PM','C) 4:00 PM','D) 2:30 PM'],
    correct: 1,
    fact: '⏰ Time math is used every day — great thinking!'
  },
  {
    level: 5, lvClass:'lv5',
    visual: () => `
      <svg class="iq-pie" viewBox="0 0 36 36">
        <circle class="iq-pie-bg" cx="18" cy="18" r="15.9" stroke-width="16"/>
        <circle class="iq-pie-half" cx="18" cy="18" r="15.9" pathLength="100"/>
        <circle class="iq-pie-used" cx="18" cy="18" r="15.9" pathLength="100"/>
      </svg>
      <span style="font-size:.95rem;color:var(--muted);font-weight:300;text-align:center">Pink = half given away, Cyan = 3 used</span>`,
    question: 'Maya has 20 stickers. She gives half to her friend and then uses 3 herself. How many does she have left?',
    opts: ['A) 10','B) 8','C) 7','D) 9'],
    correct: 2,
    fact: '🧠 Two steps — first divide, then subtract. You\'re a problem solver!'
  }
];

let mathIdx = 0, mathXPEarned = 0, mathAnswered = false;

function startMathModule(){
  mathIdx = 0; mathXPEarned = 0; mathAnswered = false;
  openSkillModule('mathModule');
  document.getElementById('mathComplete').style.display = 'none';
  document.getElementById('mathNextBtn').style.display = 'none';
  renderMathQ();
}

function renderMathQ(){
  const q = mathQuestions[mathIdx];
  // Top bar
  document.getElementById('mathQNum').textContent = `Question ${mathIdx+1} of 5`;
  document.getElementById('mathBarFill').style.width = (mathIdx/5*100)+'%';
  const lb = document.getElementById('mathLevel');
  lb.textContent = 'Level '+q.level;
  lb.className = 'iq-level-badge ' + q.lvClass;
  document.getElementById('mathXP').textContent = '⭐ '+mathXPEarned+' XP';
  // Visual
  document.getElementById('mathVisual').innerHTML = typeof q.visual === 'function' ? q.visual() : q.visual;
  // Question
  document.getElementById('mathQText').textContent = q.question;
  // Options
  const optsEl = document.getElementById('mathOpts');
  optsEl.innerHTML = q.opts.map((o,i)=>`<button class="iq-opt" onclick="answerMath(${i})">${o}</button>`).join('');
  // Fun fact
  document.getElementById('mathFunFact').style.display='none';
  document.getElementById('mathNextBtn').style.display='none';
  mathAnswered = false;
}

function answerMath(idx){
  if(mathAnswered) return;
  mathAnswered = true;
  const q = mathQuestions[mathIdx];
  const opts = document.querySelectorAll('#mathOpts .iq-opt');
  opts.forEach(o=>o.disabled=true);
  opts[q.correct].classList.add('correct');
  if(idx !== q.correct){
    opts[idx].classList.add('wrong');
  } else {
    mathXPEarned += 10;
    document.getElementById('mathXP').textContent = '⭐ '+mathXPEarned+' XP';
    const xpEl = document.getElementById('mathXP');
    xpEl.classList.remove('pop'); void xpEl.offsetWidth; xpEl.classList.add('pop');
    addGlobalXP(10);
    spawnConfetti(opts[q.correct]);
  }
  const ff = document.getElementById('mathFunFact');
  ff.textContent = q.fact;
  ff.style.display = 'block';
  document.getElementById('mathNextBtn').style.display = 'inline-block';
}

function mathNext(){
  mathIdx++;
  if(mathIdx < mathQuestions.length){
    renderMathQ();
  } else {
    // Completion
    document.getElementById('mathBarFill').style.width = '100%';
    document.getElementById('mathFunFact').style.display='none';
    document.getElementById('mathNextBtn').style.display='none';
    document.getElementById('mathQText').innerHTML='';
    document.getElementById('mathOpts').innerHTML='';
    document.getElementById('mathVisual').innerHTML='';
    document.getElementById('mathXPEarned').textContent = '🎉 You earned '+mathXPEarned+' XP this session!';
    document.getElementById('mathComplete').style.display = 'block';
    mathCompleted = true;
    spawnIQConfetti();
  }
}

/* ════════════════════════════════════════
   PUZZLE MODULE
════════════════════════════════════════ */
const puzzles = [
  {
    level:1, lvClass:'', label:'Level 1',
    instruction:'👁️ Tap the shape that does NOT belong in this group!',
    render: renderPuzzle1,
    fact:'Great eye! The square is different — it has corners, circles don\'t 🔵'
  },
  {
    level:2, lvClass:'lv2', label:'Level 2',
    instruction:'🌙 Which emoji completes the pattern?',
    render: renderPuzzle2,
    fact:'Patterns repeat — once you see it, you can predict what comes next 🌙'
  },
  {
    level:3, lvClass:'lv3', label:'Level 3',
    instruction:'🎯 Match each shape to its shadow! Tap a shape then tap its shadow.',
    render: renderPuzzle3,
    fact:'Matching shapes builds visual thinking — a superpower of the brain! 🧠'
  },
  {
    level:4, lvClass:'lv4', label:'Level 4',
    instruction:'🌱 Tap the steps in the correct order! 1 → 2 → 3 → 4',
    render: renderPuzzle4,
    fact:'Sequencing is how our brain organises stories and plans 🌸'
  },
  {
    level:5, lvClass:'lv5', label:'Level 5',
    instruction:'🃏 Flip the cards and find the matching pairs!',
    render: renderPuzzle5,
    fact:'Memory games literally strengthen your hippocampus — the brain\'s memory center! 🌟'
  }
];

let puzzleIdx = 0, puzzleXPEarned = 0, puzzleDone = false;

function startPuzzleModule(){
  puzzleIdx = 0; puzzleXPEarned = 0; puzzleDone = false;
  openSkillModule('puzzleModule');
  document.getElementById('puzzleComplete').style.display='none';
  document.getElementById('puzzleNextBtn').style.display='none';
  renderPuzzle();
}

function renderPuzzle(){
  const p = puzzles[puzzleIdx];
  document.getElementById('puzzleQNum').textContent = `Puzzle ${puzzleIdx+1} of 5`;
  document.getElementById('puzzleBarFill').style.width = (puzzleIdx/5*100)+'%';
  const lb = document.getElementById('puzzleLevel');
  lb.textContent = p.label;
  lb.className = 'iq-level-badge '+p.lvClass;
  document.getElementById('puzzleXP').textContent='⭐ '+puzzleXPEarned+' XP';
  document.getElementById('puzzleInstruction').textContent = p.instruction;
  document.getElementById('puzzleFunFact').style.display='none';
  document.getElementById('puzzleNextBtn').style.display='none';
  p.render();
}

function puzzleMarkDone(){
  puzzleXPEarned += 15;
  document.getElementById('puzzleXP').textContent='⭐ '+puzzleXPEarned+' XP';
  const xpEl=document.getElementById('puzzleXP');
  xpEl.classList.remove('pop');void xpEl.offsetWidth;xpEl.classList.add('pop');
  addGlobalXP(15);
  const ff=document.getElementById('puzzleFunFact');
  ff.textContent=puzzles[puzzleIdx].fact;
  ff.style.display='block';
  document.getElementById('puzzleNextBtn').style.display='inline-block';
}

function puzzleNext(){
  puzzleIdx++;
  if(puzzleIdx < puzzles.length){
    renderPuzzle();
  } else {
    document.getElementById('puzzleBarFill').style.width='100%';
    document.getElementById('puzzleFunFact').style.display='none';
    document.getElementById('puzzleNextBtn').style.display='none';
    document.getElementById('puzzleInstruction').textContent='';
    document.getElementById('puzzleArea').innerHTML='';
    document.getElementById('puzzleXPEarned').textContent='🎉 You earned '+puzzleXPEarned+' XP this session!';
    document.getElementById('puzzleComplete').style.display='block';
    puzzleCompleted = true;
    spawnIQConfetti();
  }
}

/* ── Puzzle 1 — Odd Shape Out ── */
function renderPuzzle1(){
  const area=document.getElementById('puzzleArea');
  const shapes=[
    {cls:'circle',lbl:''},
    {cls:'circle',lbl:''},
    {cls:'square',lbl:''},
    {cls:'circle',lbl:''},
    {cls:'circle',lbl:''}
  ];
  area.innerHTML=`<div class="iq-shape-row">${shapes.map((s,i)=>
    `<div class="iq-shape ${s.cls}" id="shape${i}" onclick="pickShape(${i},${s.cls==='square'})">${s.lbl}</div>`
  ).join('')}</div>`;
}
function pickShape(i, isOdd){
  const shapes=document.querySelectorAll('.iq-shape');
  if(isOdd){
    shapes[i].classList.add('correct-pick');
    shapes.forEach((s,j)=>{if(j!==i)s.classList.add('dim');});
    puzzleMarkDone();
    spawnConfetti(shapes[i]);
  } else {
    shapes[i].classList.add('wrong-pick');
    setTimeout(()=>shapes[i].classList.remove('wrong-pick'),600);
    showToast('Look for the shape that\'s different!');
  }
}

/* ── Puzzle 2 — Emoji Pattern ── */
function renderPuzzle2(){
  const area=document.getElementById('puzzleArea');
  const seq=['🌞','🌙','🌞','🌙','🌞'];
  area.innerHTML=`
    <div class="iq-emoji-row">
      ${seq.map(e=>`<div class="iq-emoji-tile">${e}</div>`).join('')}
      <div class="iq-emoji-tile blank" id="patBlank">?</div>
    </div>
    <div class="iq-emoji-opts">
      ${['🌙','🌞','⭐','🌈'].map((e,i)=>`<div class="iq-emoji-opt" onclick="pickEmoji('${e}',${i===0})">${e}</div>`).join('')}
    </div>`;
}
function pickEmoji(e, isCorrect){
  if(isCorrect){
    const blank=document.getElementById('patBlank');
    blank.classList.remove('blank');
    blank.textContent=e;
    blank.classList.add('filled');
    puzzleMarkDone();
    spawnConfetti(blank);
  } else {
    showToast('Think about what comes after 🌞...');
  }
}

/* ── Puzzle 3 — Shadow Match ── */
const shadowData=[
  {id:'star',  emoji:'⭐', shadow:'★'},
  {id:'heart', emoji:'❤️', shadow:'♥'},
  {id:'tri',   emoji:'🔺', shadow:'▲'}
];
let selectedShape3=null, matchedCount3=0;
function renderPuzzle3(){
  const area=document.getElementById('puzzleArea');
  const shuffledShadows=[...shadowData].sort(()=>Math.random()-.5);
  area.innerHTML=`
    <div class="iq-match-row" id="shapeRow3">
      ${shadowData.map(s=>`<div class="iq-match-tile" id="sh_${s.id}" data-id="${s.id}" onclick="pickShapeM('${s.id}')">${s.emoji}</div>`).join('')}
    </div>
    <div class="iq-match-divider"></div>
    <div class="iq-match-row" id="shadowRow3">
      ${shuffledShadows.map(s=>`<div class="iq-match-tile shadow" id="sdw_${s.id}" data-id="${s.id}" onclick="pickShadowM('${s.id}')">${s.shadow}</div>`).join('')}
    </div>`;
  selectedShape3=null; matchedCount3=0;
}
function pickShapeM(id){
  document.querySelectorAll('#shapeRow3 .iq-match-tile').forEach(t=>t.classList.remove('selected'));
  const el=document.getElementById('sh_'+id);
  if(!el.classList.contains('matched')){ el.classList.add('selected'); selectedShape3=id; }
}
function pickShadowM(id){
  if(!selectedShape3) return;
  const shadowEl=document.getElementById('sdw_'+id);
  if(shadowEl.classList.contains('matched')) return;
  if(id===selectedShape3){
    document.getElementById('sh_'+id).classList.remove('selected'); document.getElementById('sh_'+id).classList.add('matched');
    shadowEl.classList.add('matched');
    matchedCount3++;
    selectedShape3=null;
    if(matchedCount3===3){ puzzleMarkDone(); spawnIQConfetti(); }
  } else {
    shadowEl.classList.add('wrong-pick'); setTimeout(()=>shadowEl.classList.remove('wrong-pick'),600);
    document.querySelector('#shapeRow3 .selected')?.classList.remove('selected');
    selectedShape3=null;
    showToast('Not quite — try another shadow!');
  }
}

/* ── Puzzle 4 — Sequence Order ── */
const seqItems=[
  {id:0,emoji:'🌱',label:'Seed in soil',correct:1},
  {id:1,emoji:'💧',label:'Water the plant',correct:2},
  {id:2,emoji:'🌿',label:'Sprout grows',correct:3},
  {id:3,emoji:'🌸',label:'Full flower',correct:4}
];
let seqTapOrder=[], seqDone=false;
function renderPuzzle4(){
  seqTapOrder=[]; seqDone=false;
  const shuffled=[...seqItems].sort(()=>Math.random()-.5);
  const area=document.getElementById('puzzleArea');
  area.innerHTML=`<div class="iq-seq-row">${shuffled.map(s=>
    `<div class="iq-seq-tile" id="seq${s.id}" onclick="tapSeq(${s.id},${s.correct})">
      ${s.emoji}
      <span class="seq-num" id="seqnum${s.id}" style="display:none"></span>
    </div>`
  ).join('')}</div><div id="seqMsg" style="font-size:13px;color:var(--muted);margin-top:8px;text-align:center"></div>`;
}
function tapSeq(id,correct){
  if(seqDone) return;
  const tile=document.getElementById('seq'+id);
  if(tile.classList.contains('numbered')) return;
  const n=seqTapOrder.length+1;
  seqTapOrder.push({id,correct,n});
  tile.classList.add('numbered');
  document.getElementById('seqnum'+id).textContent=n;
  document.getElementById('seqnum'+id).style.display='block';
  if(seqTapOrder.length===4){
    seqDone=true;
    const isRight=seqTapOrder.every(s=>s.n===s.correct);
    if(isRight){
      document.querySelectorAll('.iq-seq-tile').forEach(t=>t.classList.add('completed'));
      puzzleMarkDone(); spawnIQConfetti();
    } else {
      document.getElementById('seqMsg').textContent='Almost! Think about the order a plant grows. Tap Reset to try again.';
      setTimeout(()=>{ seqTapOrder=[]; seqDone=false; document.querySelectorAll('.iq-seq-tile').forEach(t=>{t.classList.remove('numbered');const n=t.querySelector('.seq-num');if(n)n.style.display='none';}); document.getElementById('seqMsg').textContent=''; }, 2000);
    }
  }
}

/* ── Puzzle 5 — Memory Flip ── */
const flipEmojis=['🦁','🐘','🦋','🐬','🌈','🎯'];
let flipCards=[], flipFirst=null, flipLock=false, flipMatched=0;
function renderPuzzle5(){
  flipFirst=null; flipLock=false; flipMatched=0;
  const deck=[...flipEmojis,...flipEmojis].sort(()=>Math.random()-.5);
  flipCards=deck.map((e,i)=>({emoji:e,idx:i,matched:false}));
  const area=document.getElementById('puzzleArea');
  area.innerHTML=`
    <div class="iq-match-count" id="matchCount">Matched: 0 / 6</div>
    <div class="iq-flip-grid">
      ${deck.map((e,i)=>`
        <div class="iq-flip-card" id="fc${i}" onclick="flipCard(${i})">
          <div class="iq-flip-inner">
            <div class="iq-flip-front">?</div>
            <div class="iq-flip-back">${e}</div>
          </div>
        </div>`).join('')}
    </div>`;
}
function flipCard(i){
  if(flipLock) return;
  const cardEl=document.getElementById('fc'+i);
  if(cardEl.classList.contains('flipped')||cardEl.classList.contains('matched')) return;
  cardEl.classList.add('flipped');
  if(!flipFirst){
    flipFirst=i;
  } else {
    flipLock=true;
    const a=flipFirst, b=i;
    flipFirst=null;
    if(flipCards[a].emoji===flipCards[b].emoji){
      document.getElementById('fc'+a).classList.add('matched');
      document.getElementById('fc'+b).classList.add('matched');
      flipMatched++;
      document.getElementById('matchCount').textContent='Matched: '+flipMatched+' / 6';
      spawnConfetti(document.getElementById('fc'+a));
      flipLock=false;
      if(flipMatched===6){ puzzleMarkDone(); spawnIQConfetti(); }
    } else {
      setTimeout(()=>{
        document.getElementById('fc'+a).classList.remove('flipped');
        document.getElementById('fc'+b).classList.remove('flipped');
        flipLock=false;
      },1000);
    }
  }
}

/* ════════════════════════════════════════
   MATCH THE CARD MODULE
════════════════════════════════════════ */
const matchRounds = [
  { level: 1, lvClass:'', label: 'Level 1', time: 60, pairs: ['🐶','🐱','🐸','🐭'] },
  { level: 2, lvClass:'lv2', label: 'Level 2', time: 75, pairs: ['🍕','🍦','🍩','🍓','🌮','🥑'] },
  { level: 3, lvClass:'lv3', label: 'Level 3', time: 90, pairs: ['⚽','🎸','🚀','🌈','🎯','🦋','🔥','💎'] },
  { level: 4, lvClass:'lv4', label: 'Level 4', time: 120, pairs: ['🧠','🌙','🎭','🦁','🌺','🎪','🔮','🎨','🏆','⚡'] }
];

let matchIdx = 0, matchXPEarned = 0, matchDone = false;
let matchCards = [], matchFirst = null, matchLock = false, matchCount = 0;
let matchTimerInterval = null, matchTimeLeft = 0;

function startMatchModule(){
  matchIdx = 0; matchXPEarned = 0; matchDone = false;
  openSkillModule('matchModule');
  document.getElementById('matchComplete').style.display='none';
  document.getElementById('matchNextBtn').style.display='none';
  renderMatchRound();
}

function renderMatchRound(){
  clearInterval(matchTimerInterval);
  const r = matchRounds[matchIdx];
  document.getElementById('matchQNum').textContent = `Round ${matchIdx+1} of 4`;
  document.getElementById('matchBarFill').style.width = (matchIdx/4*100)+'%';
  
  const lb = document.getElementById('matchLevel');
  lb.textContent = r.label;
  lb.className = 'iq-level-badge ' + r.lvClass;
  document.getElementById('matchXP').textContent='⭐ '+matchXPEarned+' XP';
  
  let gridClass = 'match-grid-2x4';
  if(r.level === 2) gridClass = 'match-grid-3x4';
  if(r.level === 3) gridClass = 'match-grid-4x4';
  if(r.level === 4) gridClass = 'match-grid-4x5';

  const deck = [...r.pairs, ...r.pairs].sort(()=>Math.random()-0.5);
  matchCards = deck.map((e,i)=>({ emoji:e, idx:i, matched:false }));
  matchFirst = null; matchLock = false; matchCount = 0;
  
  document.getElementById('matchPairCount').textContent = `Matched: 0 / ${r.pairs.length}`;
  
  const area = document.getElementById('matchArea');
  area.innerHTML = `
    <div class="iq-flip-grid ${gridClass}">
      ${deck.map((e,i)=>`
        <div class="iq-flip-card-match" id="mc${i}" onclick="flipMatchCard(${i})">
          <div class="iq-flip-inner-match">
            <div class="iq-flip-front-match">C</div>
            <div class="iq-flip-back-match">${e}</div>
          </div>
        </div>`).join('')}
    </div>`;
  
  matchTimeLeft = r.time;
  updateMatchTimerDisplay();
  matchTimerInterval = setInterval(()=>{
    matchTimeLeft--;
    updateMatchTimerDisplay();
    if(matchTimeLeft <= 0){
      clearInterval(matchTimerInterval);
      handleMatchTimeout();
    }
  }, 1000);
}

function updateMatchTimerDisplay(){
  document.getElementById('matchTimer').textContent = `⏳ ${matchTimeLeft}s`;
}

function handleMatchTimeout(){
  matchLock = true;
  document.getElementById('matchCompleteTitle').textContent = "Time's Up!";
  matchRoundOver();
}

function flipMatchCard(i){
  if(matchLock) return;
  const cardEl = document.getElementById('mc'+i);
  if(cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
  
  cardEl.classList.add('flipped');
  
  if(matchFirst === null){
    matchFirst = i;
  } else {
    matchLock = true;
    const a = matchFirst, b = i;
    matchFirst = null;
    
    if(matchCards[a].emoji === matchCards[b].emoji){
      document.getElementById('mc'+a).classList.add('matched');
      document.getElementById('mc'+b).classList.add('matched');
      matchCards[a].matched = true; matchCards[b].matched = true;
      matchCount++;
      document.getElementById('matchPairCount').textContent = `Matched: ${matchCount} / ${matchRounds[matchIdx].pairs.length}`;
      spawnConfetti(cardEl);
      
      if(matchCount === matchRounds[matchIdx].pairs.length){
        clearInterval(matchTimerInterval);
        setTimeout(matchRoundOver, 600);
      } else {
        matchLock = false;
      }
    } else {
      document.getElementById('mc'+a).classList.add('wrong-match');
      document.getElementById('mc'+b).classList.add('wrong-match');
      setTimeout(()=>{
        document.getElementById('mc'+a).classList.remove('flipped', 'wrong-match');
        document.getElementById('mc'+b).classList.remove('flipped', 'wrong-match');
        matchLock = false;
      }, 900);
    }
  }
}

function matchRoundOver(){
  const xpGain = matchCount * 5; 
  matchXPEarned += xpGain;
  document.getElementById('matchXP').textContent='⭐ '+matchXPEarned+' XP';
  addGlobalXP(xpGain);
  
  document.getElementById('matchNextBtn').style.display='inline-block';
  if(matchCount === matchRounds[matchIdx].pairs.length){
     document.getElementById('matchInstruction').textContent = "Round Compete! Great visual memory!";
     spawnIQConfetti();
  } else {
     document.getElementById('matchInstruction').textContent = "Round Over! Try to remember faster next time.";
  }
}

function matchNext(){
  matchIdx++;
  if(matchIdx < matchRounds.length){
    document.getElementById('matchNextBtn').style.display='none';
    document.getElementById('matchInstruction').textContent = "";
    document.getElementById('matchCompleteTitle').textContent = "Round Complete!";
    renderMatchRound();
  } else {
    document.getElementById('matchBarFill').style.width='100%';
    document.getElementById('matchNextBtn').style.display='none';
    document.getElementById('matchTimer').textContent = "";
    document.getElementById('matchPairCount').textContent = "";
    document.getElementById('matchArea').innerHTML='';
    document.getElementById('matchXPEarned').textContent='🎉 You earned '+matchXPEarned+' XP total in Match the Card!';
    document.getElementById('matchCompleteTitle').textContent = "Champion Round Complete!";
    document.getElementById('matchInstruction').textContent = "";
    document.getElementById('matchComplete').style.display='block';
    spawnIQConfetti();
  }
}

/* ════════════════════════════════════════
   WORD RECALL MODULE
════════════════════════════════════════ */
const wrRounds = [
  { level: 1, lvClass:'', label: 'Level 1', time: 10, words: ['SUN','CAT','BALL'], distractors: ['MOON','DOG','TREE'], fact: 'Short-term memory can hold about 7 items — you\'re training yours! 🌟' },
  { level: 2, lvClass:'lv2', label: 'Level 2', time: 12, words: ['RIVER','CLOUD','BREAD','HORSE'], distractors: ['OCEAN','RAIN','CAKE','COW'], fact: 'Repeating words in your mind during study helps memory stick! 💡' },
  { level: 3, lvClass:'lv3', label: 'Level 3', time: 15, words: ['CASTLE','LANTERN','COMPASS','WHISPER','CRYSTAL'], distractors: ['TOWER','CANDLE','MAP','SECRET','DIAMOND'], fact: 'Focus helps the brain remember faster — notice the details! 🎨' },
  { level: 4, lvClass:'lv4', label: 'Level 4', time: 18, words: ['NEBULA','PHANTOM','LANTERN','MIRAGE','THUNDER','SOLSTICE'], distractors: ['GALAXY','SHADOW','CANDLE','ILLUSION','LIGHTNING','ECLIPSE'], fact: 'You just trained your working memory — the brain\'s mental sticky note! 🧠✨' }
];

let wrIdx = 0, wrXPEarned = 0, wrStudyTimer = null, wrTimeLeft = 0;
let wrSelected = [], wrCorrectCount = 0;

function startWordRecallModule(){
  wrIdx = 0; wrXPEarned = 0;
  openSkillModule('wordrecallModule');
  document.getElementById('wrComplete').style.display='none';
  document.getElementById('wrNextBtn').style.display='none';
  renderWRStudy();
}

function renderWRStudy(){
  const r = wrRounds[wrIdx];
  document.getElementById('wrQNum').textContent = `Round ${wrIdx+1} of 4`;
  document.getElementById('wrBarFill').style.width = (wrIdx/4*100)+'%';
  
  const lb = document.getElementById('wrLevel');
  lb.textContent = r.label;
  lb.className = 'iq-level-badge ' + r.lvClass;
  document.getElementById('wrXP').textContent='⭐ '+wrXPEarned+' XP';
  
  document.getElementById('wrPhaseStudy').style.display = 'block';
  document.getElementById('wrPhaseRecall').style.display = 'none';
  document.getElementById('wrFunFact').style.display = 'none';
  document.getElementById('wrNextBtn').style.display = 'none';
  
  const area = document.getElementById('wrStudyArea');
  area.innerHTML = r.words.map((w,i)=>`<div class="word-pill study-mode" style="animation-delay:${i*0.15}s">${w}</div>`).join('');
  
  wrTimeLeft = r.time;
  document.getElementById('wrStudyTimer').textContent = `⏳ ${wrTimeLeft}s left to study`;
  
  clearInterval(wrStudyTimer);
  wrStudyTimer = setInterval(()=>{
    wrTimeLeft--;
    document.getElementById('wrStudyTimer').textContent = `⏳ ${wrTimeLeft}s left to study`;
    if(wrTimeLeft <= 0){
      clearInterval(wrStudyTimer);
      startWRRecall();
    }
  }, 1000);
}

function startWRRecall(){
  document.getElementById('wrPhaseStudy').style.display = 'none';
  document.getElementById('wrPhaseRecall').style.display = 'block';
  wrSelected = [];
  wrCorrectCount = 0;
  
  const r = wrRounds[wrIdx];
  const allWords = [...r.words, ...r.distractors].sort(()=>Math.random()-0.5);
  
  const area = document.getElementById('wrRecallArea');
  area.innerHTML = allWords.map((w,i)=>`<div class="word-pill recall-opt" id="wropt${i}" onclick="selectWRWord(${i}, '${w}', ${r.words.includes(w)})">${w}</div>`).join('');
}

function selectWRWord(i, word, isCorrect){
  const el = document.getElementById('wropt'+i);
  if(el.classList.contains('recall-selected')) return;
  
  el.classList.add('recall-selected');
  wrSelected.push(word);
  
  if(isCorrect){
    el.classList.add('correct');
    wrCorrectCount++;
    addGlobalXP(5);
    wrXPEarned += 5;
    document.getElementById('wrXP').textContent='⭐ '+wrXPEarned+' XP';
    spawnConfetti(el);
  } else {
    el.classList.add('wrong');
  }
  
  const r = wrRounds[wrIdx];
  if(wrSelected.length >= r.words.length){
    finishWRRound();
  }
}

function finishWRRound(){
  const r = wrRounds[wrIdx];
  const allOpts = document.querySelectorAll('.recall-opt');
  allOpts.forEach(el => {
    el.style.pointerEvents = 'none';
    const text = el.textContent;
    if(r.words.includes(text) && !el.classList.contains('correct')){
        el.classList.add('missed');
    }
  });
  
  const ff = document.getElementById('wrFunFact');
  ff.textContent = r.fact;
  ff.style.display = 'block';
  
  document.getElementById('wrNextBtn').style.display = 'inline-block';
  
  if(wrCorrectCount === r.words.length){
      addGlobalXP(20);
      wrXPEarned += 20;
      document.getElementById('wrXP').textContent='⭐ '+wrXPEarned+' XP';
      spawnIQConfetti();
  }
}

function wrNext(){
  wrIdx++;
  if(wrIdx < wrRounds.length){
    renderWRStudy();
  } else {
    document.getElementById('wrBarFill').style.width='100%';
    document.getElementById('wrPhaseStudy').style.display = 'none';
    document.getElementById('wrPhaseRecall').style.display = 'none';
    document.getElementById('wrFunFact').style.display = 'none';
    document.getElementById('wrNextBtn').style.display = 'none';
    
    document.getElementById('wrXPEarned').textContent='🎉 You earned '+wrXPEarned+' XP total in Word Recall!';
    document.getElementById('wrComplete').style.display='block';
    spawnIQConfetti();
  }
}

/* ── Wire skill cards to modules ── */
// Override openSkill for 'puzzles' and 'reasoning' to launch modules
const _origOpenSkill = openSkill;
window.openSkill = function(id){
  if(id==='puzzles'){ startPuzzleModule(); return; }
  if(id==='reasoning'){ startMathModule(); return; }
  if(id==='matchcard'){ startMatchModule(); return; }
  if(id==='wordrecall'){ startWordRecallModule(); return; }
  _origOpenSkill(id);
};
