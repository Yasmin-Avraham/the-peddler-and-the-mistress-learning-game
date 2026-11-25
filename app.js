// ============================================================================
// "הבריחה מהיער של הלני" – מנוע המשחק האינטראקטיבי לכיתה
// ============================================================================

(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // אייקוני SVG ברורים לכל אחת מ-5 התחנות
  // --------------------------------------------------------------------------
  const STATION_ICONS = {
    storm: `
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M18 36H47C52 36 55 32.5 55 28C55 23.8 51.9 20.5 47.8 20.1C46.5 13.7 40.9 9 34 9C26.5 9 20.5 14.8 20.1 22.1C15.5 22.7 12 26.5 12 31.1C12 33.9 14.7 36 18 36Z" fill="rgba(186,230,253,0.22)" stroke="#e2f2ff" stroke-width="3" stroke-linejoin="round"/>
        <path d="M35 32L27 45H34L30 57L43 41H35.5L39 32H35Z" fill="#ffd966" stroke="#fff3c4" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M19 43L16 50M47 43L44 50" stroke="#7dd3fc" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
    knife: `
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M49 12C40 16 30 25 23 36L28 41C39 34 48 24 52 15L49 12Z" fill="rgba(226,232,240,0.88)" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M21 34L30 43" stroke="#f7d47c" stroke-width="4" stroke-linecap="round"/>
        <path d="M23 41L13 51C11.5 52.5 11.5 54.8 13 56.2C14.4 57.6 16.7 57.6 18.1 56.2L28 46" fill="#7c4a1e" stroke="#f7d47c" stroke-width="2.6" stroke-linejoin="round"/>
        <path d="M37 22L43 16" stroke="#fff9db" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    feast: `
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M13 44H42C42 35 36 29 27.5 29C19 29 13 35 13 44Z" fill="rgba(247,212,124,0.24)" stroke="#f7d47c" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M9 44H46M27.5 24V29" stroke="#f7d47c" stroke-width="3" stroke-linecap="round"/>
        <circle cx="27.5" cy="23" r="3" fill="#ffe58f"/>
        <path d="M44 16H55L53.5 26C53 29.8 50.8 32 49.5 32C48.2 32 46 29.8 45.5 26L44 16Z" fill="rgba(239,68,68,0.65)" stroke="#ffe58f" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M49.5 32V46M44.5 46H54.5" stroke="#ffe58f" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`,
    danger: `
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 32C14 21 22.5 16 32 16C41.5 16 50 21 56 32C50 43 41.5 48 32 48C22.5 48 14 43 8 32Z" fill="rgba(239,68,68,0.18)" stroke="#fca5a5" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="32" cy="32" r="9.5" fill="rgba(247,212,124,0.25)" stroke="#ffd966" stroke-width="3"/>
        <circle cx="32" cy="32" r="4" fill="#ef4444"/>
        <path d="M32 7V11M16 12L19 15M48 12L45 15" stroke="#fca5a5" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`,
    escape: `
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="27" r="10" fill="#ffe58f" stroke="#fff7cc" stroke-width="2.5"/>
        <path d="M32 9V13M19 14L22 17M45 14L42 17M13 27H17M47 27H51" stroke="#ffe58f" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M16 52V37C16 28.2 23.2 21 32 21C40.8 21 48 28.2 48 37V52" stroke="#f7d47c" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M10 52H54" stroke="#f7d47c" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M32 39L24 52H40L32 39Z" fill="rgba(255,229,143,0.38)"/>
      </svg>`
  };

  // קואורדינטות 5 התחנות באחוזים (מימין לשמאל – RTL!)
  const STATION_ANCHORS = [
    { x: 89, y: 57, labelPos: "below" },
    { x: 69.5, y: 37, labelPos: "above" },
    { x: 50, y: 58, labelPos: "below" },
    { x: 30.5, y: 37, labelPos: "above" },
    { x: 11, y: 55, labelPos: "below" }
  ];

  // --------------------------------------------------------------------------
  // מצב המשחק (State)
  // --------------------------------------------------------------------------
  const state = {
    mode: "full", // "full" = 12 צעדים (עם אבני דרך), "short" = 4 צעדים (תחנה בכל צעד)
    activeTeam: "A", // "A" | "B"
    soundEnabled: true,
    isAnimating: false,
    winner: null,
    teams: {
      A: { name: "קבוצה א'", pos: 0, correctCount: 0 },
      B: { name: "קבוצה ב'", pos: 0, correctCount: 0 }
    },
    usedQuestionIds: new Set(),
    currentQuestion: null,
    nodes: [] // רשימת הקואורדינטות (x%, y%) של כל צעד על השביל
  };

  // --------------------------------------------------------------------------
  // רכיבי DOM
  // --------------------------------------------------------------------------
  const dom = {
    fireflies: document.getElementById("fireflies"),
    trailShadow: document.getElementById("trailShadow"),
    trailBase: document.getElementById("trailBase"),
    trailDash: document.getElementById("trailDash"),
    waypointsLayer: document.getElementById("waypointsLayer"),
    stationsLayer: document.getElementById("stationsLayer"),
    tokenA: document.getElementById("tokenA"),
    tokenB: document.getElementById("tokenB"),
    tokenTagA: document.getElementById("tokenTagA"),
    tokenTagB: document.getElementById("tokenTagB"),
    stepToast: document.getElementById("stepToast"),
    stationInfoBadge: document.getElementById("stationInfoBadge"),
    stationInfoTitle: document.getElementById("stationInfoTitle"),
    stationInfoDesc: document.getElementById("stationInfoDesc"),

    turnBanner: document.getElementById("turnBanner"),
    turnTeamName: document.getElementById("turnTeamName"),
    remainingTotal: document.getElementById("remainingTotal"),
    soundToggleBtn: document.getElementById("soundToggleBtn"),
    soundIcon: document.getElementById("soundIcon"),
    teacherToolsBtn: document.getElementById("teacherToolsBtn"),

    teamCardA: document.getElementById("teamCardA"),
    teamCardB: document.getElementById("teamCardB"),
    nameTeamA: document.getElementById("nameTeamA"),
    nameTeamB: document.getElementById("nameTeamB"),
    pillTeamA: document.getElementById("pillTeamA"),
    pillTeamB: document.getElementById("pillTeamB"),
    stepBadgeA: document.getElementById("stepBadgeA"),
    stepBadgeB: document.getElementById("stepBadgeB"),
    stationLabelA: document.getElementById("stationLabelA"),
    stationLabelB: document.getElementById("stationLabelB"),
    progressA: document.getElementById("progressA"),
    progressB: document.getElementById("progressB"),

    btnGreen: document.getElementById("btnGreen"),
    btnYellow: document.getElementById("btnYellow"),
    btnRed: document.getElementById("btnRed"),
    countGreen: document.getElementById("countGreen"),
    countYellow: document.getElementById("countYellow"),
    countRed: document.getElementById("countRed"),

    questionModal: document.getElementById("questionModal"),
    qAccentBar: document.getElementById("qAccentBar"),
    qTeamBadge: document.getElementById("qTeamBadge"),
    qLevelBadge: document.getElementById("qLevelBadge"),
    qTopicBadge: document.getElementById("qTopicBadge"),
    qCloseBtn: document.getElementById("qCloseBtn"),
    qText: document.getElementById("qText"),
    hintToggleBtn: document.getElementById("hintToggleBtn"),
    answerToggleBtn: document.getElementById("answerToggleBtn"),
    answerToggleText: document.getElementById("answerToggleText"),
    hintBox: document.getElementById("hintBox"),
    hintContent: document.getElementById("hintContent"),
    answerBox: document.getElementById("answerBox"),
    answerContent: document.getElementById("answerContent"),
    correctAdvanceBtn: document.getElementById("correctAdvanceBtn"),
    correctAdvanceText: document.getElementById("correctAdvanceText"),
    continueNoAdvanceBtn: document.getElementById("continueNoAdvanceBtn"),

    teacherModal: document.getElementById("teacherModal"),
    teacherCloseBtn: document.getElementById("teacherCloseBtn"),
    inputNameA: document.getElementById("inputNameA"),
    inputNameB: document.getElementById("inputNameB"),
    decA: document.getElementById("decA"),
    incA: document.getElementById("incA"),
    decB: document.getElementById("decB"),
    incB: document.getElementById("incB"),
    manualPosA: document.getElementById("manualPosA"),
    manualPosB: document.getElementById("manualPosB"),
    modeFullBtn: document.getElementById("modeFullBtn"),
    modeShortBtn: document.getElementById("modeShortBtn"),
    resetQuestionsBtn: document.getElementById("resetQuestionsBtn"),
    questionPickerList: document.getElementById("questionPickerList"),
    resetGameBtn: document.getElementById("resetGameBtn"),

    victoryOverlay: document.getElementById("victoryOverlay"),
    confettiCanvas: document.getElementById("confettiCanvas"),
    victoryTitle: document.getElementById("victoryTitle"),
    victorySummary: document.getElementById("victorySummary"),
    victoryNewGameBtn: document.getElementById("victoryNewGameBtn"),
    victoryViewMapBtn: document.getElementById("victoryViewMapBtn")
  };

  // --------------------------------------------------------------------------
  // מנוע צלילים עדין מבוסס Web Audio API (ללא קבצים חיצוניים)
  // --------------------------------------------------------------------------
  let audioCtx = null;

  function ensureAudio() {
    if (!state.soundEnabled) return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = "sine", volume = 0.12, delay = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  const SFX = {
    openCard() {
      playTone(440, 0.16, "triangle", 0.1, 0);
      playTone(554.37, 0.22, "triangle", 0.1, 0.07);
    },
    hint() {
      playTone(659.25, 0.18, "sine", 0.09, 0);
      playTone(783.99, 0.22, "sine", 0.08, 0.08);
    },
    step(index = 0) {
      const notes = [523.25, 587.33, 659.25, 783.99];
      playTone(notes[index % notes.length], 0.2, "triangle", 0.13, 0);
    },
    skip() {
      playTone(340, 0.18, "sine", 0.08, 0);
      playTone(290, 0.22, "sine", 0.07, 0.08);
    },
    victory() {
      const fanfare = [
        { f: 523.25, d: 0.22, t: 0.0 },
        { f: 659.25, d: 0.22, t: 0.12 },
        { f: 783.99, d: 0.25, t: 0.24 },
        { f: 1046.5, d: 0.65, t: 0.38 },
        { f: 783.99, d: 0.55, t: 0.38 },
        { f: 659.25, d: 0.55, t: 0.38 }
      ];
      fanfare.forEach((n) => playTone(n.f, n.d, "triangle", 0.12, n.t));
    }
  };

  // --------------------------------------------------------------------------
  // חישוב המסלול המפותל ביער (עקומות בזייה משותפות ל-SVG ולסמנים)
  // --------------------------------------------------------------------------
  function getMaxStep() {
    return state.mode === "full" ? 12 : 4;
  }

  function getStationStep(station) {
    return state.mode === "full" ? station.stepFull : station.stepShort;
  }

  function evalCubicBezier(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  function buildTrackGeometry() {
    const svgW = 1200;
    const svgH = 470;
    const segments = [];
    let pathD = `M ${(STATION_ANCHORS[0].x / 100) * svgW} ${(STATION_ANCHORS[0].y / 100) * svgH}`;

    for (let i = 0; i < STATION_ANCHORS.length - 1; i++) {
      const a = STATION_ANCHORS[i];
      const b = STATION_ANCHORS[i + 1];
      const dx = (b.x - a.x) * 0.45;
      const p0 = { x: a.x, y: a.y };
      const p1 = { x: a.x + dx, y: a.y };
      const p2 = { x: b.x - dx, y: b.y };
      const p3 = { x: b.x, y: b.y };
      segments.push({ p0, p1, p2, p3 });

      pathD += ` C ${(p1.x / 100) * svgW} ${(p1.y / 100) * svgH}, ${(p2.x / 100) * svgW} ${(p2.y / 100) * svgH}, ${(p3.x / 100) * svgW} ${(p3.y / 100) * svgH}`;
    }

    dom.trailShadow.setAttribute("d", pathD);
    dom.trailBase.setAttribute("d", pathD);
    dom.trailDash.setAttribute("d", pathD);

    // בניית רשימת הצעדים לפי מצב המסלול
    const nodes = [];
    if (state.mode === "full") {
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        nodes.push({ x: seg.p0.x, y: seg.p0.y, isStation: true, stationIndex: i });
        const wp1 = evalCubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, 1 / 3);
        const wp2 = evalCubicBezier(seg.p0, seg.p1, seg.p2, seg.p3, 2 / 3);
        nodes.push({ x: wp1.x, y: wp1.y, isStation: false });
        nodes.push({ x: wp2.x, y: wp2.y, isStation: false });
      }
      const last = STATION_ANCHORS[STATION_ANCHORS.length - 1];
      nodes.push({ x: last.x, y: last.y, isStation: true, stationIndex: 4 });
    } else {
      STATION_ANCHORS.forEach((a, idx) => {
        nodes.push({ x: a.x, y: a.y, isStation: true, stationIndex: idx });
      });
    }

    state.nodes = nodes;
  }

  function renderMapElements() {
    // אבני דרך (רק במסלול המלא)
    dom.waypointsLayer.innerHTML = "";
    state.nodes.forEach((node, idx) => {
      if (!node.isStation) {
        const wp = document.createElement("div");
        wp.className = "waypoint-dot";
        wp.style.left = `${node.x}%`;
        wp.style.top = `${node.y}%`;
        wp.textContent = idx;
        dom.waypointsLayer.appendChild(wp);
      }
    });

    // 5 התחנות הראשיות
    dom.stationsLayer.innerHTML = "";
    STATIONS.forEach((station, idx) => {
      const anchor = STATION_ANCHORS[idx];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "station-node";
      if (anchor.labelPos === "above") btn.classList.add("label-above");
      if (station.id === 5) btn.classList.add("station-final");
      btn.dataset.stationId = station.id;
      btn.style.left = `${anchor.x}%`;
      btn.style.top = `${anchor.y}%`;
      btn.setAttribute("aria-label", `תחנה ${station.id}: ${station.title}`);

      btn.innerHTML = `
        <div class="station-medallion">
          <span class="station-num-badge">${station.id}</span>
          ${STATION_ICONS[station.icon]}
        </div>
        <div class="station-plaque">
          <span class="station-title">${station.title}</span>
          <span class="station-sub">${station.subtitle}</span>
        </div>
      `;

      btn.addEventListener("click", () => {
        showStationInfo(station);
        playTone(520 + idx * 55, 0.12, "sine", 0.06);
      });

      dom.stationsLayer.appendChild(btn);
    });
  }

  function showStationInfo(station) {
    dom.stationInfoBadge.textContent = `תחנה ${station.id}`;
    dom.stationInfoTitle.textContent = `${station.title} (${station.subtitle})`;
    dom.stationInfoDesc.textContent = station.description;
  }

  function getStationForStep(step) {
    let current = STATIONS[0];
    for (const s of STATIONS) {
      if (step >= getStationStep(s)) {
        current = s;
      }
    }
    return current;
  }

  // --------------------------------------------------------------------------
  // עדכון מיקום סמני הקבוצות ומצב הממשק
  // --------------------------------------------------------------------------
  function getTokenOffset(node, teamKey, sameSpot) {
    // ממקמים את הסמן בצד הנגדי ללוחית התחנה כדי לא להסתיר את שם התחנה או את האייקון
    let dy = 0;
    if (node.isStation) {
      const anchor = STATION_ANCHORS[node.stationIndex];
      dy = anchor.labelPos === "above" ? 8.5 : -9.5;
    }
    const dx = sameSpot ? (teamKey === "A" ? 2.6 : -2.6) : 0;
    return { dx, dy };
  }

  function updateTokensPosition() {
    const maxStep = getMaxStep();
    const posA = Math.min(state.teams.A.pos, maxStep);
    const posB = Math.min(state.teams.B.pos, maxStep);

    const nodeA = state.nodes[posA];
    const nodeB = state.nodes[posB];
    const sameSpot = posA === posB;

    if (nodeA) {
      const { dx, dy } = getTokenOffset(nodeA, "A", sameSpot);
      dom.tokenA.style.left = `${nodeA.x + dx}%`;
      dom.tokenA.style.top = `${nodeA.y + dy}%`;
    }

    if (nodeB) {
      const { dx, dy } = getTokenOffset(nodeB, "B", sameSpot);
      dom.tokenB.style.left = `${nodeB.x + dx}%`;
      dom.tokenB.style.top = `${nodeB.y + dy}%`;
    }

    dom.tokenA.classList.toggle("active-token", state.activeTeam === "A" && !state.winner);
    dom.tokenB.classList.toggle("active-token", state.activeTeam === "B" && !state.winner);

    // הדגשת תחנות שבהן נמצאת קבוצה
    const stationNodes = dom.stationsLayer.querySelectorAll(".station-node");
    stationNodes.forEach((el, idx) => {
      const stStep = getStationStep(STATIONS[idx]);
      const hasTeam = posA === stStep || posB === stStep;
      el.classList.toggle("has-team", hasTeam);
    });
  }

  function getUnusedByLevel(level) {
    return QUESTIONS_BANK.filter(
      (q) => q.level === level && !state.usedQuestionIds.has(q.id)
    );
  }

  function updateUI() {
    const maxStep = getMaxStep();
    const teamA = state.teams.A;
    const teamB = state.teams.B;

    // שמות הקבוצות בכל המקומות
    dom.nameTeamA.textContent = teamA.name;
    dom.nameTeamB.textContent = teamB.name;
    dom.tokenTagA.textContent = teamA.name;
    dom.tokenTagB.textContent = teamB.name;

    // באנר התור הפעיל (או באנר ניצחון אם המשחק הוכרע)
    const turnLabelEl = dom.turnBanner.querySelector(".turn-label");
    const turnHintEl = dom.turnBanner.querySelector(".turn-switch-hint");
    if (state.winner) {
      dom.turnBanner.classList.remove("team-b-turn");
      dom.turnBanner.classList.add("winner-banner");
      turnLabelEl.textContent = "🏆 מנצחת:";
      dom.turnTeamName.textContent = state.teams[state.winner].name;
      turnHintEl.textContent = "לחצו לחגיגה";
    } else {
      const activeObj = state.teams[state.activeTeam];
      dom.turnBanner.classList.remove("winner-banner");
      dom.turnBanner.classList.toggle("team-b-turn", state.activeTeam === "B");
      turnLabelEl.textContent = "תור עכשיו:";
      dom.turnTeamName.textContent = activeObj.name;
      turnHintEl.textContent = "⇄ החלף";
    }

    // כרטיסי קבוצות
    dom.teamCardA.classList.toggle("active", state.activeTeam === "A");
    dom.teamCardB.classList.toggle("active", state.activeTeam === "B");
    dom.pillTeamA.textContent = state.activeTeam === "A" ? "תורם עכשיו!" : "ממתינים לתור";
    dom.pillTeamB.textContent = state.activeTeam === "B" ? "תורם עכשיו!" : "ממתינים לתור";

    dom.stepBadgeA.textContent = `${teamA.pos} / ${maxStep}`;
    dom.stepBadgeB.textContent = `${teamB.pos} / ${maxStep}`;

    const stA = getStationForStep(teamA.pos);
    const stB = getStationForStep(teamB.pos);
    dom.stationLabelA.textContent = `תחנה ${stA.id}: ${stA.title}`;
    dom.stationLabelB.textContent = `תחנה ${stB.id}: ${stB.title}`;

    dom.progressA.style.width = `${Math.min(100, (teamA.pos / maxStep) * 100)}%`;
    dom.progressB.style.width = `${Math.min(100, (teamB.pos / maxStep) * 100)}%`;

    // ספירת שאלות נותרות
    const gLeft = getUnusedByLevel("green").length;
    const yLeft = getUnusedByLevel("yellow").length;
    const rLeft = getUnusedByLevel("red").length;
    const totalLeft = gLeft + yLeft + rLeft;

    dom.remainingTotal.textContent = totalLeft;
    dom.countGreen.textContent = gLeft > 0 ? `${gLeft} שאלות` : "רענן מאגר ↻";
    dom.countYellow.textContent = yLeft > 0 ? `${yLeft} שאלות` : "רענן מאגר ↻";
    dom.countRed.textContent = rLeft > 0 ? `${rLeft} שאלות` : "רענן מאגר ↻";

    // כלי ניהול למורה
    dom.manualPosA.textContent = teamA.pos;
    dom.manualPosB.textContent = teamB.pos;
    dom.modeFullBtn.classList.toggle("active", state.mode === "full");
    dom.modeShortBtn.classList.toggle("active", state.mode === "short");

    // עדכון מיקום סמנים
    updateTokensPosition();
  }

  // --------------------------------------------------------------------------
  // טוסט הודעה קצר מעל המפה
  // --------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    dom.stepToast.textContent = message;
    dom.stepToast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.stepToast.classList.remove("visible");
    }, 2300);
  }

  // --------------------------------------------------------------------------
  // פתיחת כרטיסיית שאלה וניהול רמז / תשובה
  // --------------------------------------------------------------------------
  function openQuestionByLevel(level) {
    if (state.isAnimating) return;

    let pool = getUnusedByLevel(level);
    if (pool.length === 0) {
      // רענון אוטומטי של רמה שנגמרה כדי שהשיעור לא ייתקע
      QUESTIONS_BANK.filter((q) => q.level === level).forEach((q) => {
        state.usedQuestionIds.delete(q.id);
      });
      pool = getUnusedByLevel(level);
      showToast(`מאגר השאלות (${DIFFICULTIES[level].shortLabel}) רוענן!`);
    }

    const nextQ = pool[0];
    openQuestionModal(nextQ);
  }

  function openQuestionModal(question) {
    state.currentQuestion = question;
    const diff = DIFFICULTIES[question.level];
    const team = state.teams[state.activeTeam];

    dom.qAccentBar.className = `q-accent-bar level-${question.level}`;

    dom.qTeamBadge.textContent = `עונה עכשיו: ${team.name}`;
    dom.qTeamBadge.className = `q-team-badge ${state.activeTeam === "B" ? "team-b" : ""}`;

    dom.qLevelBadge.textContent = `${diff.label} • ${diff.stepText}`;
    dom.qLevelBadge.className = `q-level-badge level-${question.level}`;

    dom.qTopicBadge.textContent = question.topic;
    dom.qText.textContent = question.question;

    // איפוס רמז ותשובה
    dom.hintBox.hidden = true;
    dom.hintToggleBtn.classList.remove("active");
    dom.hintContent.innerHTML = question.hint;

    dom.answerBox.hidden = true;
    dom.answerToggleBtn.classList.remove("active");
    dom.answerToggleText.textContent = "הצג תשובה מלאה למורה";
    dom.answerContent.innerHTML = question.answer.map((line) => `<li>${line}</li>`).join("");

    const stepWord = diff.steps === 1 ? "צעד אחד" : `${diff.steps} צעדים`;
    dom.correctAdvanceText.textContent = `ענו נכון – קדם את ${team.name} (+${stepWord})`;

    dom.questionModal.hidden = false;
    SFX.openCard();
  }

  function closeQuestionModal(markAsUsed) {
    if (state.currentQuestion && markAsUsed) {
      state.usedQuestionIds.add(state.currentQuestion.id);
    }
    state.currentQuestion = null;
    dom.questionModal.hidden = true;
    updateUI();
  }

  function toggleHint() {
    const isOpening = dom.hintBox.hidden;
    dom.hintBox.hidden = !isOpening;
    dom.hintToggleBtn.classList.toggle("active", isOpening);
    if (isOpening) SFX.hint();
  }

  function toggleAnswer() {
    const isOpening = dom.answerBox.hidden;
    dom.answerBox.hidden = !isOpening;
    dom.answerToggleBtn.classList.toggle("active", isOpening);
    dom.answerToggleText.textContent = isOpening
      ? "הסתר תשובה מלאה למורה"
      : "הצג תשובה מלאה למורה";
    if (isOpening) playTone(587.33, 0.14, "sine", 0.08);
  }

  // --------------------------------------------------------------------------
  // התקדמות מונפשת צעד-אחר-צעד על המפה + בדיקת ניצחון בתחנה 5
  // --------------------------------------------------------------------------
  async function advanceActiveTeam(stepsToMove) {
    const teamKey = state.activeTeam;
    const team = state.teams[teamKey];
    const tokenEl = teamKey === "A" ? dom.tokenA : dom.tokenB;
    const maxStep = getMaxStep();

    state.isAnimating = true;
    team.correctCount += 1;

    const stepLabel = stepsToMove === 1 ? "+1 צעד" : `+${stepsToMove} צעדים`;
    showToast(`כל הכבוד ${team.name}! ${stepLabel} קדימה ✨`);

    for (let i = 0; i < stepsToMove; i++) {
      if (team.pos >= maxStep) break;
      team.pos += 1;

      tokenEl.classList.remove("hopping");
      // הפעלה מחדש של אנימציית הקפיצה
      void tokenEl.offsetWidth;
      tokenEl.classList.add("hopping");

      SFX.step(i);
      updateUI();

      // עדכון סרגל תחנה אם נחתנו בתחנה חדשה
      const landedStation = STATIONS.find((s) => getStationStep(s) === team.pos);
      if (landedStation) {
        showStationInfo(landedStation);
      }

      await new Promise((resolve) => setTimeout(resolve, 480));
    }

    tokenEl.classList.remove("hopping");
    state.isAnimating = false;

    // בדיקת ניצחון: הגעה לתחנה 5!
    if (team.pos >= maxStep) {
      state.winner = teamKey;
      updateUI();
      setTimeout(() => triggerVictory(teamKey), 250);
    } else {
      // החלפת תור לקבוצה השנייה
      state.activeTeam = teamKey === "A" ? "B" : "A";
      updateUI();
    }
  }

  function handleCorrectAnswer() {
    if (!state.currentQuestion || state.isAnimating) return;
    const steps = DIFFICULTIES[state.currentQuestion.level].steps;
    closeQuestionModal(true);
    advanceActiveTeam(steps);
  }

  function handleSkipTurn() {
    if (!state.currentQuestion || state.isAnimating) return;
    closeQuestionModal(true);
    SFX.skip();
    state.activeTeam = state.activeTeam === "A" ? "B" : "A";
    showToast(`התור עובר אל ${state.teams[state.activeTeam].name}`);
    updateUI();
  }

  // --------------------------------------------------------------------------
  // כלי ניהול למורה
  // --------------------------------------------------------------------------
  function renderQuestionPicker() {
    dom.questionPickerList.innerHTML = "";
    QUESTIONS_BANK.forEach((q, index) => {
      const diff = DIFFICULTIES[q.level];
      const used = state.usedQuestionIds.has(q.id);
      const item = document.createElement("button");
      item.type = "button";
      item.className = `picker-item ${used ? "used" : ""}`;
      item.innerHTML = `
        <span class="picker-tag ${q.level}">${diff.shortLabel} (${diff.stepText})</span>
        <span class="picker-title">${index + 1}. ${q.topic}: ${q.question}</span>
        <span class="picker-status">${used ? "נשאלה ✓" : "פנויה"}</span>
      `;
      item.addEventListener("click", () => {
        dom.teacherModal.hidden = true;
        openQuestionModal(q);
      });
      dom.questionPickerList.appendChild(item);
    });
  }

  function openTeacherModal() {
    dom.inputNameA.value = state.teams.A.name;
    dom.inputNameB.value = state.teams.B.name;
    renderQuestionPicker();
    updateUI();
    dom.teacherModal.hidden = false;
  }

  function adjustTeamPos(teamKey, delta) {
    const maxStep = getMaxStep();
    const team = state.teams[teamKey];
    team.pos = Math.max(0, Math.min(maxStep, team.pos + delta));
    if (team.pos < maxStep && state.winner === teamKey) {
      state.winner = null;
    }
    updateUI();
    if (team.pos >= maxStep) {
      dom.teacherModal.hidden = true;
      state.winner = teamKey;
      triggerVictory(teamKey);
    }
  }

  function switchTrackMode(newMode) {
    if (state.mode === newMode) return;
    const oldMax = getMaxStep();
    state.mode = newMode;
    const newMax = getMaxStep();

    // המרה יחסית של מיקום הקבוצות כדי לא לאבד התקדמות באמצע שיעור
    ["A", "B"].forEach((k) => {
      const ratio = state.teams[k].pos / oldMax;
      state.teams[k].pos = Math.min(newMax, Math.round(ratio * newMax));
    });

    buildTrackGeometry();
    renderMapElements();
    updateUI();
    showToast(
      newMode === "full"
        ? "עברתם למסלול מלא (12 צעדים)"
        : "עברתם למסלול מהיר (5 תחנות)"
    );
  }

  function resetGame() {
    stopConfetti();
    state.winner = null;
    state.activeTeam = "A";
    state.teams.A.pos = 0;
    state.teams.A.correctCount = 0;
    state.teams.B.pos = 0;
    state.teams.B.correctCount = 0;
    state.usedQuestionIds.clear();
    state.currentQuestion = null;

    dom.victoryOverlay.hidden = true;
    dom.teacherModal.hidden = true;
    dom.questionModal.hidden = true;

    showStationInfo(STATIONS[0]);
    updateUI();
    showToast("משחק חדש התחיל! בהצלחה לשתי הקבוצות 🌲");
  }

  // --------------------------------------------------------------------------
  // אפקט ניצחון חגיגי: קונפטי וזיקוקים בזהב וצבעי היער
  // --------------------------------------------------------------------------
  let confettiAnimId = null;
  let confettiParticles = [];

  function triggerVictory(winnerKey) {
    const winner = state.teams[winnerKey];
    const maxStep = getMaxStep();

    dom.victoryTitle.textContent = `${winner.name} ברחה מהיער של הלני!`;
    dom.victoryTitle.style.color = winnerKey === "A" ? "#67e8f9" : "#f9a8d4";

    dom.victorySummary.innerHTML = ["A", "B"]
      .map((k) => {
        const t = state.teams[k];
        const st = getStationForStep(t.pos);
        const isWin = k === winnerKey;
        return `
          <div class="victory-stat ${isWin ? "winner" : ""}">
            <strong>${isWin ? "🏆 " : ""}${t.name}</strong>
            <span>תחנה ${st.id} (${t.pos}/${maxStep} צעדים) • ${t.correctCount} תשובות נכונות</span>
          </div>
        `;
      })
      .join("");

    dom.victoryOverlay.hidden = false;
    SFX.victory();
    startConfetti();
  }

  function startConfetti() {
    const canvas = dom.confettiCanvas;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const colors = [
      "#fde047", "#f7d47c", "#22d3ee", "#f472b6",
      "#4ade80", "#ffffff", "#fb923c"
    ];

    confettiParticles = [];
    for (let i = 0; i < 165; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: 7 + Math.random() * 9,
        h: 5 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 3.4,
        vy: 2.2 + Math.random() * 4.2,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.16,
        color: colors[i % colors.length],
        shape: i % 4 === 0 ? "circle" : "rect"
      });
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.42, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      });
      confettiAnimId = requestAnimationFrame(frame);
    }

    stopConfetti();
    confettiAnimId = requestAnimationFrame(frame);
  }

  function stopConfetti() {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
  }

  // --------------------------------------------------------------------------
  // יצירת גחליליות אווירתיות עדינות ברקע
  // --------------------------------------------------------------------------
  function spawnFireflies() {
    dom.fireflies.innerHTML = "";
    for (let i = 0; i < 18; i++) {
      const f = document.createElement("span");
      f.className = "firefly";
      f.style.left = `${4 + Math.random() * 92}%`;
      f.style.top = `${10 + Math.random() * 82}%`;
      f.style.setProperty("--dur", `${7 + Math.random() * 7}s`);
      f.style.setProperty("--delay", `${Math.random() * 6}s`);
      f.style.setProperty("--dx", `${(Math.random() - 0.5) * 70}px`);
      f.style.setProperty("--dy", `${-15 - Math.random() * 45}px`);
      dom.fireflies.appendChild(f);
    }
  }

  // --------------------------------------------------------------------------
  // חיבור אירועים (Event Listeners)
  // --------------------------------------------------------------------------
  function bindEvents() {
    // 3 כפתורי רמות הקושי
    dom.btnGreen.addEventListener("click", () => openQuestionByLevel("green"));
    dom.btnYellow.addEventListener("click", () => openQuestionByLevel("yellow"));
    dom.btnRed.addEventListener("click", () => openQuestionByLevel("red"));

    // החלפת תור ידנית מבאנר התור (או פתיחה מחדש של חגיגת הניצחון)
    dom.turnBanner.addEventListener("click", () => {
      if (state.winner) {
        triggerVictory(state.winner);
        return;
      }
      state.activeTeam = state.activeTeam === "A" ? "B" : "A";
      playTone(480, 0.1, "sine", 0.06);
      updateUI();
    });

    const selectTeam = (teamKey) => {
      if (state.activeTeam !== teamKey) {
        state.activeTeam = teamKey;
        playTone(480, 0.1, "sine", 0.06);
        updateUI();
      }
    };

    dom.teamCardA.addEventListener("click", () => selectTeam("A"));
    dom.teamCardB.addEventListener("click", () => selectTeam("B"));
    dom.teamCardA.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTeam("A");
      }
    });
    dom.teamCardB.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTeam("B");
      }
    });

    // כפתורי כרטיסיית השאלה
    dom.hintToggleBtn.addEventListener("click", toggleHint);
    dom.answerToggleBtn.addEventListener("click", toggleAnswer);
    dom.correctAdvanceBtn.addEventListener("click", handleCorrectAnswer);
    dom.continueNoAdvanceBtn.addEventListener("click", handleSkipTurn);
    dom.qCloseBtn.addEventListener("click", () => closeQuestionModal(false));

    // השתקה / הפעלת צלילים
    dom.soundToggleBtn.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      dom.soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
      if (state.soundEnabled) playTone(600, 0.12, "sine", 0.08);
    });

    // כלי ניהול למורה
    dom.teacherToolsBtn.addEventListener("click", openTeacherModal);
    dom.teacherCloseBtn.addEventListener("click", () => {
      dom.teacherModal.hidden = true;
    });

    dom.inputNameA.addEventListener("input", (e) => {
      state.teams.A.name = e.target.value.trim() || "קבוצה א'";
      updateUI();
    });

    dom.inputNameB.addEventListener("input", (e) => {
      state.teams.B.name = e.target.value.trim() || "קבוצה ב'";
      updateUI();
    });

    dom.decA.addEventListener("click", () => adjustTeamPos("A", -1));
    dom.incA.addEventListener("click", () => adjustTeamPos("A", 1));
    dom.decB.addEventListener("click", () => adjustTeamPos("B", -1));
    dom.incB.addEventListener("click", () => adjustTeamPos("B", 1));

    dom.modeFullBtn.addEventListener("click", () => switchTrackMode("full"));
    dom.modeShortBtn.addEventListener("click", () => switchTrackMode("short"));

    dom.resetQuestionsBtn.addEventListener("click", () => {
      state.usedQuestionIds.clear();
      renderQuestionPicker();
      updateUI();
      showToast("כל 15 השאלות אופסו וזמינות שוב!");
    });

    dom.resetGameBtn.addEventListener("click", resetGame);

    // כפתורי מסך הניצחון
    dom.victoryNewGameBtn.addEventListener("click", resetGame);
    dom.victoryViewMapBtn.addEventListener("click", () => {
      stopConfetti();
      dom.victoryOverlay.hidden = true;
    });

    // סגירה בלחיצה על הרקע של חלון המורה
    dom.teacherModal.addEventListener("click", (e) => {
      if (e.target === dom.teacherModal) dom.teacherModal.hidden = true;
    });

    // קיצורי מקלדת נוחים למורה
    document.addEventListener("keydown", (e) => {
      if (!dom.questionModal.hidden) {
        if (e.key === "Escape") {
          closeQuestionModal(false);
        } else if (e.key.toLowerCase() === "h" || e.key === "י") {
          toggleHint();
        } else if (e.key.toLowerCase() === "a" || e.key === "ש") {
          toggleAnswer();
        }
      } else if (!dom.teacherModal.hidden && e.key === "Escape") {
        dom.teacherModal.hidden = true;
      }
    });
  }

  // --------------------------------------------------------------------------
  // אתחול האפליקציה
  // --------------------------------------------------------------------------
  function init() {
    spawnFireflies();
    buildTrackGeometry();
    renderMapElements();
    showStationInfo(STATIONS[0]);
    bindEvents();
    updateUI();
  }

  init();
})();
