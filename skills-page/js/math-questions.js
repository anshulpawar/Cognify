// MATH MODULE LOGIC & GLOBAL XP
let totalXP = 0;
let challengesCompleted = 0;

window.addXP = function(amount) {
  totalXP += amount;
  const xpValue = document.getElementById('xpValue');
  const badge = document.getElementById('xpBadge');
  
  if (xpValue && badge) {
    // Animate counter
    let current = parseInt(xpValue.innerText);
    const target = totalXP;
    const inc = Math.max(1, Math.floor((target - current) / 10));
    
    const timer = setInterval(() => {
      current += inc;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      xpValue.innerText = current;
    }, 30);
    
    // Pop animation
    badge.classList.remove('pop');
    void badge.offsetWidth; // trigger reflow
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

document.addEventListener('DOMContentLoaded', () => {
  // Module references
  const startMathBtn = document.getElementById('startMathBtn');
  const mathModule = document.getElementById('mathModule');
  
  // Math Qs Data
  const mathQuestions = [
    {
      level: 1, color: 'cyan', title: 'Beginner', 
      visualHtml: `<div style="display:flex;gap:5px" class="animate-float">
                     <span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span>
                     <span style="margin:0 15px">+</span>
                     <span style="font-size:40px">🍎</span><span style="font-size:40px">🍎</span>
                   </div>`,
      text: "If you have 3 apples and someone gives you 2 more, how many apples do you have?",
      options: ["A) 4", "B) 5", "C) 6", "D) 3"],
      correctIdx: 1,
      fact: "Great job! Addition means combining groups together 🎉"
    },
    {
      level: 2, color: 'green', title: 'Easy',
      visualHtml: `<div style="width:100%;max-width:300px;height:4px;background:rgba(255,255,255,0.2);position:relative;border-radius:2px">
                     <div style="position:absolute;left:10%;top:-10px;width:24px;height:24px;background:var(--green);border-radius:50%;box-shadow:0 0 10px var(--green);animation:bounce 1s infinite"></div>
                     <div style="display:flex;justify-content:space-between;margin-top:15px;font-size:16px;font-weight:700"><span>2</span><span>4</span><span>6</span><span>8</span><span>?</span></div>
                   </div>`,
      text: "What number comes next in this pattern? 2, 4, 6, 8, ___",
      options: ["A) 9", "B) 10", "C) 11", "D) 12"],
      correctIdx: 1,
      fact: "You found the pattern! These are called even numbers ✨"
    },
    {
      level: 3, color: 'gold', title: 'Medium',
      visualHtml: `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;animation:pulse-scale 2s infinite alternate">
                     <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                     <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                     <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
                   </div>`,
      text: "There are 3 rows of stars with 4 stars in each row. How many stars are there in total?",
      options: ["A) 7", "B) 10", "C) 12", "D) 14"],
      correctIdx: 2,
      fact: "Multiplication is just fast adding! 3 × 4 = 12 🌟"
    },
    {
      level: 4, color: 'orange', title: 'Intermediate',
      visualHtml: `<svg width="80" height="80" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="45" fill="none" stroke="var(--orange)" stroke-width="4"/>
                     <line x1="50" y1="50" x2="50" y2="20" stroke="var(--text-main)" stroke-width="4" stroke-linecap="round"/>
                     <line x1="50" y1="50" x2="70" y2="70" stroke="var(--orange)" stroke-width="6" stroke-linecap="round" style="--target-angle:45deg; transform-origin:50px 50px; animation: draw-clock-hand 2s ease forwards"/>
                   </svg>`,
      text: "A movie starts at 2:00 PM and lasts 1 hour 30 minutes. What time does it end?",
      options: ["A) 3:00 PM", "B) 3:30 PM", "C) 4:00 PM", "D) 2:30 PM"],
      correctIdx: 1,
      fact: "Time math is used every day — great thinking! ⏰"
    },
    {
      level: 5, color: 'violet', title: 'Challenging',
      visualHtml: `<svg width="80" height="80" viewBox="0 0 32 32" style="transform: rotate(-90deg)">
                     <circle r="16" cx="16" cy="16" fill="var(--violet)" opacity="0.3"/>
                     <circle r="16" cx="16" cy="16" fill="transparent" stroke="var(--violet)" stroke-width="32" stroke-dasharray="100 100" style="--target-offset:35; animation: draw-pie 2s ease forwards"/>
                   </svg>`,
      text: "Maya has 20 stickers. She gives half to her friend and then uses 3 herself. How many does she have left?",
      options: ["A) 10", "B) 8", "C) 7", "D) 9"],
      correctIdx: 2,
      fact: "Two steps — first divide, then subtract. You're a problem solver! 🧠"
    }
  ];

  let currentMathIdx = 0;

  function renderMathQuestion(idx) {
    if (idx >= mathQuestions.length) return renderMathCompletion();
    
    const q = mathQuestions[idx];
    const pct = ((idx) / 5) * 100;
    
    mathModule.innerHTML = `
      <div class="module-header fade-in">
        <div class="module-progress-text">Question ${idx + 1} of 5</div>
        <div class="module-level-badge lvl-${q.level}">Level ${q.level} — ${q.title}</div>
      </div>
      
      <div class="mod-progress-bar fade-in">
        <div class="mod-progress-fill" style="width: ${pct}%"></div>
      </div>
      
      <div class="question-area fade-in">
        <div class="question-visual">${q.visualHtml}</div>
        <div class="question-text">${q.text}</div>
      </div>
      
      <div class="options-grid fade-in" id="mathOptions">
        ${q.options.map((opt, i) => `
          <button class="option-btn btn-ripple" onclick="selectMathOption(${i}, ${q.correctIdx}, '${q.fact}')">
            ${opt} <span class="option-icon"></span>
          </button>
        `).join('')}
      </div>
      
      <div class="fun-fact-bubble" id="mathFactBubble"></div>
      
      <div class="next-action-area" id="mathNextArea">
        <button class="btn btn-primary" onclick="nextMathQ()">Next Question →</button>
      </div>
    `;
    
    setTimeout(() => {
      const fill = mathModule.querySelector('.mod-progress-fill');
      if (fill) fill.style.width = `${((idx + 1) / 5) * 100}%`;
    }, 100);
  }

  window.selectMathOption = function(selectedIdx, correctIdx, factText) {
    const opts = document.querySelectorAll('#mathOptions .option-btn');
    const bubble = document.getElementById('mathFactBubble');
    const nextArea = document.getElementById('mathNextArea');
    
    opts.forEach(btn => btn.style.pointerEvents = 'none');
    
    if (selectedIdx === correctIdx) {
      opts[selectedIdx].classList.add('correct');
      opts[selectedIdx].querySelector('.option-icon').innerHTML = '✓';
      window.addXP(10);
      window.checkCompletion();
      bubble.innerHTML = `✨ ${factText}`;
      bubble.classList.add('show');
      nextArea.classList.add('show');
    } else {
      opts[selectedIdx].classList.add('wrong');
      opts[selectedIdx].querySelector('.option-icon').innerHTML = '✗';
      setTimeout(() => {
        opts[selectedIdx].classList.remove('wrong');
        opts.forEach(btn => btn.style.pointerEvents = 'auto');
      }, 600);
    }
  };

  window.nextMathQ = function() {
    currentMathIdx++;
    renderMathQuestion(currentMathIdx);
  };

  function renderMathCompletion() {
    mathModule.innerHTML = `
      <div style="text-align:center; padding:40px 20px" class="fade-in">
        <div style="font-size:60px; margin-bottom:20px; animation:bounce 2s infinite">🏆</div>
        <h2 style="font-family:var(--font-heading); font-size:32px; margin-bottom:15px; color:var(--cyan)">Math Mastery Complete!</h2>
        <p style="color:var(--text-muted); font-size:18px; margin-bottom:30px">You earned 50 XP and leveled up your mathematical reasoning.</p>
        <button class="btn btn-primary" onclick="document.getElementById('startPuzzleBtn').scrollIntoView({behavior:'smooth'})">Try Puzzles Next →</button>
      </div>
    `;
    document.getElementById('tracker-step2').classList.add('active');
  }

  if (startMathBtn) {
    startMathBtn.addEventListener('click', () => {
      mathModule.style.display = 'block';
      setTimeout(() => {
        mathModule.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderMathQuestion(0);
      }, 100);
    });
  }
});
