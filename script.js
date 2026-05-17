const praiseList = [
    "检测到今日「好好」成分过高，宇宙甜度已超标 100%！🍯",
    "不管今天谁惹你生气，在本蜂蜜罐这里，好好永远是对的！(叉腰) 🐝",
    "小蜜蜂嗡嗡嗡，今天也想不通——为什么好好能这么可爱啊？",
    "恭喜抓到一只「摸鱼蜂」！今天适合奖励自己一杯奶茶哦。🧋",
    "今天的好好也是 100% 的完美与耀眼，冲鸭！✨"
];

const honeyZone = document.getElementById('honey-label-zone');
const container = document.querySelector('.game-container');
const signpost = document.getElementById('signpost-zone');
const taskListEl = document.getElementById('task-list');
const lamp = document.getElementById('street-lamp');
const goldenRain = document.getElementById('golden-rain');
const celebrationToast = document.getElementById('celebration-toast');

const TASKS_KEY = 'honey-garden-tasks';
const DAILY_TASK_COUNT = 3;
let wasAllComplete = false;

/** 15 条可爱好心情航线（每日轮换展示其中 3 条） */
const TASK_POOL = [
    { id: 'stretch', text: '🌿 抖抖肩膀，松松小翅膀' },
    { id: 'water', text: '🍯 给蜜蜂罐加满温水' },
    { id: 'smile', text: '😊 对镜子甜甜笑一下' },
    { id: 'breathe', text: '🫧 深呼吸三次，呼走小烦恼' },
    { id: 'gratitude', text: '✨ 记下今天一颗小开心' },
    { id: 'music', text: '🎵 听一首最爱的歌' },
    { id: 'sunshine', text: '☀️ 晒晒太阳充充电' },
    { id: 'warm-msg', text: '💌 给喜欢的人发句暖暖话' },
    { id: 'neck', text: '🐝 伸个懒腰，嗡嗡一下' },
    { id: 'screen-break', text: '🌸 闭眼休息 5 分钟' },
    { id: 'sweet', text: '🧁 奖励自己一口小甜蜜' },
    { id: 'kind-word', text: '💖 夸夸今天超棒的你' },
    { id: 'tidy', text: '🍃 收拾小角落，心情也亮' },
    { id: 'hum', text: '🎶 小声哼 10 秒小曲' },
    { id: 'praise', text: '⭐ 给今天的自己点颗星' }
];

function getTodayKey() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}

function pickDailyTasks(dateKey) {
    const indices = TASK_POOL.map((_, i) => i);
    let seed = dateKey.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0);
    seed = Math.abs(seed);
    const rand = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, DAILY_TASK_COUNT).map(i => TASK_POOL[i]);
}

function getCheckboxes() {
    return taskListEl ? taskListEl.querySelectorAll('.task-chk') : [];
}

function renderDailyTasks() {
    if (!taskListEl) return;
    const todayKey = getTodayKey();
    const daily = pickDailyTasks(todayKey);

    taskListEl.innerHTML = daily.map(task => `
        <label class="task-item">
            <input type="checkbox" class="task-chk" data-task-id="${task.id}">
            ${task.text}
        </label>
    `).join('');

    getCheckboxes().forEach(chk => {
        chk.addEventListener('change', () => {
            saveTasks();
            updateLamp();
        });
    });
}

function loadTasks() {
    try {
        const todayKey = getTodayKey();
        const saved = JSON.parse(localStorage.getItem(TASKS_KEY) || '{}');
        const checked = saved.date === todayKey ? (saved.checked || {}) : {};
        getCheckboxes().forEach(chk => {
            chk.checked = !!checked[chk.dataset.taskId];
        });
        wasAllComplete = getCheckboxes().length > 0 &&
            Array.from(getCheckboxes()).every(c => c.checked);
        updateLamp(false);
    } catch (_) { /* ignore */ }
}

function saveTasks() {
    const checked = {};
    getCheckboxes().forEach(chk => {
        checked[chk.dataset.taskId] = chk.checked;
    });
    localStorage.setItem(TASKS_KEY, JSON.stringify({
        date: getTodayKey(),
        checked
    }));
}

// 蜜罐夸夸
honeyZone.addEventListener('click', (e) => {
    spawnRipple(e, honeyZone);
    container.classList.add('shake-animation');
    setTimeout(() => {
        container.classList.remove('shake-animation');
        document.getElementById('fortune-text').innerText =
            praiseList[Math.floor(Math.random() * praiseList.length)];
        openModal('fortune-modal');
    }, 500);
});

// 心形门 · 茶饮铺
document.getElementById('heart-door-zone').addEventListener('click', (e) => {
    spawnRipple(e, e.currentTarget);
    document.getElementById('mood-input').value = '';
    document.getElementById('tea-result').classList.add('hidden');
    openModal('door-modal');
});

function brewTea(mood) {
    const delivery = document.getElementById('tea-delivery');
    const teas = {
        '😊': "🍋 <b>日光佛手柑柠檬蜂蜜茶</b><br>小蜜蜂把好好的快乐偷偷酿成了这一杯！喝下它，快乐魔法续航一整天！",
        '😮‍💨': "☕ <b>暖呼呼肉桂生姜红茶蜂蜜饮</b><br>辛苦啦！今天的好好也是超级厉害的。喝下这杯，今晚允许自己早点钻进被窝充电！",
        '🥺': "🪻 <b>静心舒压洋甘菊薰衣草蜜渍茶</b><br>小蜜蜂已经把你的焦虑全部倒掉啦。摸摸头，全世界最棒的好好，今晚一定有个好梦。"
    };
    delivery.innerHTML = teas[mood] || teas['😊'];
    document.getElementById('tea-result').classList.remove('hidden');
}

// 木牌翻转
signpost.addEventListener('click', (e) => {
    if (e.target.classList.contains('task-chk')) return;
    signpost.classList.toggle('flipped');
});

function updateLamp(celebrate = true) {
    const boxes = getCheckboxes();
    const allChecked = Array.from(boxes).every(c => c.checked);
    if (allChecked && boxes.length > 0) {
        lamp.classList.add('lit');
        if (celebrate && !wasAllComplete) {
            spawnGoldenRain();
            showCelebration();
        }
        wasAllComplete = true;
    } else {
        lamp.classList.remove('lit');
        wasAllComplete = false;
    }
}

function spawnGoldenRain() {
    goldenRain.classList.add('active');
    goldenRain.innerHTML = '';
    for (let i = 0; i < 36; i++) {
        const s = document.createElement('span');
        s.className = 'sparkle';
        s.style.left = Math.random() * 100 + '%';
        s.style.animationDelay = Math.random() * 0.8 + 's';
        s.style.width = s.style.height = (6 + Math.random() * 8) + 'px';
        goldenRain.appendChild(s);
    }
    setTimeout(() => {
        goldenRain.classList.remove('active');
        goldenRain.innerHTML = '';
    }, 2800);
}

function showCelebration() {
    celebrationToast.classList.add('show');
    setTimeout(() => celebrationToast.classList.remove('show'), 4000);
}

function spawnRipple(e, parent) {
    const rect = parent.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'click-ripple';
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    parent.style.position = 'absolute';
    parent.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

// ========== 蜂巢 · 透明热区点击（八音盒 + 信使蜂） ==========
const beehiveZone = document.getElementById('beehive-zone');
const musicAudio = document.getElementById('music-box-audio');
const beeMessengerLayer = document.getElementById('bee-messenger-layer');
const beeFloaters = document.querySelector('.bee-floaters');

let isMusicPlaying = false;
let musicBoxSynth = null;

const MUSIC_BOX_MELODY = [523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33];

beehiveZone.addEventListener('click', () => {
    beehiveZone.classList.add('hive-shake');
    setTimeout(() => beehiveZone.classList.remove('hive-shake'), 550);

    toggleMusicBox();
    spawnBee();
});

function toggleMusicBox() {
    if (isMusicPlaying) {
        pauseMusicBox();
    } else {
        playMusicBox();
    }
}

async function playMusicBox() {
    if (musicAudio) {
        try {
            await musicAudio.play();
            isMusicPlaying = true;
            beehiveZone.classList.add('music-playing');
            return;
        } catch (_) {
            /* 无 music-box.mp3 或浏览器拦截时，改用 Web Audio 合成 */
        }
    }
    startSynthMusicBox();
    isMusicPlaying = true;
    beehiveZone.classList.add('music-playing');
}

function pauseMusicBox() {
    if (musicAudio) {
        musicAudio.pause();
    }
    stopSynthMusicBox();
    isMusicPlaying = false;
    beehiveZone.classList.remove('music-playing');
}

function startSynthMusicBox() {
    if (musicBoxSynth) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    let step = 0;
    let nextNote = ctx.currentTime + 0.1;

    const schedule = () => {
        if (!musicBoxSynth || !isMusicPlaying) return;
        while (nextNote < ctx.currentTime + 0.2) {
            const freq = MUSIC_BOX_MELODY[step % MUSIC_BOX_MELODY.length];
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, nextNote);
            gain.gain.linearRampToValueAtTime(0.12, nextNote + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, nextNote + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(nextNote);
            osc.stop(nextNote + 0.5);
            step++;
            nextNote += 0.48;
        }
        musicBoxSynth.timer = requestAnimationFrame(schedule);
    };

    musicBoxSynth = { ctx, timer: null };
    if (ctx.state === 'suspended') ctx.resume();
    schedule();
}

function stopSynthMusicBox() {
    if (!musicBoxSynth) return;
    cancelAnimationFrame(musicBoxSynth.timer);
    musicBoxSynth.ctx.close().catch(() => {});
    musicBoxSynth = null;
}

/**
 * 从蜂巢小门弹出信使蜂，盘旋半圈后飞入天空大家庭
 */
function spawnBee() {
    const door = document.getElementById('hive-door');
    const gameContainer = document.querySelector('.game-container');
    if (!door || !beeMessengerLayer || !gameContainer) return;

    const cRect = gameContainer.getBoundingClientRect();
    const dRect = door.getBoundingClientRect();

    const sx = ((dRect.left + dRect.width / 2 - cRect.left) / cRect.width) * 100;
    const sy = ((dRect.top + dRect.height / 2 - cRect.top) / cRect.height) * 100;

    const ex = 58 + Math.random() * 28;
    const ey = 6 + Math.random() * 14;
    const arcX = (Math.random() > 0.5 ? 6 : -6) + 'vw';

    const bee = document.createElement('span');
    bee.className = 'messenger-bee';
    bee.textContent = '🐝';
    bee.style.left = sx + '%';
    bee.style.top = sy + '%';
    bee.style.setProperty('--sx', sx + '%');
    bee.style.setProperty('--sy', sy + '%');
    bee.style.setProperty('--ex', ex + '%');
    bee.style.setProperty('--ey', ey + '%');
    bee.style.setProperty('--arc-x', arcX);
    bee.style.setProperty('--fly-dur', '2.6s');
    bee.style.animation = 'messengerPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

    beeMessengerLayer.appendChild(bee);

    setTimeout(() => {
        bee.style.animation = '';
        bee.classList.add('flying');
    }, 400);

    setTimeout(() => {
        bee.remove();
        joinBeeFamily(ex + '%', ey + '%');
    }, 3100);
}

function joinBeeFamily(left, top) {
    if (!beeFloaters) return;
    const newcomer = document.createElement('span');
    newcomer.className = 'mini-bee joined-bee';
    newcomer.textContent = '🐝';
    newcomer.style.setProperty('--bx', left);
    newcomer.style.setProperty('--by', top);
    newcomer.style.setProperty('--bd', (Math.random() * 4) + 's');
    beeFloaters.appendChild(newcomer);
}

renderDailyTasks();
loadTasks();
