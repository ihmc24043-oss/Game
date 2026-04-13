// 游戏初始状态
let gameState = {
    money: 10000,
    students: 10,
    maxStudents: 30,
    graduates: 0,
    reputation: 50,
    pressure: 0,
    risk: 0,
    round: 1,
    skills: { speech: false, shield: false, eye: false },
    teachers: [],
    marketTeachers: [],
    luxuries: [],
    rooms: {
        dorm: { name: "学生宿舍", lv: 0, cost: 4000, stage: ["旧瓦房", "标准公寓", "豪华寝室"] },
        computer: { name: "微机室", lv: 0, cost: 3000, stage: ["大头机", "液晶屏", "超算中心"] },
        kitchen: { name: "食堂", lv: 0, cost: 2000, stage: ["大锅饭", "自助餐", "美食广场"] },
        music: { name: "琴房", lv: 0, cost: 2500, stage: ["竖笛", "钢琴房", "歌剧院"] },
        handcraft: { name: "手工坊", lv: 0, cost: 2000, stage: ["剪纸桌", "木工坊", "3D实验室"] },
        hall: { name: "礼堂", lv: 0, cost: 5000, stage: ["露天台", "多功能厅", "国家剧院"] }
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
            <div class="item-card">
                <h4>${r.name} <span style="color:#e67e22">Lv.${r.lv}</span></h4>
                <p>${stageName}</p>
                <button class="btn-action btn-buy" onclick="upgradeRoom('${key}')">升级 ¥${cost}</button>
            </div>`;
    }
}

// --- 核心逻辑：回合结算 ---
function nextRound() {
    addLog(`--- <span class="log-gold">第 ${gameState.round} 学期总结</span> ---`);
    
    // 1. 教学力与薪资
    let powerBonus = 1 + (gameState.rooms.computer.lv * 0.25);
    let tPower = gameState.teachers.reduce((s, t) => s + t.power, 0) * powerBonus;
    let tSalary = gameState.teachers.reduce((s, t) => s + t.salary, 0);

    // 2. 收入：学费 + 食堂额外收入
    let tuition = gameState.students * (450 + tPower * 5);
    let kitchenMoney = gameState.students * (gameState.rooms.kitchen.lv * 80);
    let govGrant = gameState.reputation * 50;
    
    let net = tuition + kitchenMoney + govGrant - tSalary - 1500;
    gameState.money += net;

    // 3. 压力平衡：老师强则压力大，音乐室减压
    let pAdd = (tPower / 6);
    let pSub = (gameState.rooms.music.lv * 12);
    gameState.pressure = Math.max(0, Math.min(100, gameState.pressure + pAdd - pSub));

    // 4. 毕业季（每4学期一次）
    if (gameState.round % 4 === 0) {
        let grads = Math.floor(gameState.students * 0.8);
        let handcraftBonus = 1 + (gameState.rooms.handcraft.lv * 0.4);
        let donation = grads * (gameState.reputation * 40) * handcraftBonus;
        
        gameState.money += donation;
        gameState.graduates += grads;
        gameState.students -= grads;
        addLog(`<span class="log-gold">🎓 毕业典礼：${grads}人毕业，校友捐款 ¥${Math.floor(donation)}！</span>`);
    }

    // 5. 招生与声望
    gameState.reputation += (gameState.rooms.hall.lv * 5);
    let newS = Math.max(1, Math.floor(gameState.reputation / 10));
    gameState.students = Math.min(gameState.maxStudents, gameState.students + newS);

    // 6. 风险自然衰减
    gameState.risk = Math.max(0, gameState.risk - 10);

    // 判定
    if (gameState.money < 0) { alert("破产了！学校被查封。"); location.reload(); return; }
    if (gameState.pressure > 90 && Math.random() > 0.4) handleTragedy();
    if (gameState.risk > 80 && Math.random() > 0.6) {
        addLog("<span class='log-red'>⚖️ 突击检查：因为违规收费，罚款 ¥20000！</span>");
        gameState.money -= 20000;
        gameState.risk = 20;
    }

    triggerRandomEvent();
    gameState.round++;
    refreshMarket();
    renderRooms();
    updateUI();
}

// --- 功能函数 ---
function upgradeRoom(key) {
    let r = gameState.rooms[key];
    let cost = Math.floor(r.cost * Math.pow(1.8, r.lv));
    if (gameState.money >= cost) {
        gameState.money -= cost;
        r.lv++;
        if (key === 'dorm') gameState.maxStudents += 20;
        addLog(`[建设] ${r.name} 已升级。`);
        renderRooms();
        updateUI();
    }
}

function learnSkill(id, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.skills[id] = true;
        document.getElementById(`sk-${id}`).innerText = "已掌握";
        document.getElementById(`sk-${id}`).disabled = true;
        addLog(`[技能] 校长习得了新能力。`);
        updateUI();
    }
}

function buyLuxury(id, cost) {
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.luxuries.push(id);
        document.getElementById(`lux-${id}`).innerText = "✨";
        document.getElementById(`lux-${id}`).disabled = true;
        addLog("<span class='log-gold'>💎 购买了昂贵的奢侈品！没什么用，但你感到非常快乐！</span>");
        updateUI();
    }
}

function askParentsForMoney() {
    let amt = gameState.skills.speech ? 4000 : 2500;
    let total = amt * gameState.students;
    gameState.money += total;
    gameState.risk += 30;
    gameState.reputation -= 15;
    addLog(`[权力] 强制收取赞助费 ¥${total}。`);
    updateUI();
}

function organizeTour() {
    if (gameState.money >= 5000) {
        gameState.money -= 5000;
        gameState.pressure = Math.max(0, gameState.pressure - 40);
        gameState.reputation += 20;
        addLog("[活动] 豪华游学让声望大涨。");
        updateUI();
    }
}

function handleTragedy() {
    let bribe = gameState.skills.shield ? 6000 : 18000;
    if (confirm(`🚨 惨剧发生！是否支付 ¥${bribe} 掩盖消息？`)) {
        gameState.money -= bribe;
        addLog("🤫 已压下负面报道。");
    } else {
        gameState.reputation -= 70;
        addLog("📢 丑闻爆发！声望暴跌！");
    }
}

function triggerRandomEvent() {
    let r = Math.random();
    if(r > 0.9) {
        addLog("<span class='log-gold'>🌟 天才：本期出现一名状元，声望+50！</span>");
        gameState.reputation += 50;
    } else if (r < 0.1 && gameState.teachers.length > 0) {
        addLog("<span class='log-red'>🔥 罢工：一名老师对现状不满，离职了！</span>");
        gameState.teachers.pop();
    }
}

function refreshMarket() {
    const market = document.getElementById('teacherMarket');
    market.innerHTML = '';
    gameState.marketTeachers = [];
    for (let i = 0; i < 3; i++) {
        let q = Math.random();
        let bonus = gameState.skills.eye ? 40 : 0;
        let t = {
            name: "名师" + (100 + i),
            power: Math.floor(q * 60) + 10 + bonus,
            salary: Math.floor(q * 1000) + 600,
            fee: Math.floor(q * 4000) + 1500
        };
        gameState.marketTeachers.push(t);
        market.innerHTML += `
            <div class="item-card">
                <h4>${t.name}</h4>
                <p>能力:+${t.power} | 薪:¥${t.salary}</p>
                <button onclick="hireTeacher(${i})" class="btn-action btn-buy">聘用 ¥${t.fee}</button>
            </div>`;
    }
}

function hireTeacher(idx) {
    let t = gameState.marketTeachers[idx];
    if (gameState.money >= t.fee) {
        gameState.money -= t.fee;
        gameState.teachers.push(t);
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
    document.getElementById('risk').innerText = `${gameState.risk}%`;
    
    // 背景警告
    if(gameState.pressure > 80 || gameState.risk > 80) document.body.className = "danger-bg";
    else document.body.className = "";
}

function addLog(msg) {
    const log = document.getElementById('log');
    const p = document.createElement('p');
    p.innerHTML = msg;
    log.prepend(p);
}

// 启动
renderRooms();
refreshMarket();
updateUI();
