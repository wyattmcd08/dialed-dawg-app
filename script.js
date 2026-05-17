/* ============================================
   DIALED DAWG - ELITE FITNESS OS
   Main Application Script
   ============================================ */

'use strict';

// ============ DATA & STATE ============

const DEFAULT_STATE = {
  user: { name: 'Athlete', units: 'imperial' },
  targets: { calories: 2400, protein: 200, carbs: 250, fat: 80, water: 8 },
  today: {
    date: '',
    caloriesEaten: 0,
    caloriesBurned: 220,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    sleep: 7.5,
    weight: 182,
    checklist: {},
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }
  },
  streak: 12,
  bestStreak: 28,
  prs: {
    bench: { weight: 225, reps: 5 },
    squat: { weight: 315, reps: 3 },
    deadlift: { weight: 405, reps: 1 }
  },
  bodyStats: { weight: 182, bodyFat: 14, chest: 42, waist: 33, arms: 15.5, legs: 24 },
  muscleFatigue: {
    chest: 60, back: 95, legs: 40, shoulders: 20, arms: 75, core: 85
  },
  peptides: [
    { name: 'BPC-157', dose: '250mcg', freq: 'Daily', times: ['AM'] },
    { name: 'TB-500', dose: '2.5mg', freq: '2x/week', times: ['MON', 'THU'] }
  ],
  injectionLog: {},
  workoutLog: {},
  split: {
    name: 'PPL 6-Day',
    days: [
      { day: 'MON', name: 'Push', exercises: ['Bench Press','Incline DB Press','Lateral Raises','Tricep Pushdowns'] },
      { day: 'TUE', name: 'Pull', exercises: ['Deadlift','Barbell Row','Pull-Ups','Face Pulls','Bicep Curls'] },
      { day: 'WED', name: 'Legs', exercises: ['Squat','Romanian Deadlift','Leg Press','Leg Curl','Calf Raises'] },
      { day: 'THU', name: 'Push', exercises: ['OHP','DB Shoulder Press','Lateral Raises','Dips'] },
      { day: 'FRI', name: 'Pull', exercises: ['Rack Pull','Cable Row','Lat Pulldown','Hammer Curls'] },
      { day: 'SAT', name: 'Legs', exercises: ['Front Squat','Hack Squat','Leg Extension','Nordic Curl'] },
      { day: 'SUN', name: 'Rest', exercises: [] }
    ]
  },
  calendar: {},
  favorites: [
    { name: 'Chicken Breast (100g)', cals: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'White Rice (100g)', cals: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    { name: 'Whole Eggs (2)', cals: 140, protein: 12, carbs: 1, fat: 10 },
    { name: 'Greek Yogurt (150g)', cals: 88, protein: 15, carbs: 5, fat: 0.7 },
    { name: 'Whey Protein (1 scoop)', cals: 120, protein: 25, carbs: 3, fat: 1.5 },
    { name: 'Oats (80g)', cals: 304, protein: 11, carbs: 52, fat: 6 }
  ],
  strengthHistory: {
    'Bench Press': [185, 195, 200, 205, 215, 225],
    'Squat': [225, 255, 275, 295, 315, 315],
    'Deadlift': [275, 315, 355, 385, 405, 405],
    'OHP': [95, 105, 115, 125, 135, 145]
  },
  weightHistory: [185, 184, 183, 183, 182, 182, 181, 182, 182, 181, 180, 182],
  currentWorkout: null,
  workoutTimer: null,
  workoutElapsed: 0,
  activeMealTarget: null
};

const QUOTES = [
  '"The only bad workout is the one that didn\'t happen."',
  '"Iron never lies to you."',
  '"Suffer the pain of discipline or suffer the pain of regret."',
  '"Every rep is a vote for the person you want to become."',
  '"Your body can stand almost anything. It\'s your mind you have to convince."',
  '"Train insane or remain the same."',
  '"Strength doesn\'t come from what you can do. It comes from overcoming what you thought you couldn\'t."',
  '"The pump is the greatest feeling a man can get."',
  '"Don\'t count the days. Make the days count."',
  '"Champions aren\'t made in gyms. Champions are made from something inside them."'
];

const EXERCISES = [
  { name: 'Bench Press', muscle: 'chest' },
  { name: 'Incline DB Press', muscle: 'chest' },
  { name: 'Decline Press', muscle: 'chest' },
  { name: 'Cable Fly', muscle: 'chest' },
  { name: 'Dips', muscle: 'chest' },
  { name: 'Deadlift', muscle: 'back' },
  { name: 'Barbell Row', muscle: 'back' },
  { name: 'Pull-Ups', muscle: 'back' },
  { name: 'Lat Pulldown', muscle: 'back' },
  { name: 'Cable Row', muscle: 'back' },
  { name: 'Face Pulls', muscle: 'back' },
  { name: 'Squat', muscle: 'legs' },
  { name: 'Romanian Deadlift', muscle: 'legs' },
  { name: 'Leg Press', muscle: 'legs' },
  { name: 'Leg Curl', muscle: 'legs' },
  { name: 'Leg Extension', muscle: 'legs' },
  { name: 'Calf Raises', muscle: 'legs' },
  { name: 'OHP', muscle: 'shoulders' },
  { name: 'Lateral Raises', muscle: 'shoulders' },
  { name: 'DB Shoulder Press', muscle: 'shoulders' },
  { name: 'Bicep Curls', muscle: 'arms' },
  { name: 'Hammer Curls', muscle: 'arms' },
  { name: 'Tricep Pushdowns', muscle: 'arms' },
  { name: 'Skull Crushers', muscle: 'arms' },
  { name: 'Plank', muscle: 'core' },
  { name: 'Cable Crunch', muscle: 'core' },
  { name: 'Hanging Leg Raise', muscle: 'core' }
];

let STATE = {};

// ============ STORAGE ============

function saveState() {
  try {
    localStorage.setItem('dialedDawg_v1', JSON.stringify(STATE));
  } catch (e) { console.warn('Storage error', e); }
}

function loadState() {
  try {
    const saved = localStorage.getItem('dialedDawg_v1');
    if (saved) {
      STATE = Object.assign({}, DEFAULT_STATE, JSON.parse(saved));
    } else {
      STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } catch (e) {
    STATE = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
  // Reset today if date changed
  const today = new Date().toDateString();
  if (STATE.today.date !== today) {
    STATE.today = Object.assign({}, DEFAULT_STATE.today, { date: today });
    saveState();
  }
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  // Splash
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
  }, 1800);
});

function initApp() {
  setGreeting();
  updateUserDisplay();
  renderHome();
  renderWorkout();
  renderProgress();
  renderRecovery();
  renderNutrition();
  renderPeptides();
  renderCalendar();
  renderSettings();
  bindNav();
  bindHomeEvents();
  bindWorkoutEvents();
  bindNutritionEvents();
  bindPeptideEvents();
  bindCalendarEvents();
  bindSettingsEvents();
  registerServiceWorker();
}

// ============ NAV ============

function bindNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      navigateTo(page);
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  const pg = document.getElementById(`page-${page}`);
  if (btn) btn.classList.add('active');
  if (pg) pg.classList.add('active');
}

// ============ GREETING ============

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  document.getElementById('greeting').textContent = greeting;
}

function updateUserDisplay() {
  const name = STATE.user.name;
  document.getElementById('userName').textContent = name.toUpperCase();
  document.getElementById('avatarInitial').textContent = name[0].toUpperCase();
  document.getElementById('settingsAvatar').textContent = name[0].toUpperCase();
  document.getElementById('settingsName').textContent = name;
  document.getElementById('siName').textContent = name;
}

// ============ HOME ============

function renderHome() {
  // Quote
  document.getElementById('dailyQuote').textContent = QUOTES[new Date().getDay() % QUOTES.length];

  // Calories
  const { calories, protein, carbs, fat } = STATE.targets;
  const t = STATE.today;
  const remaining = calories - t.caloriesEaten + t.caloriesBurned;
  document.getElementById('calRemaining').textContent = Math.max(0, remaining).toLocaleString();
  document.getElementById('calGoal').textContent = calories.toLocaleString();
  document.getElementById('calEaten').textContent = t.caloriesEaten.toLocaleString();
  document.getElementById('calBurned').textContent = t.caloriesBurned.toLocaleString();

  // Ring
  const pct = Math.min(t.caloriesEaten / calories, 1);
  const circ = 327;
  document.getElementById('calRingCircle').style.strokeDashoffset = circ - pct * circ;

  // Macros
  const pPct = Math.min((t.protein / protein) * 100, 100);
  const cPct = Math.min((t.carbs / carbs) * 100, 100);
  const fPct = Math.min((t.fat / fat) * 100, 100);
  document.getElementById('proteinFill').style.width = pPct + '%';
  document.getElementById('carbsFill').style.width = cPct + '%';
  document.getElementById('fatFill').style.width = fPct + '%';
  document.getElementById('proteinVal').textContent = `${Math.round(t.protein)} / ${protein}g`;
  document.getElementById('carbsVal').textContent = `${Math.round(t.carbs)} / ${carbs}g`;
  document.getElementById('fatVal').textContent = `${Math.round(t.fat)} / ${fat}g`;

  // Quick stats
  document.getElementById('waterVal').textContent = t.water;
  document.getElementById('sleepVal').textContent = t.sleep;
  document.getElementById('streakVal').textContent = STATE.streak;
  document.getElementById('weightVal').textContent = t.weight;

  // Recovery
  const rec = calcOverallRecovery();
  document.getElementById('recoveryScore').textContent = rec;
  document.getElementById('recoveryBar').style.width = rec + '%';
  document.getElementById('recoveryStatus').textContent = getRecoveryStatus(rec);

  // Today's workout
  const dayIndex = new Date().getDay(); // 0=Sun
  const splitDay = STATE.split.days[dayIndex % STATE.split.days.length];
  document.getElementById('todayWorkoutBadge').textContent = splitDay.name.toUpperCase();
  const list = document.getElementById('todayWorkoutList');
  list.innerHTML = splitDay.exercises.slice(0, 4).map(ex =>
    `<div class="wt-exercise"><span class="wt-name">${ex}</span><span class="wt-sets">4 × 8</span></div>`
  ).join('');

  // Checklist
  const checks = document.querySelectorAll('.check-inp');
  checks.forEach(c => {
    c.checked = !!(STATE.today.checklist[c.dataset.key]);
  });
}

function bindHomeEvents() {
  // Checklist
  document.querySelectorAll('.check-inp').forEach(inp => {
    inp.addEventListener('change', () => {
      STATE.today.checklist[inp.dataset.key] = inp.checked;
      saveState();
    });
  });

  // Quick add water
  document.getElementById('quickAddWater').addEventListener('click', () => {
    if (STATE.today.water < 16) {
      STATE.today.water++;
      saveState();
      renderHome();
      renderNutrition();
    }
  });

  // Quick add weight
  document.getElementById('quickAddWeight').addEventListener('click', () => {
    showInputModal('Log Body Weight', 'Weight (lbs)', STATE.today.weight, val => {
      const w = parseFloat(val);
      if (!isNaN(w)) {
        STATE.today.weight = w;
        STATE.bodyStats.weight = w;
        STATE.weightHistory.push(w);
        if (STATE.weightHistory.length > 30) STATE.weightHistory.shift();
        saveState();
        renderHome();
        renderProgress();
      }
    });
  });

  // Quick add meal — navigate to nutrition
  document.getElementById('quickAddMeal').addEventListener('click', () => {
    navigateTo('nutrition');
  });

  // Start workout
  document.getElementById('startWorkoutBtn').addEventListener('click', () => {
    const dayIndex = new Date().getDay();
    const splitDay = STATE.split.days[dayIndex % STATE.split.days.length];
    startWorkoutSession(splitDay);
  });

  // Quick stat taps
  document.getElementById('qs-sleep').addEventListener('click', () => {
    showInputModal('Log Sleep', 'Hours of sleep', STATE.today.sleep, val => {
      const s = parseFloat(val);
      if (!isNaN(s)) { STATE.today.sleep = s; saveState(); renderHome(); }
    });
  });
  document.getElementById('qs-water').addEventListener('click', () => {
    showInputModal('Log Water', 'Cups of water', STATE.today.water, val => {
      const w = parseInt(val);
      if (!isNaN(w)) { STATE.today.water = w; saveState(); renderHome(); renderNutrition(); }
    });
  });
}

// ============ WORKOUT ============

function renderWorkout() {
  // Split days
  const container = document.getElementById('splitDays');
  container.innerHTML = STATE.split.days.map((d, i) => `
    <div class="split-day" data-idx="${i}">
      <span class="sd-day">${d.day}</span>
      <span class="sd-name">${d.name}</span>
      <span class="sd-tag">${d.exercises.length > 0 ? d.exercises.length + ' exercises' : 'REST'}</span>
    </div>
  `).join('');

  // Exercise list
  renderExerciseList('all');
}

function renderExerciseList(muscle) {
  const search = document.getElementById('exerciseSearch').value.toLowerCase();
  const list = document.getElementById('exerciseList');
  const filtered = EXERCISES.filter(ex =>
    (muscle === 'all' || ex.muscle === muscle) &&
    (search === '' || ex.name.toLowerCase().includes(search))
  );
  list.innerHTML = filtered.map(ex => `
    <div class="exercise-item" data-name="${ex.name}" data-muscle="${ex.muscle}">
      <div>
        <div class="ei-name">${ex.name}</div>
        <div class="ei-muscle">${capitalize(ex.muscle)}</div>
      </div>
      <span class="ei-add">＋</span>
    </div>
  `).join('');

  list.querySelectorAll('.exercise-item').forEach(item => {
    item.addEventListener('click', () => {
      if (STATE.currentWorkout) {
        addExerciseToWorkout(item.dataset.name, item.dataset.muscle);
      } else {
        vibrate();
      }
    });
  });
}

function bindWorkoutEvents() {
  document.getElementById('exerciseSearch').addEventListener('input', () => {
    const activeMuscle = document.querySelector('.mf-btn.active')?.dataset.muscle || 'all';
    renderExerciseList(activeMuscle);
  });

  document.querySelectorAll('.mf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExerciseList(btn.dataset.muscle);
    });
  });

  document.getElementById('finishWorkoutBtn').addEventListener('click', finishWorkout);
  document.getElementById('addExToWorkout').addEventListener('click', () => {
    navigateTo('workout');
    document.getElementById('activeWorkoutOverlay').classList.add('hidden');
    // show it again when they select
  });

  // Split day tap -> start workout
  document.getElementById('splitDays').addEventListener('click', e => {
    const day = e.target.closest('.split-day');
    if (day) {
      const idx = parseInt(day.dataset.idx);
      const splitDay = STATE.split.days[idx];
      if (splitDay.exercises.length > 0) startWorkoutSession(splitDay);
    }
  });
}

function startWorkoutSession(splitDay) {
  STATE.currentWorkout = {
    name: splitDay.name.toUpperCase() + ' DAY',
    exercises: splitDay.exercises.map(name => ({
      name,
      sets: [
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false },
        { weight: '', reps: '', done: false }
      ]
    }))
  };
  STATE.workoutElapsed = 0;
  document.getElementById('awTitle').textContent = STATE.currentWorkout.name;
  renderActiveWorkout();
  document.getElementById('activeWorkoutOverlay').classList.remove('hidden');
  navigateTo('workout');

  // Timer
  if (STATE.workoutTimer) clearInterval(STATE.workoutTimer);
  STATE.workoutTimer = setInterval(() => {
    STATE.workoutElapsed++;
    const m = Math.floor(STATE.workoutElapsed / 60).toString().padStart(2, '0');
    const s = (STATE.workoutElapsed % 60).toString().padStart(2, '0');
    document.getElementById('awTimer').textContent = `${m}:${s}`;
  }, 1000);
}

function renderActiveWorkout() {
  const container = document.getElementById('awExercises');
  container.innerHTML = STATE.currentWorkout.exercises.map((ex, eIdx) => `
    <div class="aw-exercise-card" data-eidx="${eIdx}">
      <div class="aw-ex-name">${ex.name}</div>
      <div class="aw-sets-table">
        ${ex.sets.map((set, sIdx) => `
          <div class="aw-set-row" data-sidx="${sIdx}">
            <span class="aw-set-num">${sIdx + 1}</span>
            <input type="number" class="aw-set-inp" placeholder="lbs" value="${set.weight}"
              data-eidx="${eIdx}" data-sidx="${sIdx}" data-field="weight" inputmode="decimal"/>
            <input type="number" class="aw-set-inp" placeholder="reps" value="${set.reps}"
              data-eidx="${eIdx}" data-sidx="${sIdx}" data-field="reps" inputmode="decimal"/>
            <div class="aw-set-done ${set.done ? 'done' : ''}" data-eidx="${eIdx}" data-sidx="${sIdx}">
              ${set.done ? '✓' : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <button class="aw-add-set" data-eidx="${eIdx}">+ Add Set</button>
    </div>
  `).join('');

  // Bind inputs
  container.querySelectorAll('.aw-set-inp').forEach(inp => {
    inp.addEventListener('change', () => {
      const eIdx = parseInt(inp.dataset.eidx);
      const sIdx = parseInt(inp.dataset.sidx);
      const field = inp.dataset.field;
      STATE.currentWorkout.exercises[eIdx].sets[sIdx][field] = inp.value;
    });
  });

  // Bind done buttons
  container.querySelectorAll('.aw-set-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const eIdx = parseInt(btn.dataset.eidx);
      const sIdx = parseInt(btn.dataset.sidx);
      STATE.currentWorkout.exercises[eIdx].sets[sIdx].done = !STATE.currentWorkout.exercises[eIdx].sets[sIdx].done;
      renderActiveWorkout();
      vibrate();
    });
  });

  // Add set buttons
  container.querySelectorAll('.aw-add-set').forEach(btn => {
    btn.addEventListener('click', () => {
      const eIdx = parseInt(btn.dataset.eidx);
      STATE.currentWorkout.exercises[eIdx].sets.push({ weight: '', reps: '', done: false });
      renderActiveWorkout();
    });
  });
}

function addExerciseToWorkout(name, muscle) {
  STATE.currentWorkout.exercises.push({
    name,
    sets: [{ weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }, { weight: '', reps: '', done: false }]
  });
  document.getElementById('activeWorkoutOverlay').classList.remove('hidden');
  renderActiveWorkout();
}

function finishWorkout() {
  if (STATE.workoutTimer) { clearInterval(STATE.workoutTimer); STATE.workoutTimer = null; }

  // Update PRs
  if (STATE.currentWorkout) {
    STATE.currentWorkout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        const w = parseFloat(set.weight);
        const r = parseInt(set.reps);
        if (!isNaN(w) && !isNaN(r) && w > 0) {
          const name = ex.name;
          if (name === 'Bench Press' && w >= STATE.prs.bench.weight) {
            STATE.prs.bench = { weight: w, reps: r };
          } else if (name === 'Squat' && w >= STATE.prs.squat.weight) {
            STATE.prs.squat = { weight: w, reps: r };
          } else if (name === 'Deadlift' && w >= STATE.prs.deadlift.weight) {
            STATE.prs.deadlift = { weight: w, reps: r };
          }
          // Update strength history
          if (STATE.strengthHistory[name]) {
            STATE.strengthHistory[name].push(w);
            if (STATE.strengthHistory[name].length > 10) STATE.strengthHistory[name].shift();
          }
        }
      });
    });
  }

  // Log workout
  const today = new Date().toDateString();
  STATE.workoutLog[today] = true;
  STATE.today.checklist.workout = true;

  // Update streak
  STATE.streak++;
  if (STATE.streak > STATE.bestStreak) STATE.bestStreak = STATE.streak;

  // Update muscle fatigue (simple model)
  const dayIndex = new Date().getDay();
  const splitDay = STATE.split.days[dayIndex % STATE.split.days.length];
  const muscleMap = {
    Push: ['chest', 'shoulders', 'arms'],
    Pull: ['back', 'arms'],
    Legs: ['legs', 'core'],
    Rest: []
  };
  const muscles = muscleMap[splitDay.name] || [];
  muscles.forEach(m => {
    STATE.muscleFatigue[m] = Math.max(0, (STATE.muscleFatigue[m] || 100) - 40);
  });

  STATE.currentWorkout = null;
  saveState();
  document.getElementById('activeWorkoutOverlay').classList.add('hidden');
  renderHome();
  renderRecovery();
  renderProgress();
  renderCalendar();
  alert('Workout logged! Great session! 💪');
}

// ============ PROGRESS ============

function renderProgress() {
  // PRs
  const { bench, squat, deadlift } = STATE.prs;
  document.getElementById('pr-bench').textContent = `${bench.weight} lbs`;
  document.getElementById('pr-squat').textContent = `${squat.weight} lbs`;
  document.getElementById('pr-deadlift').textContent = `${deadlift.weight} lbs`;

  // Body stats
  const bs = STATE.bodyStats;
  document.getElementById('bsWeight').textContent = bs.weight + ' lbs';
  document.getElementById('bsBF').textContent = bs.bodyFat + '%';
  document.getElementById('bsChest').textContent = bs.chest + '"';
  document.getElementById('bsWaist').textContent = bs.waist + '"';
  document.getElementById('bsArms').textContent = bs.arms + '"';
  document.getElementById('bsLegs').textContent = bs.legs + '"';

  // Weight chart
  drawWeightChart();

  // Strength list
  const strengthContainer = document.getElementById('strengthList');
  const maxWeight = Math.max(...Object.values(STATE.strengthHistory).map(h => h[h.length - 1] || 0));
  strengthContainer.innerHTML = Object.entries(STATE.strengthHistory).map(([name, history]) => {
    const current = history[history.length - 1] || 0;
    const prev = history[history.length - 2] || current;
    const diff = current - prev;
    const pct = maxWeight ? (current / maxWeight) * 100 : 50;
    return `
      <div class="strength-item">
        <div class="si-top">
          <span class="si-name">${name}</span>
          <span class="si-pr">${current} lbs ${diff > 0 ? `<span style="color:var(--green);font-size:11px">+${diff}</span>` : ''}</span>
        </div>
        <div class="si-bar"><div class="si-bar-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');

  // Log body stats button
  document.getElementById('logBodyStatsBtn').onclick = () => {
    showInputModal('Log Weight', 'Body weight (lbs)', STATE.bodyStats.weight, val => {
      const w = parseFloat(val);
      if (!isNaN(w)) {
        STATE.bodyStats.weight = w;
        STATE.today.weight = w;
        STATE.weightHistory.push(w);
        if (STATE.weightHistory.length > 30) STATE.weightHistory.shift();
        saveState();
        renderProgress();
        renderHome();
      }
    });
  };

  // Add photo button
  document.getElementById('addPhotoBtn').onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const gallery = document.getElementById('photoGallery');
        gallery.innerHTML = '';
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.style.cssText = 'width:100%;border-radius:10px;display:block;';
        gallery.appendChild(img);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
}

function drawWeightChart() {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = STATE.weightHistory.slice(-12);
  const w = canvas.offsetWidth || 300;
  const h = 120;
  canvas.width = w * window.devicePixelRatio;
  canvas.height = h * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const padL = 10, padR = 10, padT = 10, padB = 24;
  const cw = w - padL - padR;
  const ch = h - padT - padB;

  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (ch / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
  }

  if (data.length < 2) return;

  const xStep = cw / (data.length - 1);
  const yScale = ch / (max - min);

  // Fill gradient
  const grad = ctx.createLinearGradient(0, padT, 0, padT + ch);
  grad.addColorStop(0, 'rgba(200,16,46,0.3)');
  grad.addColorStop(1, 'rgba(200,16,46,0)');

  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padL + i * xStep;
    const y = padT + ch - (val - min) * yScale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(padL + (data.length - 1) * xStep, padT + ch);
  ctx.lineTo(padL, padT + ch);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#c8102e';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  data.forEach((val, i) => {
    const x = padL + i * xStep;
    const y = padT + ch - (val - min) * yScale;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  data.forEach((val, i) => {
    const x = padL + i * xStep;
    const y = padT + ch - (val - min) * yScale;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#c8102e';
    ctx.fill();
  });

  // Labels
  ctx.fillStyle = '#666';
  ctx.font = `${11 * window.devicePixelRatio / window.devicePixelRatio}px Barlow`;
  ctx.textAlign = 'center';
  const labelIndices = [0, Math.floor(data.length / 2), data.length - 1];
  labelIndices.forEach(i => {
    const x = padL + i * xStep;
    ctx.fillText(data[i] + 'lb', x, h - 6);
  });
}

// ============ RECOVERY ============

function calcOverallRecovery() {
  const vals = Object.values(STATE.muscleFatigue);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(avg);
}

function getRecoveryStatus(score) {
  if (score >= 85) return 'Fully Recovered – Ready to Crush It';
  if (score >= 70) return 'Good – Train with Intensity';
  if (score >= 50) return 'Moderate – Manage Volume';
  if (score >= 30) return 'Fatigued – Light Work Only';
  return 'Overtrained – Rest Day Needed';
}

function getFatigueColor(pct) {
  if (pct >= 80) return 'green';
  if (pct >= 50) return 'yellow';
  return 'red';
}

function renderRecovery() {
  const overall = calcOverallRecovery();
  document.getElementById('rhScore').textContent = overall;
  document.getElementById('rhStatus').textContent = getRecoveryStatus(overall);
  document.getElementById('recoveryScore').textContent = overall;

  // Body SVG coloring
  const muscleColors = {
    chest: STATE.muscleFatigue.chest,
    back: STATE.muscleFatigue.back,
    legs: STATE.muscleFatigue.legs,
    shoulders: STATE.muscleFatigue.shoulders,
    arms: STATE.muscleFatigue.arms,
    core: STATE.muscleFatigue.core
  };

  document.querySelectorAll('.muscle-zone').forEach(zone => {
    const muscle = zone.dataset.muscle;
    const pct = muscleColors[muscle] ?? 80;
    zone.classList.remove('fresh', 'moderate', 'fatigued');
    zone.classList.add(getFatigueColor(pct));
  });

  // Muscle recovery list
  const list = document.getElementById('muscleRecoveryList');
  const muscles = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  list.innerHTML = muscles.map(m => {
    const key = m.toLowerCase();
    const pct = STATE.muscleFatigue[key] ?? 80;
    const cls = getFatigueColor(pct);
    const pctStr = pct + '%';
    return `
      <div class="mrl-item">
        <div class="mrl-dot" style="background:var(--${cls === 'green' ? 'green' : cls === 'yellow' ? 'yellow' : 'red'})"></div>
        <span class="mrl-name">${m}</span>
        <div class="mrl-bar"><div class="mrl-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="mrl-pct" style="color:var(--${cls === 'green' ? 'green' : cls === 'yellow' ? 'yellow' : 'red'})">${pctStr}</span>
      </div>
    `;
  }).join('');

  // Recommendations
  const recs = document.getElementById('recoveryRecs');
  const items = muscles.map(m => {
    const key = m.toLowerCase();
    const pct = STATE.muscleFatigue[key] ?? 80;
    const cls = getFatigueColor(pct);
    if (cls === 'green') return `<div class="rec-rec-item green">✅ ${m} fully recovered — great day for ${m.toLowerCase()} work</div>`;
    if (cls === 'yellow') return `<div class="rec-rec-item yellow">⚠️ ${m} at ${pct}% — moderate volume recommended</div>`;
    return `<div class="rec-rec-item red">🚫 ${m} undertrained — rest or light recovery work</div>`;
  });
  recs.innerHTML = items.join('');
}

// Recovery ticks up each day (simulate)
function tickRecovery() {
  Object.keys(STATE.muscleFatigue).forEach(m => {
    STATE.muscleFatigue[m] = Math.min(100, (STATE.muscleFatigue[m] || 50) + 15);
  });
}

// ============ NUTRITION ============

function renderNutrition() {
  const t = STATE.today;
  const tgt = STATE.targets;

  document.getElementById('nCalEaten').textContent = Math.round(t.caloriesEaten).toLocaleString();
  document.getElementById('nCalBurned').textContent = Math.round(t.caloriesBurned).toLocaleString();
  const remain = tgt.calories - t.caloriesEaten + t.caloriesBurned;
  document.getElementById('nCalRemain').textContent = Math.max(0, remain).toLocaleString();
  const fillPct = Math.min((t.caloriesEaten / tgt.calories) * 100, 100);
  document.getElementById('nutrProgFill').style.width = fillPct + '%';

  // Meals
  const mealNames = ['breakfast', 'lunch', 'dinner', 'snacks'];
  mealNames.forEach(meal => {
    const foods = t.meals[meal] || [];
    const totalCals = foods.reduce((s, f) => s + (f.cals || 0), 0);
    document.getElementById(`${meal}Cals`).textContent = totalCals + ' kcal';
    const container = document.getElementById(`${meal}-foods`);
    container.innerHTML = foods.map((f, idx) => `
      <div class="food-entry">
        <span class="fe-name">${f.name}</span>
        <span class="fe-macro">${f.protein}p · ${f.carbs}c · ${f.fat}f</span>
        <span class="fe-cal">${f.cals}</span>
        <button class="fe-del" data-meal="${meal}" data-idx="${idx}">✕</button>
      </div>
    `).join('');
    container.querySelectorAll('.fe-del').forEach(btn => {
      btn.addEventListener('click', () => removeFood(btn.dataset.meal, parseInt(btn.dataset.idx)));
    });
  });

  // Water cups
  const cups = document.getElementById('waterCups');
  cups.innerHTML = Array.from({ length: 8 }, (_, i) => `
    <div class="water-cup ${i < t.water ? 'filled' : ''}" data-i="${i}"></div>
  `).join('');
  cups.querySelectorAll('.water-cup').forEach(cup => {
    cup.addEventListener('click', () => {
      const i = parseInt(cup.dataset.i);
      STATE.today.water = i < STATE.today.water ? i : i + 1;
      saveState();
      renderNutrition();
      renderHome();
    });
  });
  document.getElementById('waterGoalText').textContent = `${t.water} / ${tgt.water} cups`;
}

function removeFood(meal, idx) {
  const food = STATE.today.meals[meal][idx];
  STATE.today.caloriesEaten -= food.cals || 0;
  STATE.today.protein -= food.protein || 0;
  STATE.today.carbs -= food.carbs || 0;
  STATE.today.fat -= food.fat || 0;
  STATE.today.meals[meal].splice(idx, 1);
  saveState();
  renderNutrition();
  renderHome();
}

function addFood(meal, food) {
  if (!STATE.today.meals[meal]) STATE.today.meals[meal] = [];
  STATE.today.meals[meal].push(food);
  STATE.today.caloriesEaten += food.cals || 0;
  STATE.today.protein += food.protein || 0;
  STATE.today.carbs += food.carbs || 0;
  STATE.today.fat += food.fat || 0;
  saveState();
  renderNutrition();
  renderHome();
}

function bindNutritionEvents() {
  // Open calc modal
  document.getElementById('openCalcBtn').addEventListener('click', () => {
    document.getElementById('calcModal').classList.remove('hidden');
  });
  document.getElementById('closeCalcModal').addEventListener('click', () => {
    document.getElementById('calcModal').classList.add('hidden');
  });

  // Run calculator
  document.getElementById('runCalcBtn').addEventListener('click', runCalorieCalc);
  document.getElementById('applyCalcBtn').addEventListener('click', applyCalcTargets);

  // Meal add buttons
  document.querySelectorAll('.ms-add').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.activeMealTarget = btn.dataset.meal;
      document.getElementById('addFoodModal').classList.remove('hidden');
      renderFavorites();
    });
  });

  document.getElementById('closeAddFoodModal').addEventListener('click', () => {
    document.getElementById('addFoodModal').classList.add('hidden');
  });

  document.getElementById('saveFoodBtn').addEventListener('click', () => {
    const name = document.getElementById('foodName').value.trim();
    const cals = parseFloat(document.getElementById('foodCals').value) || 0;
    const protein = parseFloat(document.getElementById('foodProtein').value) || 0;
    const carbs = parseFloat(document.getElementById('foodCarbs').value) || 0;
    const fat = parseFloat(document.getElementById('foodFat').value) || 0;
    if (!name) return;
    addFood(STATE.activeMealTarget, { name, cals, protein, carbs, fat });
    document.getElementById('addFoodModal').classList.add('hidden');
    ['foodName', 'foodCals', 'foodProtein', 'foodCarbs', 'foodFat'].forEach(id =>
      document.getElementById(id).value = ''
    );
  });
}

function renderFavorites() {
  const list = document.getElementById('favoritesList');
  list.innerHTML = STATE.favorites.map((f, i) => `
    <div class="fav-item" data-idx="${i}">
      <span class="fav-name">${f.name}</span>
      <span class="fav-cal">${f.cals} kcal</span>
    </div>
  `).join('');
  list.querySelectorAll('.fav-item').forEach(item => {
    item.addEventListener('click', () => {
      const f = STATE.favorites[parseInt(item.dataset.idx)];
      addFood(STATE.activeMealTarget, { ...f });
      document.getElementById('addFoodModal').classList.add('hidden');
    });
  });
}

function runCalorieCalc() {
  const age = parseFloat(document.getElementById('calcAge').value) || 25;
  const weightLbs = parseFloat(document.getElementById('calcWeight').value) || 180;
  const heightIn = parseFloat(document.getElementById('calcHeight').value) || 70;
  const gender = document.getElementById('calcGender').value;
  const activity = parseFloat(document.getElementById('calcActivity').value);
  const goal = document.getElementById('calcGoal').value;

  // Mifflin-St Jeor
  const weightKg = weightLbs * 0.453592;
  const heightCm = heightIn * 2.54;
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  const maintenance = Math.round(bmr * activity);
  let recommended = maintenance;
  let changeText = '0 lbs/week';
  if (goal === 'cut') { recommended = maintenance - 500; changeText = '-1 lb/week'; }
  if (goal === 'bulk') { recommended = maintenance + 300; changeText = '+0.6 lbs/week'; }

  const protein = Math.round(weightLbs * 1);
  const fat = Math.round(recommended * 0.25 / 9);
  const carbs = Math.round((recommended - protein * 4 - fat * 9) / 4);

  document.getElementById('crMaintain').textContent = maintenance.toLocaleString() + ' kcal';
  document.getElementById('crRecommend').textContent = recommended.toLocaleString() + ' kcal';
  document.getElementById('crChange').textContent = changeText;
  document.getElementById('crProtein').textContent = protein + 'g';
  document.getElementById('crCarbs').textContent = carbs + 'g';
  document.getElementById('crFat').textContent = fat + 'g';
  document.getElementById('calcResults').classList.remove('hidden');

  // Store for apply
  document.getElementById('applyCalcBtn').dataset.cals = recommended;
  document.getElementById('applyCalcBtn').dataset.protein = protein;
  document.getElementById('applyCalcBtn').dataset.carbs = carbs;
  document.getElementById('applyCalcBtn').dataset.fat = fat;
}

function applyCalcTargets() {
  const btn = document.getElementById('applyCalcBtn');
  STATE.targets.calories = parseInt(btn.dataset.cals);
  STATE.targets.protein = parseInt(btn.dataset.protein);
  STATE.targets.carbs = parseInt(btn.dataset.carbs);
  STATE.targets.fat = parseInt(btn.dataset.fat);
  saveState();
  document.getElementById('calcModal').classList.add('hidden');
  renderHome();
  renderNutrition();
  renderSettings();
  alert('Targets applied! 🎯');
}

// ============ PEPTIDES ============

function renderPeptides() {
  // Stack
  const stack = document.getElementById('peptideStack');
  stack.innerHTML = STATE.peptides.length ? STATE.peptides.map((p, i) => `
    <div class="peptide-item">
      <div>
        <div class="pi-name">${p.name}</div>
        <div class="pi-freq">${p.freq} — ${p.times.join(', ')}</div>
      </div>
      <span class="pi-dose">${p.dose}</span>
      <button class="pi-del" data-idx="${i}">✕</button>
    </div>
  `).join('') : '<div style="color:var(--subtext);font-size:13px;padding:8px 0">No peptides in stack. Tap + to add.</div>';

  stack.querySelectorAll('.pi-del').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.peptides.splice(parseInt(btn.dataset.idx), 1);
      saveState();
      renderPeptides();
    });
  });

  // Injection schedule
  renderInjectionSchedule();
}

function renderInjectionSchedule() {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const sched = document.getElementById('injSchedule');
  const items = [];
  STATE.peptides.forEach(p => {
    p.times.forEach(t => {
      if (days.includes(t)) {
        items.push({ day: t, name: p.name, dose: p.dose });
      } else {
        // Daily — add all days
        days.forEach(d => items.push({ day: d, name: p.name, dose: p.dose }));
      }
    });
  });

  // Deduplicate and sort
  const seen = new Set();
  const unique = items.filter(item => {
    const key = `${item.day}-${item.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const today = ['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date().getDay()];
  sched.innerHTML = unique.slice(0, 10).map((item, i) => {
    const todayKey = `${new Date().toDateString()}-${item.day}-${item.name}`;
    const done = STATE.injectionLog[todayKey];
    return `
      <div class="inj-item">
        <span class="inj-day" style="${item.day === today ? 'color:var(--red)' : ''}">${item.day}</span>
        <span class="inj-name">${item.name}</span>
        <span class="inj-dose">${item.dose}</span>
        <div class="inj-check ${done ? 'done' : ''}" data-key="${todayKey}">${done ? '✓' : ''}</div>
      </div>
    `;
  }).join('');

  sched.querySelectorAll('.inj-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      STATE.injectionLog[key] = !STATE.injectionLog[key];
      saveState();
      renderInjectionSchedule();
      vibrate();
    });
  });
}

function bindPeptideEvents() {
  document.getElementById('addPeptideBtn').addEventListener('click', () => {
    showInputModal('Add Peptide', 'Name (e.g. BPC-157 250mcg daily)', '', val => {
      const parts = val.split(' ');
      if (parts.length >= 2) {
        STATE.peptides.push({
          name: parts[0],
          dose: parts[1] || '250mcg',
          freq: 'Daily',
          times: ['AM']
        });
        saveState();
        renderPeptides();
      }
    });
  });

  document.getElementById('calcReconBtn').addEventListener('click', calcRecon);
}

function calcRecon() {
  const vialMg = parseFloat(document.getElementById('vialSize').value);
  const bacMl = parseFloat(document.getElementById('bacWater').value);
  const doseMcg = parseFloat(document.getElementById('desiredDose').value);
  const syringeIU = parseInt(document.getElementById('syringeUnits').value);

  if (isNaN(vialMg) || isNaN(bacMl) || isNaN(doseMcg)) return;

  const vialMcg = vialMg * 1000;
  const concMcgPerMl = vialMcg / bacMl;
  const doseVolumeML = doseMcg / concMcgPerMl;
  const syringeML = 1 / syringeIU; // ml per IU
  const drawIU = Math.round(doseVolumeML / syringeML);

  document.getElementById('rrUnits').textContent = drawIU;
  document.getElementById('rrml').textContent = `${doseVolumeML.toFixed(3)} ml`;
  document.getElementById('rrConc').textContent = `Concentration: ${concMcgPerMl.toFixed(1)} mcg/ml`;
  document.getElementById('reconResult').classList.remove('hidden');
}

// ============ CALENDAR ============

let calViewDate = new Date();

function renderCalendar() {
  renderCalendarMonth();

  document.getElementById('calStreak').textContent = STATE.streak;
  document.getElementById('calBestStreak').textContent = STATE.bestStreak;

  const daysInMonth = new Date(calViewDate.getFullYear(), calViewDate.getMonth() + 1, 0).getDate();
  const workoutDays = Object.keys(STATE.workoutLog).filter(d => {
    const date = new Date(d);
    return date.getMonth() === calViewDate.getMonth() && date.getFullYear() === calViewDate.getFullYear();
  }).length;
  const consistency = Math.round((workoutDays / daysInMonth) * 100);
  document.getElementById('calConsistency').textContent = consistency + '%';
  document.getElementById('msWorkouts').textContent = workoutDays;
  document.getElementById('msCalsHit').textContent = Math.round(workoutDays * 0.8);
  document.getElementById('msRestDays').textContent = Math.max(0, daysInMonth - workoutDays - 2);
  document.getElementById('msMissed').textContent = 2;
}

function renderCalendarMonth() {
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  document.getElementById('calMonthLabel').textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const grid = document.getElementById('calGrid');

  let html = '<div class="cal-day-labels">';
  ['S','M','T','W','T','F','S'].forEach(d => {
    html += `<div class="cal-day-lbl">${d}</div>`;
  });
  html += '</div>';

  // Empty cells
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = dateObj.toDateString();
    const isToday = dateObj.toDateString() === today.toDateString();
    let cls = '';
    if (STATE.workoutLog[dateStr]) cls = 'workout';
    else if (dateObj < today) cls = Math.random() > 0.3 ? 'calories' : 'missed';

    html += `<div class="cal-cell ${cls} ${isToday ? 'today' : ''}">${d}</div>`;
  }

  grid.innerHTML = html;
}

function bindCalendarEvents() {
  document.getElementById('calPrev').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    calViewDate.setMonth(calViewDate.getMonth() + 1);
    renderCalendar();
  });
}

// ============ SETTINGS ============

function renderSettings() {
  const name = STATE.user.name;
  document.getElementById('settingsAvatar').textContent = name[0].toUpperCase();
  document.getElementById('settingsName').textContent = name;
  document.getElementById('siName').textContent = name;
  document.getElementById('siCalGoal').textContent = STATE.targets.calories.toLocaleString();
  document.getElementById('siProteinGoal').textContent = STATE.targets.protein + 'g';
}

function bindSettingsEvents() {
  document.getElementById('editNameSetting').addEventListener('click', () => {
    showInputModal('Display Name', 'Your name', STATE.user.name, val => {
      if (val.trim()) {
        STATE.user.name = val.trim();
        saveState();
        updateUserDisplay();
        renderSettings();
      }
    });
  });

  document.getElementById('editCalGoalSetting').addEventListener('click', () => {
    showInputModal('Calorie Goal', 'Daily calories', STATE.targets.calories, val => {
      const c = parseInt(val);
      if (!isNaN(c)) { STATE.targets.calories = c; saveState(); renderHome(); renderNutrition(); renderSettings(); }
    });
  });

  document.getElementById('editProteinGoalSetting').addEventListener('click', () => {
    showInputModal('Protein Goal', 'Grams per day', STATE.targets.protein, val => {
      const p = parseInt(val);
      if (!isNaN(p)) { STATE.targets.protein = p; saveState(); renderHome(); renderSettings(); }
    });
  });

  document.getElementById('exportDataSetting').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dialed-dawg-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });

  document.getElementById('clearDataSetting').addEventListener('click', () => {
    if (confirm('Reset all data? This cannot be undone.')) {
      localStorage.removeItem('dialedDawg_v1');
      location.reload();
    }
  });
}

// ============ INPUT MODAL ============

let inputModalCallback = null;

function showInputModal(title, label, currentVal, callback) {
  inputModalCallback = callback;
  document.getElementById('inputModalTitle').textContent = title;
  document.getElementById('inputModalLabel').textContent = label;
  document.getElementById('inputModalField').value = currentVal || '';
  document.getElementById('inputModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('inputModalField').focus(), 100);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('inputModalSave').addEventListener('click', () => {
    const val = document.getElementById('inputModalField').value;
    document.getElementById('inputModal').classList.add('hidden');
    if (inputModalCallback) { inputModalCallback(val); inputModalCallback = null; }
  });
  document.getElementById('closeInputModal').addEventListener('click', () => {
    document.getElementById('inputModal').classList.add('hidden');
    inputModalCallback = null;
  });
});

// ============ UTILS ============

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function vibrate() {
  if (navigator.vibrate) navigator.vibrate(30);
}

// ============ SERVICE WORKER ============

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.log('SW error:', err));
  }
}