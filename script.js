// --- 数据配置 ---
const ROOM_TYPES = {
    'math': { name: '数学实验室', cost: 50000, power: 15 },
    'english': { name: '同声传译室', cost: 45000, power: 12 },
    'science': { name: '微机中心', cost: 70000, power: 20 },
    'music': { name: '歌剧院', cost: 60000, power: 10, pressure: -10 },
    'kitchen': { name: '烹饪教室', cost: 30000, power: 8, income: 200 },
    'dorm': { name: '高级公寓', cost: 80000, capacity: 50 },
    'clinic': { name: '心理咨询室', cost: 40000, pressure: -20 }
};

const TEACHER_NAMES = ["张老师", "王博", "李教授", "Emma", "Dr. Chen", "莫师傅"];

let gameState = {
    money: 1000000,
    pressure: 0,
    reputation: 60,
    students: 0,
    round: 1,
    mode: 2, // 1:Happy, 2:Normal, 3:Hard
    slots: Array(24).fill(null),
    teachers: [],
    marketTeachers: [],
    skills: { speech: false, shield: false, data: false },
    luxuries: [],
    totalStudy: 0,
    selectedSlot: null
};

// --- 初始化 ---
function init() {
    const campus = document.getElementById('campus');
    campus.innerHTML = '';
    gameState.slots.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'slot' + (s ? ' built' : '');
        div.innerHTML = s ? `${s.name}<span class="lv-tag">Lv.${s.lv}</span>` : '空地 (点击建造)';
        div.onclick = () => openBuildModal(i);
        campus.appendChild(div);
    });
    refreshTeacherMarket();
    renderSkills();
    updateUI();
}

// --- 建造系统 ---
function openBuildModal(index) {
    gameState.selectedSlot = index;
    const modal = document.getElementById('build-modal');
    const options = document.getElementById('build-options');
    options.innerHTML = '';
    
    for (let key in ROOM_TYPES) {
        const r = ROOM_TYPES[key];
        const btn = document.createElement('button');
        btn.style.margin = '5px';
        btn.style.padding = '10px';
        btn.innerHTML = `${r.name} (¥${r.cost})`;
        btn.onclick = () => buildRoom(key);
        options.appendChild(btn);
    }
    modal.style.display = 'block';
}

function buildRoom(type) {
    const roomInfo = ROOM_TYPES[type];
    if (gameState.money >= roomInfo.cost) {
        gameState.money -= roomInfo.cost;
        gameState.slots[gameState.selectedSlot] = { 
            ...roomInfo, 
            type: type, 
            lv: 1 
        };
        addLog(`成功建造了 ${roomInfo.name}`);
        closeModal();
        init();
    } else {
        alert("钱不够！");
    }
}

function closeModal() {
    document.getElementById('build-modal').style.display = 'none';
}

// --- 教师系统 ---
function refreshTeacherMarket() {
    const market = document.getElementById('teacher-market');
    market.innerHTML = '';
    gameState.marketTeachers = [];
    for (let i = 0; i < 3; i++) {
        let salary = 2000 + Math.floor(Math.random() * 2000);
        let power = Math.floor(salary / 100);
        let t = { name: TEACHER_NAMES[Math.floor(Math.random()*6)], salary, power, sub: ['理科','文科','艺术'][i] };
        gameState.marketTeachers.push(t);
        market.innerHTML += `
            <div class="card">
                <h4>${t.name} (${t.sub})</h4>
                <p>月薪: ¥${t.salary}</p>
                <p>教学力: +${t.power}</p>
                <button onclick="hireTeacher(${i})">签约</button>
            </div>`;
    }
}

function hireTeacher(idx) {
    let t = gameState.marketTeachers[idx];
    gameState.teachers.push(t);
    addLog(`聘请了 ${t.name}，月薪 ¥${t.salary}`);
    refreshTeacherMarket();
    updateUI();
}

// --- 结算系统 (核心逻辑) ---
function nextRound() {
    // 检查开学门槛
    const builtCount = gameState.slots.filter(s => s !== null).length;
    if (builtCount < 6 || gameState.teachers.length < 6) {
        alert("开学失败！至少需要6间教室和6名老师。");
        return;
    }

    addLog(`--- 第 ${gameState.round} 学期结算 ---`);

    // 1. 基础教学力与压力计算
    let basePower = gameState.teachers.reduce((s, t) => s + t.power, 0);
    let roomPower = gameState.slots.reduce((s, r) => s + (r ? (r.power || 0) : 0), 0);
    let totalPower = (basePower + roomPower);

    // 教学模式修正
    let studyMult = [0.5, 1, 2][gameState.mode - 1];
    let pressMult = [0.2, 1, 3][gameState.mode - 1];

    let studyGain = totalPower * studyMult;
    let pressGain = (totalPower / 4) * pressMult;

    // 2. 设施修正压力
    let pressRed = gameState.slots.reduce((s, r) => s + (r ? (r.pressure || 0) : 0), 0);
    gameState.pressure = Math.max(0, Math.min(100, gameState.pressure + pressGain + pressRed));

    // 3. 财务结算
    let tuitionBase = 5000; 
    let tuition = gameState.students * tuitionBase;
    let salaries = gameState.teachers.reduce((s, t) => s + t.salary, 0);
    let govGrant = gameState.reputation * 200; // 每回合政府补助
    
    let net = tuition + govGrant - salaries;
    gameState.money += net;

    // 4. 毕业生反馈 (每10学期)
    if (gameState.round % 10 === 0 && gameState.students > 0) {
        handleGraduation(studyGain);
    }

    // 5. 突发事件 (高压自杀)
    if (gameState.pressure > 85) {
        if (Math.random() > 0.6) {
            handleSuicide();
        }
    }

    // 招生逻辑
    let newStudents = Math.floor(gameState.reputation / 5);
    let capacity = gameState.slots.reduce((s, r) => s + (r ? (r.capacity || 0) : 0), 0);
    gameState.students = Math.min(capacity, gameState.students + newStudents);

    gameState.round++;
    gameState.totalStudy += studyGain;
    
    if (gameState.money < 0) {
        alert("破产了！你被教育界永久封杀。");
        location.reload();
    }

    updateUI();
    init(); // 刷新网格显示
}

// --- 特殊处理 ---
function handleSuicide() {
    let bribe = gameState.skills.shield ? 50000 : 200000;
    if (confirm(`🚨 惨剧！一名学生受不了压力自杀了。支付 ¥${bribe} 给媒体封口吗？`)) {
        gameState.money -= bribe;
        addLog("🤐 已压下新闻，但你内心备受谴责。");
    } else {
        gameState.reputation -= 50;
        addLog("📢 媒体曝光！声望暴跌。");
    }
}

function handleGraduation(lastStudy) {
    if (lastStudy > 100) {
        let donation = gameState.students * 2000;
        gameState.money += donation;
        addLog(`🎓 毕业季：你的毕业生非常优秀，回馈母校 ¥${donation}！`);
    } else if (gameState.pressure > 80) {
        gameState.reputation -= 30;
        addLog(`🎓 毕业季：毕业生在网上控诉你的暴政，声望下降。`);
    }
}

function askSponsorship() {
    let amt = prompt("向家长收多少钱？(建议1万-10万)", "10000");
    amt = parseInt(amt);
    if (amt > 100000) {
        alert("家长觉得你疯了，直接举报了你！");
        gameState.reputation -= 40;
    } else if (amt > 0) {
        let success = Math.random() > (amt / 150000);
        if (success || gameState.skills.speech) {
            gameState.money += amt * gameState.students;
            addLog(`成功收取赞助费 ¥${amt * gameState.students}`);
        } else {
            addLog("家长集体抗议，索要失败。");
            gameState.reputation -= 10;
        }
    }
    updateUI();
}

// --- 校长技能与奢侈品 ---
function renderSkills() {
    const box = document.getElementById('skills-luxury');
    box.innerHTML = `
        <div class="card">
            <h4>口才大师</h4>
            <p>赞助成功率 +50%</p>
            <button onclick="buySkill('speech', 100000)" ${gameState.skills.speech?'disabled':''}>¥100k 学习</button>
        </div>
        <div class="card">
            <h4>纯金校门口</h4>
            <p>除了贵没任何用</p>
            <button onclick="buyLux('Gold Gate', 500000)">¥500k 购买</button>
        </div>
    `;
}

function buySkill(id, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.skills[id] = true;
        renderSkills();
        updateUI();
    }
}

function buyLux(name, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.luxuries.push(name);
        alert(`你买了 ${name}！看着闪瞎眼的黄金，你感到了纯粹的快乐。`);
        updateUI();
    }
}

// --- 辅助功能 ---
function setMode(m) {
    gameState.mode = m;
    document.querySelectorAll('.mode-btn').forEach((b, i) => {
        b.className = (i+1 === m) ? 'mode-btn active' : 'mode-btn';
    });
}

function updateUI() {
    document.getElementById('money').innerText = `¥${gameState.money.toLocaleString()}`;
    document.getElementById('pressure').innerText = `${Math.floor(gameState.pressure)}%`;
    document.getElementById('reputation').innerText = gameState.reputation;
    document.getElementById('students').innerText = gameState.students;
    document.getElementById('round').innerText = gameState.round;
    
    // 危险警告
    if (gameState.pressure > 80) document.body.className = 'high-pressure';
    else document.body.className = '';
}

function addLog(msg) {
    const log = document.getElementById('log');
    log.innerHTML = `> ${msg}<br>${log.innerHTML}`;
}

// 启动
init();

