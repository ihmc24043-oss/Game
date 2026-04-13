<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>传奇校长：无删减版</title>
    <style>
        :root {
            --p-blue: #3498db; --p-red: #e74c3c; --p-gold: #f1c40f; 
            --p-green: #27ae60; --p-dark: #2c3e50; --p-purple: #9b59b6;
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { font-family: "PingFang SC", sans-serif; background: var(--p-dark); color: #333; margin: 0; padding-bottom: 200px; }
        
        /* 顶部看板 */
        .stats-bar { position: sticky; top: 0; background: var(--p-dark); color: white; display: grid; grid-template-columns: repeat(4, 1fr); padding: 15px; z-index: 1000; border-bottom: 2px solid var(--p-gold); }
        .stat-item { text-align: center; }
        .stat-val { display: block; font-size: 14px; font-weight: bold; color: var(--p-gold); }
        .stat-label { font-size: 10px; opacity: 0.7; }

        .container { padding: 15px; background: #f4f7f6; min-height: 100vh; border-radius: 25px 25px 0 0; }
        h2 { border-left: 4px solid var(--p-blue); padding-left: 10px; font-size: 16px; margin: 15px 0 10px; color: var(--p-dark); }

        /* 24地块 */
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .slot { aspect-ratio: 1; background: #e0e0e0; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; position: relative; border: 2px dashed #bbb; cursor: pointer; transition: 0.2s; text-align: center; overflow: hidden; }
        .slot.built { background: white; border: 2.5px solid var(--p-blue); border-style: solid; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .lv-badge { position: absolute; top: -2px; right: -2px; background: var(--p-red); color: white; padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 10; }

        /* 列表卡片 */
        .scroll-row { display: flex; overflow-x: auto; gap: 10px; padding: 5px 0 15px 0; scrollbar-width: none; }
        .card { min-width: 140px; background: white; padding: 12px; border-radius: 15px; border: 1px solid #eee; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .tag { font-size: 9px; padding: 2px 5px; border-radius: 4px; margin: 3px 0; display: inline-block; font-weight: bold; }
        .tag-good { background: #e8f5e9; color: #2e7d32; }
        .tag-bad { background: #ffebee; color: #c62828; }

        /* 操作区 */
        .footer-ui { position: fixed; bottom: 0; width: 100%; background: white; padding: 15px; z-index: 2000; box-shadow: 0 -5px 25px rgba(0,0,0,0.15); border-radius: 20px 20px 0 0; }
        .mode-toggles { display: flex; gap: 8px; margin-bottom: 12px; }
        .btn-mode { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #ddd; background: #f9f9f9; font-size: 11px; font-weight: bold; }
        .btn-mode.active { background: var(--p-blue); color: white; border-color: var(--p-blue); }
        .btn-next { width: 100%; padding: 18px; border-radius: 18px; background: var(--p-dark); color: var(--p-gold); border: none; font-size: 18px; font-weight: bold; }

        #logs { background: #1a252f; color: #2ecc71; padding: 12px; font-family: monospace; font-size: 11px; height: 90px; overflow-y: auto; border-radius: 15px; margin-bottom: 15px; border: 1px solid #34495e; }

        /* 模态窗 */
        .modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: none; z-index: 3000; backdrop-filter: blur(5px); }
        .modal-box { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 92%; background: white; border-radius: 25px; padding: 25px; z-index: 3001; max-height: 85vh; overflow-y: auto; }
        .build-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .build-item { border: 1.5px solid #eee; padding: 12px; border-radius: 15px; text-align: center; transition: 0.2s; }
        .build-item:active { background: #f0f0f0; }
    </style>
</head>
<body>

<div class="stats-bar">
    <div class="stat-item"><span class="stat-label">经费</span><span class="stat-val" id="money">¥1.0M</span></div>
    <div class="stat-item"><span class="stat-label">压力</span><span class="stat-val" id="pressure">0%</span></div>
    <div class="stat-item"><span class="stat-label">名望</span><span class="stat-val" id="rep">60</span></div>
    <div class="stat-item"><span class="stat-label">学期</span><span class="stat-val" id="round">1</span></div>
</div>

<div class="container">
    <div id="logs">系统：校长，地块已清空。请点击下方“+”号开始建设您的教育帝国。</div>

    <h2>校园平面图 (24块地)</h2>
    <div class="grid" id="grid"></div>

    <h2>人才市场 <small style="color:#999;font-weight:normal;">(刷新 ¥5k)</small></h2>
    <div class="scroll-row" id="market-list"></div>

    <h2>科研中心</h2>
    <div class="scroll-row">
        <div class="card" onclick="research(0)"><b>智慧校园</b><br><small>全校学力 +20%</small><span id="res-0" class="tag">未解锁</span></div>
        <div class="card" onclick="research(1)"><b>心理干预</b><br><small>每回合减压 +35</small><span id="res-1" class="tag">未解锁</span></div>
        <div class="card" onclick="research(2)"><b>后勤集约化</b><br><small>运营成本 -25%</small><span id="res-2" class="tag">未解锁</span></div>
        <div class="card" onclick="research(3)"><b>名校霸权</b><br><small>名望获取速度 +50%</small><span id="res-3" class="tag">未解锁</span></div>
    </div>

    <h2>校长办公系统</h2>
    <div class="scroll-row">
        <div class="card" onclick="doPR()"><b>📢 媒体公关</b><br><small>¥50k / 增加名望</small></div>
        <div class="card" onclick="takeHoliday()"><b>🏝️ 全校放假</b><br><small>¥3w / 强效清压</small></div>
        <div class="card" onclick="recruit()"><b>🌍 全球招生</b><br><small>¥10w / 增加学费收入</small></div>
    </div>
</div>

<div class="footer-ui">
    <div class="mode-toggles">
        <button class="btn-mode" id="m1" onclick="setMode(1)">🍃 佛系模式</button>
        <button class="btn-mode active" id="m2" onclick="setMode(2)">⚖️ 标准模式</button>
        <button class="btn-mode" id="m3" onclick="setMode(3)">🔥 应试模式</button>
    </div>
    <button class="btn-next" onclick="nextRound()">🔔 结束本学期 · 进入结算</button>
</div>

<div class="modal-mask" id="overlay" onclick="closeModal()"></div>
<div class="modal-box" id="modal"></div>

<script>
/**
 * 传奇校长 JS 逻辑引擎 - 究极不缩水版
 */

// 1. 完整建筑数据库 (14种建筑)
const MASTER_ROOMS = {
    // 教学部
    'normal': { name: "普通教室", cost: 30000, study: 12, pressure: 8, icon: "📚", category: "教学" },
    'media': { name: "多媒体室", cost: 65000, study: 22, pressure: 12, icon: "🖥️", category: "教学" },
    'elite': { name: "重点班", cost: 120000, study: 45, pressure: 25, icon: "🔝", category: "教学" },
    'contest': { name: "竞赛尖子室", cost: 200000, study: 85, pressure: 45, icon: "🏆", category: "教学" },
    
    // 艺术部
    'piano': { name: "钢琴房", cost: 80000, study: 6, pressure: -18, icon: "🎹", category: "艺术" },
    'art': { name: "美术室", cost: 80000, study: 6, pressure: -18, icon: "🎨", category: "艺术" },
    'dance': { name: "舞蹈排练厅", cost: 95000, study: 10, pressure: -15, icon: "💃", category: "艺术" },
    
    // 功能部
    'clinic': { name: "校医室", cost: 120000, study: 0, pressure: -45, icon: "🏥", category: "功能" },
    'canteen': { name: "学生食堂", cost: 130000, study: 3, pressure: -12, icon: "🍱", category: "功能" },
    'dorm': { name: "高级公寓", cost: 160000, study: 0, pressure: -20, icon: "🛌", category: "功能" },
    'gym': { name: "室内体育馆", cost: 220000, study: 15, pressure: -30, icon: "🏀", category: "功能" },
    'pool': { name: "恒温游泳池", cost: 250000, study: 12, pressure: -35, icon: "🏊", category: "功能" },
    'library': { name: "中央图书馆", cost: 180000, study: 25, pressure: -10, icon: "📖", category: "功能" },
    'radio': { name: "校园广播站", cost: 50000, study: 5, pressure: -8, icon: "📢", category: "功能" }
};

// 2. 教师库特质
const TRAITS = [
    { name: "魔鬼教头", sMod: 2.5, pMod: 4.0, css: "tag-bad" },
    { name: "严厉", sMod: 1.6, pMod: 2.2, css: "tag-bad" },
    { name: "温柔", sMod: 0.8, pMod: -15, css: "tag-good" },
    { name: "效率大师", sMod: 1.4, pMod: 1.1, css: "tag-good" },
    { name: "慈父", sMod: 0.6, pMod: -30, css: "tag-good" },
    { name: "佛系", sMod: 0.4, pMod: -40, css: "tag-good" }
];

let state = {
    money: 1000000, pressure: 0, rep: 60, round: 1, mode: 2,
    students: 30, slots: Array(24).fill(null),
    teachers: [], market: [], res: [false, false, false, false]
};

function init() {
    renderGrid();
    refreshMarket();
    updateUI();
}

// 渲染24个地块
function renderGrid() {
    const g = document.getElementById('grid');
    g.innerHTML = '';
    state.slots.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = `slot ${s ? 'built' : ''}`;
        if(s) {
            d.innerHTML = `<div class="lv-badge">Lv.${s.lv}</div><span style="font-size:20px">${s.icon}</span><br><b>${s.name}</b>`;
        } else {
            d.innerHTML = '<span style="font-size:24px; color:#bbb">+</span>';
        }
        d.onclick = () => s ? openUpgrade(i) : openBuild(i);
        g.appendChild(d);
    });
}

// 刷新人才
function refreshMarket() {
    state.market = [];
    const names = ["老王","张姐","李导","赵老师","陈Sir","周校"];
    for(let i=0; i<4; i++) {
        const trait = TRAITS[Math.floor(Math.random()*TRAITS.length)];
        state.market.push({
            name: names[Math.floor(Math.random()*6)] + (i+1),
            trait: trait,
            power: 15 + Math.floor(Math.random()*20),
            salary: 7500 + Math.floor(Math.random()*5000)
        });
    }
    renderMarket();
}

function renderMarket() {
    const ml = document.getElementById('market-list');
    ml.innerHTML = '';
    state.market.forEach((t, i) => {
        ml.innerHTML += `
            <div class="card">
                <b>${t.name}</b> <small>⚡${t.power}</small><br>
                <span class="tag ${t.trait.css}">${t.trait.name}</span><br>
                <small>月薪: ¥${t.salary.toLocaleString()}</small>
                <button onclick="hire(${i})" style="width:100%; margin-top:5px; border-radius:5px; border:none; background:var(--p-blue); color:white; padding:4px;">招聘</button>
            </div>`;
    });
}

function hire(i) {
    state.teachers.push(state.market[i]);
    addLog(`🤝 成功招聘了 ${state.market[i].name}，他是位【${state.market[i].trait.name}】老师。`);
    state.market.splice(i, 1);
    renderMarket();
}

// 核心计算逻辑：学力、压力、金钱
function nextRound() {
    let bStudy = 0, bPress = 0;
    state.slots.forEach(s => { 
        if(s){ 
            bStudy += s.study; 
            bPress += s.pressure; 
        } 
    });

    let tStudy = 0, tPressFix = 0;
    state.teachers.forEach(t => {
        tStudy += (t.power * t.trait.sMod);
        // 特质对整体压力的百分比放大或固定减免
        if(t.trait.pMod > 1) tPressFix += (bPress * (t.trait.pMod - 1));
        else if(t.trait.pMod < 0) tPressFix += t.trait.pMod;
    });

    let finalStudy = (bStudy + tStudy) * (state.res[0] ? 1.2 : 1);
    let finalPress = bPress + tPressFix;

    // 科研和模式修正
    if(state.res[1]) finalPress -= 35;
    if(state.mode === 1) { finalPress -= 45; finalStudy *= 0.5; }
    else if(state.mode === 3) { finalPress += 30; finalStudy *= 2.8; }

    // 经济：收入 = 学生数 * 10000学费
    let costMod = state.res[2] ? 0.75 : 1;
    let salaries = state.teachers.reduce((a, b) => a + b.salary, 0) * costMod;
    state.money += (state.students * 10000) - salaries;
    
    // 数值更新
    state.pressure = Math.max(0, Math.min(100, state.pressure + finalPress));
    let repGain = Math.floor(finalStudy / 10 * (state.res[3] ? 1.5 : 1));
    state.rep += repGain;
    state.round++;

    // 事故判定
    if(state.pressure > 92) {
        state.money -= 180000; state.rep -= 40;
        addLog("🚨 危机：由于学生压力彻底崩溃，发生了大规模退学！损失¥18w", "var(--p-red)");
    }

    addLog(`📅 第${state.round-1}期报告：学力产出${Math.floor(finalStudy)}，压力变动${Math.floor(finalPress)}%`);
    updateUI(); renderGrid(); refreshMarket();
}

// 真正的“地块升级”逻辑
function openUpgrade(i) {
    const s = state.slots[i];
    const upCost = Math.floor(s.cost * 1.6 * s.lv);
    showModal(`
        <h3>设施升级: ${s.name}</h3>
        <p>当前等级: <b style="color:var(--p-red)">Lv.${s.lv}</b></p>
        <div style="background:#f9f9f9; padding:10px; border-radius:10px; font-size:12px;">
            升级后效果：教学力/减压效果将提升 <b>50%</b>
        </div>
        <button class="btn-next" style="font-size:14px; margin-top:15px;" onclick="confirmUpgrade(${i},${upCost})">支付 ¥${upCost.toLocaleString()} 立即升级</button>
    `);
}

function confirmUpgrade(i, cost) {
    if(state.money >= cost) {
        state.money -= cost;
        const s = state.slots[i];
        s.lv++;
        s.study *= 1.5;
        if(s.pressure < 0) s.pressure *= 1.5; // 减压效果也变强
        closeModal(); updateUI(); renderGrid();
        addLog(`✨ 升级成功：${s.name} 进化到了 Lv.${s.lv}`);
    } else alert("经费不足，无法升级设施！");
}

// 建造逻辑：全部展示14种建筑
function openBuild(i) {
    let h = `<h3>规划新地块</h3><div class="build-grid">`;
    for(let k in MASTER_ROOMS) {
        const r = MASTER_ROOMS[k];
        h += `<div class="build-item" onclick="confirmBuild(${i},'${k}')">
                <span style="font-size:22px">${r.icon}</span><br>
                <b style="font-size:12px">${r.name}</b><br>
                <small class="tag" style="background:#eee">${r.category}</small><br>
                <small style="color:var(--p-red)">¥${(r.cost/10000).toFixed(1)}w</small>
              </div>`;
    }
    h += `</div>`;
    showModal(h);
}

function confirmBuild(i, k) {
    if(state.money >= MASTER_ROOMS[k].cost) {
        state.money -= MASTER_ROOMS[k].cost;
        state.slots[i] = {...MASTER_ROOMS[k], lv: 1};
        closeModal(); updateUI(); renderGrid();
        addLog(`🔨 建造成功：${MASTER_ROOMS[k].name}`);
    } else alert("钱不够了！");
}

// 其他校长业务
function setMode(m) {
    state.mode = m;
    document.querySelectorAll('.btn-mode').forEach((b, i) => b.classList.toggle('active', i+1===m));
    addLog(`📢 经营方针调整：${m===1?'佛系':(m===2?'平衡':'冲刺')}状态。`);
}

function doPR() {
    if(state.money >= 50000) {
        state.money -= 50000; state.rep += 25;
        addLog("📢 媒体公关成功，学校名望提升。"); updateUI();
    }
}

function takeHoliday() {
    if(state.money >= 30000) {
        state.money -= 30000; state.pressure = Math.max(0, state.pressure - 50);
        addLog("🏝️ 校长带全校去旅游，学生压力几乎清零！"); updateUI();
    }
}

function recruit() {
    if(state.money >= 100000) {
        state.money -= 100000; state.students += 20;
        addLog("🌍 全球招生办发力，学费收入规模扩大。"); updateUI();
    }
}

function research(id) {
    const prices = [150000, 200000, 250000, 300000];
    if(state.res[id]) return;
    if(state.money >= prices[id]) {
        state.money -= prices[id]; state.res[id] = true;
        document.getElementById(`res-${id}`).innerText = "已激活";
        document.getElementById(`res-${id}`).classList.add('tag-good');
        addLog("🧪 科研项目成功落成，效果全校生效。"); updateUI();
    } else alert("科研经费严重不足！");
}

function updateUI() {
    document.getElementById('money').innerText = `¥${(state.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(state.pressure)}%`;
    document.getElementById('rep').innerText = state.rep;
    document.getElementById('round').innerText = state.round;
    const p = document.getElementById('pressure');
    p.style.color = state.pressure > 85 ? 'var(--p-red)' : (state.pressure < 30 ? 'var(--p-green)' : 'var(--p-gold)');
}

function addLog(m, c = "#2ecc71") {
    const l = document.getElementById('logs');
    l.innerHTML = `<span style="color:${c}">[学期${state.round}] ${m}</span><br>` + l.innerHTML;
}

function showModal(h) {
    document.getElementById('modal').innerHTML = h;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

init();
</script>
</body>
</html>
