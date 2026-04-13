/**
 * 传奇校长：核心引擎 (Independent Heavy-Duty Version)
 * 功能：14种建筑、24地块管理、多级升级体系、特质结算引擎
 */

// 1. 建筑全量百科 (无删减)
const ROOM_MASTER = {
    // 教学类：决定学力产出
    'normal': { name: "普通教室", cost: 30000, study: 12, pressure: 8, icon: "📚", color: "#3498db" },
    'media': { name: "多媒体室", cost: 65000, study: 25, pressure: 15, icon: "🖥️", color: "#3498db" },
    'elite': { name: "实验班", cost: 130000, study: 55, pressure: 28, icon: "🔝", color: "#2980b9" },
    'contest': { name: "奥赛集训室", cost: 250000, study: 110, pressure: 50, icon: "🏆", color: "#1a5276" },
    
    // 艺术/素质类：中低学力，高减压
    'piano': { name: "钢琴房", cost: 85000, study: 5, pressure: -20, icon: "🎹", color: "#9b59b6" },
    'art': { name: "美术室", cost: 85000, study: 5, pressure: -20, icon: "🎨", color: "#8e44ad" },
    'dance': { name: "舞蹈厅", cost: 100000, study: 10, pressure: -18, icon: "💃", color: "#af7ac5" },
    'radio': { name: "广播站", cost: 55000, study: 8, pressure: -10, icon: "📢", color: "#d2b4de" },

    // 功能/后勤类：生存与扩展
    'clinic': { name: "校医室", cost: 140000, study: 0, pressure: -55, icon: "🏥", color: "#2ecc71" },
    'gym': { name: "体育馆", cost: 240000, study: 15, pressure: -35, icon: "🏀", color: "#27ae60" },
    'pool': { name: "游泳池", cost: 280000, study: 12, pressure: -45, icon: "🏊", color: "#16a085" },
    'canteen': { name: "中央食堂", cost: 150000, study: 5, pressure: -15, icon: "🍱", color: "#f39c12" },
    'dorm': { name: "宿舍楼", cost: 180000, study: 0, pressure: -25, icon: "🛌", color: "#e67e22" },
    'library': { name: "大图书馆", cost: 210000, study: 30, pressure: -8, icon: "📖", color: "#f1c40f" }
};

// 2. 教师特质引擎
const TEACHER_POOL = [
    { trait: "魔鬼教头", sMod: 2.8, pMod: 4.5, css: "tag-bad", desc: "极高产出，压力爆表" },
    { trait: "严厉", sMod: 1.6, pMod: 2.3, css: "tag-bad", desc: "稳定教学，稍有压力" },
    { trait: "效率大师", sMod: 1.4, pMod: 1.1, css: "tag-good", desc: "高性价比" },
    { trait: "温柔", sMod: 0.8, pMod: -18, css: "tag-good", desc: "产出低，自带减压" },
    { trait: "慈父", sMod: 0.5, pMod: -35, css: "tag-good", desc: "快乐教育专家" },
    { trait: "佛系", sMod: 0.3, pMod: -50, css: "tag-good", desc: "几乎不教书，但减压极强" }
];

// 3. 游戏核心状态
let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, 
    mode: 2, students: 35, 
    slots: Array(24).fill(null), // 24块地块数据
    teachers: [], market: [],
    research: [false, false, false, false]
};

/** 初始化 */
window.onload = () => {
    refreshGrid();
    refreshMarket();
    updateDashboard();
};

/** 渲染地块：包含Lv升级角标绘制 */
function refreshGrid() {
    const container = document.getElementById('grid');
    container.innerHTML = '';
    game.slots.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = `slot ${item ? 'built' : ''}`;
        if(item) {
            el.style.borderColor = item.color;
            el.innerHTML = `
                <div class="lv-badge">Lv.${item.lv}</div>
                <span style="font-size:22px">${item.icon}</span><br>
                <b>${item.name}</b>
            `;
        } else {
            el.innerHTML = '<span style="font-size:24px; color:#ccc">+</span>';
        }
        el.onclick = () => item ? handleUpgrade(index) : handleBuild(index);
        container.appendChild(el);
    });
}

/** 建造逻辑：开启14种建筑菜单 */
function handleBuild(index) {
    let html = `<h3>规划新设施</h3><div class="build-grid">`;
    for(let key in ROOM_MASTER) {
        const r = ROOM_MASTER[key];
        html += `
            <div class="build-item" onclick="confirmBuild(${index}, '${key}')">
                <span style="font-size:24px">${r.icon}</span><br>
                <b>${r.name}</b><br>
                <small style="color:#e74c3c">¥${(r.cost/10000).toFixed(1)}w</small>
            </div>`;
    }
    html += `</div>`;
    showPopup(html);
}

function confirmBuild(slotIdx, roomKey) {
    const room = ROOM_MASTER[roomKey];
    if(game.money >= room.cost) {
        game.money -= room.cost;
        game.slots[slotIdx] = { ...room, lv: 1 };
        closePopup();
        refreshGrid();
        updateDashboard();
        addLog(`🔨 成功建造 ${room.name}，校园版图扩张！`);
    } else {
        alert("校长，咱们账上钱不够了！");
    }
}

/** 升级逻辑：真正的数值阶梯提升 */
function handleUpgrade(index) {
    const room = game.slots[index];
    const cost = Math.floor(room.cost * 1.8 * room.lv);
    showPopup(`
        <h3>设施进阶：${room.name}</h3>
        <p>当前等级：<b style="color:#e74c3c">Lv.${room.lv}</b></p>
        <div style="background:#f4f4f4; padding:12px; border-radius:10px; font-size:13px; color:#666;">
            升级效果：该设施产出的教学力或减压效果将提升 <b>60%</b>。
        </div>
        <button class="btn-action" style="margin-top:20px" onclick="confirmUpgrade(${index}, ${cost})">
            投入 ¥${cost.toLocaleString()} 进行升级
        </button>
    `);
}

function confirmUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        const target = game.slots[idx];
        target.lv++;
        target.study *= 1.6; // 学力强化
        if(target.pressure < 0) target.pressure *= 1.6; // 减压效果强化
        closePopup();
        refreshGrid();
        updateDashboard();
        addLog(`✨ ${target.name} 升级至 Lv.${target.lv}，效率大幅提升！`);
    } else {
        alert("升级资金不足！");
    }
}

/** 结算引擎：多因子混合计算 */
function nextRound() {
    let baseS = 0, baseP = 0;
    // 统计所有地块
    game.slots.forEach(s => { if(s){ baseS += s.study; baseP += s.pressure; } });

    let teachS = 0, teachPAdjust = 0;
    // 统计教师加成
    game.teachers.forEach(t => {
        teachS += (t.power * t.trait.sMod);
        if(t.trait.pMod > 1) teachPAdjust += (baseP * (t.trait.pMod - 1));
        else if(t.trait.pMod < 0) teachPAdjust += t.trait.pMod;
    });

    // 综合系数
    let finalStudy = (baseS + teachS) * (game.research[0] ? 1.25 : 1);
    let finalPress = baseP + teachPAdjust;

    // 科研/模式修正
    if(game.research[1]) finalPress -= 40;
    if(game.mode === 1) { finalPress -= 50; finalStudy *= 0.4; }
    else if(game.mode === 3) { finalPress += 35; finalStudy *= 3.0; }

    // 经济结算 (学生基数 * 11000 - 薪资)
    let salaryTotal = game.teachers.reduce((a, b) => a + b.salary, 0) * (game.research[2] ? 0.7 : 1);
    game.money += (game.students * 11000) - salaryTotal;
    
    // 数值注入
    game.pressure = Math.max(0, Math.min(100, game.pressure + finalPress));
    let repGain = Math.floor(finalStudy / 12 * (game.research[3] ? 1.6 : 1));
    game.rep += repGain;
    game.round++;

    // 随机危机：高压惩罚
    if(game.pressure > 90) {
        game.money -= 200000; game.rep -= 50;
        addLog("🚨 警告：极端高压导致家长联名抗议，学校赔付20w并声望暴跌！", "#e74c3c");
    }

    addLog(`📅 第${game.round-1}期结案：教学力产出 ${Math.floor(finalStudy)}，压力变动 ${Math.floor(finalPress)}%`);
    updateDashboard();
    refreshGrid();
    refreshMarket();
}

/** 辅助功能 */
function setMode(m) {
    game.mode = m;
    document.querySelectorAll('.btn-mode').forEach((b, i) => b.classList.toggle('active', i+1===m));
    addLog(`📢 经营策略已调整为：${['佛系减压','标准稳健','应试冲刺'][m-1]}。`);
}

function updateDashboard() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(game.pressure)}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('round').innerText = game.round;
    const p = document.getElementById('pressure');
    p.style.color = game.pressure > 85 ? '#e74c3c' : (game.pressure < 30 ? '#27ae60' : '#f1c40f');
}

function showPopup(content) {
    document.getElementById('modal').innerHTML = content;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
}

function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

function addLog(msg, color = "#2ecc71") {
    const l = document.getElementById('logs');
    l.innerHTML = `<div style="color:${color}">[T+${game.round}] ${msg}</div>` + l.innerHTML;
}

/** 人才刷新逻辑 */
function refreshMarket() {
    game.market = [];
    const surNames = ["王","李","张","刘","陈","赵"];
    for(let i=0; i<4; i++){
        const tr = TEACHER_POOL[Math.floor(Math.random()*TEACHER_POOL.length)];
        game.market.push({
            name: surNames[Math.floor(Math.random()*6)] + "老师",
            trait: tr,
            power: 20 + Math.floor(Math.random()*30),
            salary: 9000 + Math.floor(Math.random()*5000)
        });
    }
    const ml = document.getElementById('market-list');
    ml.innerHTML = '';
    game.market.forEach((t, i) => {
        ml.innerHTML += `
            <div class="card">
                <b>${t.name}</b> <small>⚡${t.power}</small><br>
                <span class="tag ${t.trait.css}">${t.trait.trait}</span><br>
                <small>薪资: ¥${t.salary.toLocaleString()}</small><br>
                <button onclick="hireTeacher(${i})" class="btn-action" style="padding:4px; font-size:11px; margin-top:5px;">招募</button>
            </div>`;
    });
}

function hireTeacher(i) {
    game.teachers.push(game.market[i]);
    addLog(`🤝 已聘用 ${game.market[i].name}，当前师资力量增强。`);
    game.market.splice(i, 1);
    refreshMarket();
}
