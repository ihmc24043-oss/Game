// 游戏初始状态
let gameState = {
    money: 10000,
    students: 10,
    maxStudents: 30,
    graduates: 0,
    reputation: 50,
    pressure: 0,
    round: 1,
    skills: { speech: false, shield: false, eye: false },
    teachers: [],
    marketTeachers: [],
    rooms: {
        computer: { name: "电脑室", lv: 0, cost: 3000, stage: ["大头机", "液晶屏", "游戏本", "超算中心"] },
        kitchen: { name: "家政厨室", lv: 0, cost: 2000, stage: ["露天灶", "标准厨", "米其林"] },
        music: { name: "音乐室", lv: 0, cost: 2500, stage: ["竖笛", "钢琴房", "歌剧院"] },
        handcraft: { name: "手工室", lv: 0, cost: 2000, stage: ["剪纸桌", "木工坊", "3D打印"] },
        hall: { name: "大礼堂", lv: 0, cost: 5000, stage: ["讲台", "多功能厅", "国家剧院"] },
        staff: { name: "教研室", lv: 0, cost: 3000, stage: ["长条凳", "沙发区", "五星会所"] }
    }
};

// --- 初始化与渲染 ---
function renderRooms() {
    const grid = document.getElementById('roomGrid');
    grid.innerHTML = '';
    for (let key in gameState.rooms) {
        let r = gameState.rooms[key];
        let cost = Math.floor(r.cost * Math.pow(1.8, r.lv));
        let stageName = r.lv === 0 ? "未建造" : r.stage[Math.min(r.lv-1, r.stage.length-1)];
        grid.innerHTML += `
            <div class="room-card">
                <div>
                    <h4>${r.name} <span class="lv-tag">Lv.${r.lv}</span></h4>
                    <p>${stageName}</p>
                </div>
                <button class="btn-upgrade" onclick="upgradeRoom('${key}')">
                    ${r.lv === 0 ? '建造' : '升级'} ¥${cost}
                </button>
            </div>`;
    }
}

// --- 核心逻辑：结束学期 ---
function nextRound() {
    addLog(`--- <span class="highlight">第 ${gameState.round} 学期报告</span> ---`);
    
    // 1. 教学力结算 (受电脑室加成)
    let tPower = gameState.teachers.reduce((s, t) => s + t.power, 0) * (1 + gameState.rooms.computer.lv * 0.25);
    let tSalary = gameState.teachers.reduce((s, t) => s + t.salary, 0);

    // 2. 财务结算 (受厨室加成)
    let tuition = gameState.students * (400 + tPower * 6);
    let extraIncome = gameState.students * (gameState.rooms.kitchen.lv * 60);
    let net = tuition + extraIncome - tSalary - 1000;
    gameState.money += net;

    // 3. 压力结算 (受音乐室减免)
    let pAdd = (tPower / 5);
    let pSub = (gameState.rooms.music.lv * 10);
    gameState.pressure = Math.max(0, Math.min(100, gameState.pressure + pAdd - pSub));

    // 4. 毕业系统 (每4学期一次)
    if (gameState.round % 4 === 0) {
        let grads = Math.floor(gameState.students * 0.7);
        // 毕业捐赠受声望和手工室等级影响
        let donation = grads * (gameState.reputation * 30) * (1 + gameState.rooms.handcraft.lv * 0.5);
        gameState.money += donation;
        gameState.graduates += grads;
        gameState.students -= grads;
        addLog(`<span class='highlight'>🎓 毕业礼：${grads}人毕业，校友捐赠 ¥${Math.floor(donation)}！</span>`);
    }

    // 5. 声望与招生 (大礼堂加成)
    gameState.reputation += (gameState.rooms.hall.lv * 4);
    let newStudents = Math.max(1, Math.floor(gameState.reputation / 12));
    gameState.students = Math.min(gameState.maxStudents, gameState.students + newStudents);

    addLog(`利润: ¥${Math.floor(net)} | 师资力: ${Math.floor(tPower)}`);
    
    if (gameState.money < 0) { alert("破产了！校产已被清算。"); location.reload(); return; }
    if (gameState.pressure > 92 && Math.random() > 0.4) handleTragedy();

    gameState.round++;
    refreshMarket();
    renderRooms();
    updateUI();
}

// --- 功能系统 ---
function upgradeRoom(key) {
    let r = gameState.rooms[key];
    let cost = Math.floor(r.cost * Math.pow(1.8, r.lv));
    if (gameState.money >= cost) {
        gameState.money -= cost;
        r.lv++;
        addLog(`[建设] ${r.name} 升级至 Lv.${r.lv}`);
        renderRooms();
        updateUI();
    }
}

function learnSkill(id, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.skills[id] = true;
        let btn = document.getElementById(`sk-${id}`);
        btn.innerText = "已掌握";
        btn.disabled = true;
        addLog(`[技能] 校长领悟了：${id === 'speech' ? '口才' : id === 'shield' ? '厚脸皮' : '眼力'}`);
        updateUI();
    }
}

function askParentsForMoney() {
    let amt = gameState.skills.speech ? 3500 : 2000;
    let total = amt * gameState.students;
    gameState.money += total;
    gameState.reputation -= 15;
    addLog(`[权力] 强制征收了 ¥${total} 赞助费，声望下降。`);
    updateUI();
}

function organizeTour() {
    if (gameState.money >= 5000) {
        gameState.money -= 5000;
        gameState.pressure = Math.max(0, gameState.pressure - 35);
        gameState.reputation += 15;
        addLog("[活动] 豪华游学让大家很开心！");
        updateUI();
    }
}

function handleTragedy() {
    let bribe = gameState.skills.shield ? 5000 : 15000;
    if (confirm(`🚨 压力爆表，发生事故！是否花 ¥${bribe} 封口？`)) {
        gameState.money -= bribe;
        addLog("🤫 丑闻已被压下。");
    } else {
        gameState.reputation -= 60;
        addLog("📢 媒体曝光，名誉扫地！");
    }
}

function refreshMarket() {
    const market = document.getElementById('teacherMarket');
    market.innerHTML = '';
    gameState.marketTeachers = [];
    for (let i = 0; i < 3; i++) {
        let q = Math.random();
        let bonus = gameState.skills.eye ? 35 : 0;
        let t = {
            name: "名师" + (100 + i),
            power: Math.floor(q * 60) + 10 + bonus,
            salary: Math.floor(q * 1200) + 600,
            fee: Math.floor(q * 4000) + 1500
        };
        gameState.marketTeachers.push(t);
        market.innerHTML += `
            <div class="t-card">
                <h4>${t.name}</h4>
                <p>力:+${t.power}</p>
                <p>薪:¥${t.salary}</p>
                <button onclick="hireTeacher(${i})" class="btn-upgrade" style="background:#27ae60">聘用 ¥${t.fee}</button>
            </div>`;
    }
}

function hireTeacher(idx) {
    let t = gameState.marketTeachers[idx];
    if (gameState.money >= t.fee) {
        gameState.money -= t.fee;
        gameState.teachers.push(t);
        addLog(`[人才] ${t.name} 签了卖身契入职了。`);
        refreshMarket();
        updateUI();
    }
}

function updateUI() {
    document.getElementById('money').innerText = `¥${Math.floor(gameState.money)}`;
    document.getElementById('pressure').innerText = `${Math.floor(gameState.pressure)}%`;
    document.getElementById('reputation').innerText = Math.floor(gameState.reputation);
    document.getElementById('studentCount').innerText = `${gameState.students}/${gameState.maxStudents}`;
    document.getElementById('gradCount').innerText = gameState.graduates;
    document.getElementById('roundCount').innerText = gameState.round;
}

function addLog(msg) {
    const log = document.getElementById('log');
    const p = document.createElement('p');
    p.innerHTML = msg;
    log.prepend(p);
}

// 启动游戏
renderRooms();
refreshMarket();
updateUI();
