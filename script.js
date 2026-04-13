/**
 * 传奇校长：逻辑重构版 (彻底根除白条)
 */

const MASTER_ROOMS = {
    // 1. 核心教学
    'r1': { name: "标准教室", cost: 30000, study: 15, pressure: 10, cat: "核心教学" },
    'r2': { name: "语言实验室", cost: 65000, study: 28, pressure: 12, cat: "核心教学" },
    'r3': { name: "数学研讨室", cost: 60000, study: 25, pressure: 10, cat: "核心教学" },
    // 2. 科学技术
    'r4': { name: "物理实验室", cost: 90000, study: 45, pressure: 22, cat: "科学技术" },
    'r5': { name: "化学实验室", cost: 95000, study: 48, pressure: 25, cat: "科学技术" },
    'r6': { name: "计算机房", cost: 130000, study: 55, pressure: 28, cat: "科学技术" },
    'r7': { name: "创客空间", cost: 160000, study: 70, pressure: 35, cat: "科学技术" },
    // 3. 艺术体育
    'r8': { name: "音乐教室", cost: 80000, study: 8, pressure: -25, cat: "艺术体育" },
    'r9': { name: "舞蹈教室", cost: 100000, study: 12, pressure: -28, cat: "艺术体育" },
    'r10': { name: "多功能球馆", cost: 220000, study: 20, pressure: -45, cat: "艺术体育" },
    'r11': { name: "室内游泳池", cost: 280000, study: 15, pressure: -55, cat: "艺术体育" },
    // 4. 高级空间
    'r12': { name: "中央图书馆", cost: 200000, study: 40, pressure: -12, cat: "高级空间" },
    'r13': { name: "学术大礼堂", cost: 450000, study: 30, pressure: -20, cat: "高级空间" },
    'r14': { name: "豪华宿舍楼", cost: 180000, study: 2, pressure: -35, cat: "高级空间" }
};

let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, 
    mode: 2, students: 20, slots: Array(24).fill(null)
};

// --- 物理级弹窗控制 ---
function showPopup(content) {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');

    // 只有在打开时才注入样式，彻底防止白条
    modal.style.cssText = `
        display: block;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-height: 80vh;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        z-index: 10001;
        overflow-y: auto;
        padding: 20px;
    `;
    
    modal.innerHTML = content;
    overlay.style.display = 'block';
    
    // 锁定背景滚动
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');

    // 撤销所有样式和内容
    modal.style.display = 'none';
    modal.style.boxShadow = 'none';
    modal.innerHTML = ''; 
    overlay.style.display = 'none';
    
    document.body.style.overflow = 'auto';
}

// --- 渲染逻辑 ---
function refreshGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    game.slots.forEach((item, i) => {
        const slot = document.createElement('div');
        slot.className = `slot ${item ? 'built' : ''}`;
        if(item) {
            slot.innerHTML = `
                <div class="lv-badge">Lv.${item.lv}</div>
                <div style="color:var(--p-blue);font-weight:bold;text-align:center;padding:0 5px;">${item.name}</div>
            `;
        } else {
            slot.innerHTML = '<span style="color:#ccc;font-size:24px">+</span>';
        }
        slot.onclick = () => item ? openUpgrade(i) : openBuild(i);
        grid.appendChild(slot);
    });
}

function openBuild(idx) {
    let html = `<h2 style="margin-top:0;text-align:center;font-size:18px;">规划新地块</h2>`;
    const cats = ["核心教学", "科学技术", "艺术体育", "高级空间"];
    
    cats.forEach(c => {
        html += `<div style="font-size:11px;color:#999;margin:10px 0 5px;border-left:3px solid var(--p-blue);padding-left:8px;">${c}</div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">`;
        for(let key in MASTER_ROOMS) {
            const r = MASTER_ROOMS[key];
            if(r.cat === c) {
                html += `
                    <div onclick="confirmBuild(${idx}, '${key}')" style="background:#f8f9fa;padding:12px;border-radius:12px;text-align:center;border:1px solid #eee;">
                        <div style="font-weight:bold;font-size:13px;">${r.name}</div>
                        <div style="color:#e67e22;font-size:11px;margin-top:3px;">¥${(r.cost/10000).toFixed(1)}w</div>
                    </div>`;
            }
        }
        html += `</div>`;
    });
    showPopup(html);
}

function confirmBuild(idx, key) {
    const r = MASTER_ROOMS[key];
    if(game.money >= r.cost) {
        game.money -= r.cost;
        game.slots[idx] = { ...r, lv: 1 };
        addLog(`🔨 建造成功：${r.name}`);
        closePopup();
        refreshGrid();
        updateUI();
    } else {
        alert("经费不足，无法开工！");
    }
}

function openUpgrade(idx) {
    const r = game.slots[idx];
    const cost = Math.floor(r.cost * 0.7 * r.lv);
    showPopup(`
        <h3 style="text-align:center;margin-top:0;">${r.name} 升级</h3>
        <p style="text-align:center;color:#666;font-size:14px;">当前等级: Lv.${r.lv} <br> 升级后教学/减压效果提升 50%</p>
        <button class="btn-next" style="font-size:16px;margin-top:10px;" onclick="confirmUpgrade(${idx}, ${cost})">支付 ¥${(cost/10000).toFixed(1)}w 升级</button>
    `);
}

function confirmUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        const s = game.slots[idx];
        s.lv++;
        s.study = Math.floor(s.study * 1.5);
        if(s.pressure < 0) s.pressure = Math.floor(s.pressure * 1.5);
        addLog(`✨ ${s.name} 已升至 Lv.${s.lv}`);
        closePopup();
        refreshGrid();
        updateUI();
    } else {
        alert("资金不足，无法升级设施！");
    }
}

function updateUI() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(game.pressure)}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('round').innerText = game.round;
}

function addLog(m) {
    const l = document.getElementById('logs');
    l.innerHTML = `<div style="margin-bottom:4px;">[学期${game.round}] ${m}</div>` + l.innerHTML;
}

function setMode(m) {
    game.mode = m;
    document.querySelectorAll('.btn-mode').forEach((b, i) => b.classList.toggle('active', i+1===m));
    addLog(`📢 模式切换：${['佛系教育','标准模式','应试魔鬼'][m-1]}`);
}

function nextRound() {
    let s = 0, p = 0;
    game.slots.forEach(it => { if(it) { s += it.study; p += it.pressure; }});
    
    // 基础收入与结算
    let income = game.students * 6000;
    if(game.mode === 1) { p -= 40; s *= 0.5; }
    if(game.mode === 3) { p += 30; s *= 2.5; }

    game.money += income;
    game.pressure = Math.max(0, Math.min(100, game.pressure + p));
    game.rep += Math.floor(s / 15);
    game.round++;

    if(game.pressure > 90) { game.money -= 150000; game.rep -= 30; addLog("🚨 警告：压力过大导致群体退学，损失15w经费！"); }
    
    addLog(`学期结束：收入 ¥${(income/10000).toFixed(1)}w，声望上涨 ${Math.floor(s/15)}`);
    updateUI();
}

// 初始化
refreshGrid();
updateUI();
