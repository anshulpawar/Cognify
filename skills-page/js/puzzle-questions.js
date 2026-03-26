// PUZZLE MODULE LOGIC
document.addEventListener('DOMContentLoaded', () => {
  const startPuzzleBtn = document.getElementById('startPuzzleBtn');
  const puzzleModule = document.getElementById('puzzleModule');

  const puzzleQuestions = [
    {
      level: 1, color: 'cyan', title: 'Beginner',
      text: "Tap the shape that does NOT belong in this group!",
      type: 'odd-one',
      fact: "Great eye! The square is different — it has corners, circles don't 🔵"
    },
    {
      level: 2, color: 'green', title: 'Easy',
      text: "Which emoji completes the pattern?",
      type: 'pattern',
      fact: "Patterns repeat — once you see it, you can predict what comes next 🌙"
    },
    {
      level: 3, color: 'gold', title: 'Medium',
      text: "Match each shape to its shadow! Tap the correct pair.",
      type: 'shadow',
      fact: "Matching shapes builds visual thinking — a superpower of the brain! 🧠"
    },
    {
      level: 4, color: 'orange', title: 'Intermediate',
      text: "Arrange these steps in the correct order! Tap them 1, 2, 3, 4.",
      type: 'sequence',
      fact: "Sequencing is how our brain organises stories and plans 🌸"
    },
    {
      level: 5, color: 'violet', title: 'Challenging',
      text: "Flip the cards and find the matching pairs! Remember what you saw.",
      type: 'memory',
      fact: "Memory games literally grow your hippocampus — the brain's memory center! 🌟"
    }
  ];

  let currentPuzzleIdx = 0;

  function renderPuzzle(idx) {
    if (idx >= puzzleQuestions.length) return renderPuzzleCompletion();

    const p = puzzleQuestions[idx];
    const pct = ((idx) / 5) * 100;

    puzzleModule.innerHTML = `
      <div class="module-header fade-in">
        <div class="module-progress-text">Puzzle ${idx + 1} of 5</div>
        <div class="module-level-badge lvl-${p.level}">Level ${p.level} — ${p.title}</div>
      </div>
      
      <div class="mod-progress-bar fade-in">
        <div class="mod-progress-fill" style="width: ${pct}%"></div>
      </div>
      
      <div class="puzzle-instruction fade-in">${p.text}</div>
      
      <div class="puzzle-stage fade-in" id="puzzleStage"></div>
      
      <div class="fun-fact-bubble" id="puzzleFactBubble"></div>
      
      <div class="next-action-area" id="puzzleNextArea">
        <button class="btn btn-puzzle" onclick="nextPuzzle()">Next Puzzle →</button>
      </div>
    `;

    setTimeout(() => {
      const fill = puzzleModule.querySelector('.mod-progress-fill');
      if (fill) fill.style.width = `${((idx + 1) / 5) * 100}%`;
    }, 100);

    const stage = document.getElementById('puzzleStage');

    if (p.type === 'odd-one') renderOddOne(stage);
    if (p.type === 'pattern') renderPattern(stage);
    if (p.type === 'shadow') renderShadow(stage);
    if (p.type === 'sequence') renderSequence(stage);
    if (p.type === 'memory') renderMemory(stage);
  }

  function showPuzzleSuccess() {
    window.addXP(15);
    window.checkCompletion();
    const factBubble = document.getElementById('puzzleFactBubble');
    factBubble.innerHTML = `✨ ${puzzleQuestions[currentPuzzleIdx].fact}`;
    factBubble.classList.add('show');

    const nextArea = document.getElementById('puzzleNextArea');
    nextArea.classList.add('show');
  }

  // == PUZZLE 1: Odd One Out ==
  function renderOddOne(container) {
    container.innerHTML = `
      <div class="shape-row">
        <div class="puzzle-shape circle btn-ripple" onclick="handleOddOne(this, false)"></div>
        <div class="puzzle-shape circle btn-ripple" onclick="handleOddOne(this, false)"></div>
        <div class="puzzle-shape square btn-ripple" onclick="handleOddOne(this, true)"></div>
        <div class="puzzle-shape circle btn-ripple" onclick="handleOddOne(this, false)"></div>
        <div class="puzzle-shape circle btn-ripple" onclick="handleOddOne(this, false)"></div>
      </div>
    `;
  }

  window.handleOddOne = function (el, isCorrect) {
    if (isCorrect) {
      el.classList.add('selected-correct');
      el.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#050d1f;font-size:32px">✓</div>';
      const shapes = document.querySelectorAll('.puzzle-shape');
      shapes.forEach(s => { if (s !== el) s.classList.add('dimmed'); });
      showPuzzleSuccess();
    } else {
      el.classList.add('selected-wrong');
      setTimeout(() => el.classList.remove('selected-wrong'), 500);
    }
  };

  // == PUZZLE 2: Complete the Pattern ==
  function renderPattern(container) {
    container.innerHTML = `
      <div class="pattern-row">
        <span>🌞</span><span>🌙</span><span>🌞</span><span>🌙</span><span>🌞</span>
        <div class="pattern-blank" id="patBlank">?</div>
      </div>
      <div class="shape-row" id="patOptions">
        <button class="option-btn btn-ripple" onclick="handlePat(this, '🌙', true)">🌙</button>
        <button class="option-btn btn-ripple" onclick="handlePat(this, '🌞', false)">🌞</button>
        <button class="option-btn btn-ripple" onclick="handlePat(this, '⭐', false)">⭐</button>
        <button class="option-btn btn-ripple" onclick="handlePat(this, '🌈', false)">🌈</button>
      </div>
    `;
  }

  window.handlePat = function (btn, emoji, isCorrect) {
    if (isCorrect) {
      const blank = document.getElementById('patBlank');
      blank.classList.add('filled');
      blank.innerHTML = emoji;
      btn.classList.add('correct');
      document.getElementById('patOptions').style.pointerEvents = 'none';
      showPuzzleSuccess();
    } else {
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 500);
    }
  };

  // == PUZZLE 3: Shadow Match ==
  let shadowSelected = null;
  let shadowMatches = 0;
  function renderShadow(container) {
    shadowMatches = 0;
    container.innerHTML = `
      <div class="shadow-wrapper">
        <div class="shadow-row" id="shadowShapes">
          <div class="match-tile btn-ripple" data-shape="star" onclick="selectShadowShape(this)">⭐</div>
          <div class="match-tile btn-ripple" data-shape="heart" onclick="selectShadowShape(this)">❤️</div>
          <div class="match-tile btn-ripple" data-shape="tri" onclick="selectShadowShape(this)">🔺</div>
        </div>
        <div class="shadow-row" id="shadowTargets">
          <div class="match-tile shadow" data-shape="heart" onclick="selectShadowTarget(this)">❤️</div>
          <div class="match-tile shadow" data-shape="tri" onclick="selectShadowTarget(this)">🔺</div>
          <div class="match-tile shadow" data-shape="star" onclick="selectShadowTarget(this)">⭐</div>
        </div>
      </div>
    `;
  }

  window.selectShadowShape = function (el) {
    if (el.classList.contains('matched')) return;
    document.querySelectorAll('#shadowShapes .match-tile').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    shadowSelected = el;
  };

  window.selectShadowTarget = function (el) {
    if (!shadowSelected || el.classList.contains('matched')) return;

    if (shadowSelected.dataset.shape === el.dataset.shape) {
      el.classList.add('matched');
      shadowSelected.classList.add('matched');
      shadowSelected.classList.remove('active');
      el.innerHTML = shadowSelected.innerHTML;
      el.style.textShadow = 'none';
      el.style.color = '#fff';

      shadowMatches++;
      shadowSelected = null;
      if (shadowMatches >= 3) {
        showPuzzleSuccess();
      }
    } else {
      el.style.animation = 'shake 0.5s ease';
      setTimeout(() => el.style.animation = '', 500);
    }
  };

  // == PUZZLE 4: Sequence Order ==
  let seqExpected = 1;
  function renderSequence(container) {
    seqExpected = 1;
    container.innerHTML = `
      <div class="sequence-grid">
        <div class="seq-tile btn-ripple" onclick="handleSeq(this, 3)">
          <div class="seq-graphic">🌿</div>
          <div style="font-weight:600">Sprout</div>
        </div>
        <div class="seq-tile btn-ripple" onclick="handleSeq(this, 1)">
          <div class="seq-graphic">🌱</div>
          <div style="font-weight:600">Seed</div>
        </div>
        <div class="seq-tile btn-ripple" onclick="handleSeq(this, 4)">
          <div class="seq-graphic">🌸</div>
          <div style="font-weight:600">Flower</div>
        </div>
        <div class="seq-tile btn-ripple" onclick="handleSeq(this, 2)">
          <div class="seq-graphic">💧</div>
          <div style="font-weight:600">Watering</div>
        </div>
      </div>
    `;
  }

  window.handleSeq = function (el, order) {
    if (el.classList.contains('numbered')) return;

    if (order === seqExpected) {
      el.classList.add('numbered');
      el.innerHTML += `<div class="seq-badge">${order}</div>`;
      seqExpected++;
      if (seqExpected > 4) {
        showPuzzleSuccess();
      }
    } else {
      el.style.animation = 'shake 0.5s ease';
      setTimeout(() => el.style.animation = '', 500);
    }
  };

  // == PUZZLE 5: Memory Flip ==
  let firstFlipped = null;
  let secondFlipped = null;
  let memMatches = 0;
  function renderMemory(container) {
    memMatches = 0;
    const emojis = ['🦁', '🦁', '🐘', '🐘', '🦋', '🦋', '🐬', '🐬', '🌈', '🌈', '🎯', '🎯'];
    emojis.sort(() => 0.5 - Math.random()); // simple shuffle

    let html = '<div class="memory-grid">';
    emojis.forEach((emoji) => {
      html += `
        <div class="mem-card" data-emoji="${emoji}" onclick="handleMem(this)">
          <div class="mem-face mem-back">?</div>
          <div class="mem-face mem-front">${emoji}</div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }

  window.handleMem = function (el) {
    if (el.classList.contains('flipped') || secondFlipped) return;

    el.classList.add('flipped');

    if (!firstFlipped) {
      firstFlipped = el;
    } else {
      secondFlipped = el;
      if (firstFlipped.dataset.emoji === secondFlipped.dataset.emoji) {
        setTimeout(() => {
          firstFlipped.classList.add('matched');
          secondFlipped.classList.add('matched');
          firstFlipped = null;
          secondFlipped = null;
          memMatches++;
          if (memMatches >= 6) {
            showPuzzleSuccess();
            document.getElementById('tracker-step3').classList.add('active');
          }
        }, 500);
      } else {
        setTimeout(() => {
          firstFlipped.classList.remove('flipped');
          secondFlipped.classList.remove('flipped');
          firstFlipped = null;
          secondFlipped = null;
        }, 1000);
      }
    }
  };

  window.nextPuzzle = function () {
    currentPuzzleIdx++;
    renderPuzzle(currentPuzzleIdx);
  };

  function renderPuzzleCompletion() {
    puzzleModule.innerHTML = `
      <div style="text-align:center; padding:40px 20px" class="fade-in">
        <div style="font-size:60px; margin-bottom:20px; animation:bounce 2s infinite">🏅</div>
        <h2 style="font-family:var(--font-heading); font-size:32px; margin-bottom:15px; color:var(--gold)">Puzzle Master Complete!</h2>
        <p style="color:var(--text-muted); font-size:18px; margin-bottom:30px">You earned 75 XP and sharpened your memory reasoning.</p>
        <button class="btn btn-ghost" onclick="window.scrollTo({top:0, behavior:'smooth'})">Back to Top ↑</button>
      </div>
    `;
  }

  if (startPuzzleBtn) {
    startPuzzleBtn.addEventListener('click', () => {
      puzzleModule.style.display = 'block';
      setTimeout(() => {
        puzzleModule.scrollIntoView({ behavior: 'smooth', block: 'start' });
        renderPuzzle(0);
      }, 100);
    });
  }
});
