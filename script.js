/**
 * 传奇校长：黑暗权力 (24地块硬核版)
 */

const DATA = {
    rooms: [
        { id: 'c1', name: "标准教室", cost: 50000, study: 20, p: 10, cap: 40 },
        { id: 'c2', name: "电脑机房", cost: 180000, study: 80, p: 25, cap: 30 },
        { id: 'c3', name: "化学实验中心", cost: 250000, study: 110, p: 35, cap: 20 },
        { id: 'c4', name: "全能体育馆", cost: 400000, study: 15, p: -50, cap: 0 },
        { id: 'c5', name: "心理诊疗室", cost: 300000, study: 0, p: -80, cap: 0 }
    ],
    teachers: [
        { name: "实习教师", wage: 3000, q: 10 },
        { name: "资深教师", wage: 7500, q: 40 },
        { name: "特级教师", wage: 15000, q: 90 },
        { name: "外聘教授", wage: 25000, q: 150 }
    ]
};

// 初始状态
let game = {
    money: 1000000,
    pressure: 0,
    rep: 60,
    round: 1,
    joy: 0,
    media: 0,
    slots: Array(24).fill(null), // 必须确保是24个
    teachers: [],
    tuition: 8000
};

// --- 核心渲染函数 ---
function renderGrid() {
    const gridContainer = document.getElementById('game-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = ''; // 清空重新画
    
    for (let i = 0; i < 24; i++) {
        const slotData = game.slots[i];
        const cell = document.createElement('div');
        
        // 样式处理
        cell.className = slotData ? 'cell occupied' : 'cell';
        
        if (slotData) {
            // 已建成建筑的内容
            cell.innerHTML = `
                <div class="lv-tag">Lv.${slotData.lv}</div>
                <div style="font-size:10px; color:#2c3e50;">#${i+1}</div>
                <div style="font-size:11px;">${slotData.name}</div>
            `;
            cell.onclick = () => upgradeRoom(i);
        } else {
            // 空地块的内容
            cell.innerHTML = `<span style="color:#666; font-size:12px;">#${i+1}</span><br><span style="color:#444; font-size:16px;">+</span>`;
            cell.onclick = () => buildMenu(i);
        }
        
        gridContainer.appendChild(cell);
    }
    checkRequirements();
}

// --- 检查开学门槛 ---
function checkRequirements() {
    const builtClassrooms = game.slots.filter(s => s && s.id.startsWith('c')).length;
    const teacherCount = game.teachers.length;
    
    // 更新顶部数字
    document.getElementById('room-count').innerText = `${builtClassrooms}/6`;
    document.getElementById('tea-count').innerText = `${teacherCount}/6`;
    
    const btn = document.getElementById('run-btn');
    if (builtClassrooms >= 6 && teacherCount >= 6) {
        btn.disabled = false;
        btn.style.background = "#2ecc71"; // 达标变绿
        btn.style.color = "white";
        btn.innerText = `🔔 开始第 ${game.round} 学期结算`;
    } else {
        btn.disabled = true;
        btn.style.background = "#ccc";
        btn.innerText = `缺: ${6 - builtClassrooms}教室 / ${6 - teacherCount}教师`;
    }
}

// --- 弹窗逻辑 ---
function modal(title, html) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h3 style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">${title}</h3>
            ${html}
            <button onclick="this.closest('.overlay').remove()" style="width:100%; margin-top:15px; padding:10px; border:none; background:#eee; border-radius:10px;">返回</button>
        </div>
    `;
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
}

// --- 建造与操作 ---
function buildMenu(idx) {
    let h = DATA.rooms.map(r => `
        <div class="list-item" onclick="doBuild(${idx},'${r.id}')">
            <b>${r.name}</b> <span style="float:right; color:#e74c3c;">¥${(r.cost/10000).toFixed(1)}w</span><br>
            <small>产出:${r.study} | 压力:${r.p} | 学生:+${r.cap}</small>
        </div>
    `).join('');
    modal("选择要建设的设施", h);
}

function doBuild(idx, rid) {
    let r = DATA.rooms.find(x => x.id === rid);
    if (game.money >= r.cost) {
        game.money -= r.cost;
        game.slots[idx] = { ...r, lv: 1 };
        const modal = document.querySelector('.overlay');
        if (modal) modal.remove();
        refresh();
    } else {
        alert("校长，咱们账上钱不够了！");
    }
}

function upgradeRoom(idx) {
    let s = game.slots[idx];
    let upgradeCost = Math.floor(s.cost * 0.7);
    modal(`${s.name} (#${idx+1})`, `
        <p>当前等级：Lv.${s.lv}</p>
        <p>升级费用：¥${(upgradeCost/10000).toFixed(1)}w</p>
        <button onclick="doUpgrade(${idx}, ${upgradeCost})" style="width:100%; padding:15px; background:linear-gradient(to right, #2ecc71, #27ae60); color:white; border:none; border-radius:10px; margin-top:10px; font-weight:bold;">全面升级 (产出+60%)</button>
        <button onclick="doRemove(${idx})" style="width:100%; margin-top:20px; background:none; border:none; color:#e74c3c; font-size:12px;">拆除此建筑 (不退款)</button>
    `);
}

function doUpgrade(idx, cost) {
    if (game.money >= cost) {
        game.money -= cost;
        game.slots[idx].lv++;
        game.slots[idx].study = Math.floor(game.slots[idx].study * 1.6);
        document.querySelector('.overlay').remove();
        refresh();
    } else alert("经费不足！");
}

function doRemove(idx) { 
    game.slots[idx] = null; 
    document.querySelector('.overlay').remove(); 
    refresh(); 
}

// --- 招聘与其它 ---
function ui(type) {
    if (type === 'hire') {
        let h = DATA.teachers.map(t => `
            <div class="list-item" onclick="doHire('${t.name}',${t.wage},${t.q})">
                <b>${t.name}</b> <span style="float:right;">月薪:¥${t.wage}</span><br>
                <small>教学贡献：+${t.q}</small>
            </div>
        `).join('');
        modal("招聘名师", h);
    } else if (type === 'luxury') {
        modal("奢侈品商店", `
            <div class="list-item" onclick="buy(200000, 50, '金表')">⌚ 劳力士校董表 - ¥20w (快乐+50)</div>
            <div class="list-item" onclick="buy(1500000, 500, '直升机')">🚁 私人直升机 - ¥150w (快乐+500)</div>
        `);
    } else if (type === 'research') {
        modal("科技与媒体", `
            <div class="list-item" onclick="upMedia()">📱 公关团队 Lv.${game.media} - ¥20w<br><small>降低自杀丑闻罚款</small></div>
        `);
    } else if (type === 'exchange') {
        modal("国际交流", `
            <div class="list-item" onclick="doExchange(100000, 15)">🌍 访美学术团 - ¥10w (名望+15)</div>
        `);
    }
}

function doHire(n, w, q) { game.teachers.push({name:n, wage:w, q:q}); refresh(); }
function buy(c, j, n) { if(game.money >= c) { game.money -= c; game.joy += j; alert("购买成功！"); refresh(); } }
function upMedia() { if(game.money >= 200000) { game.money -= 200000; game.media++; refresh(); } }
function doExchange(c, r) { if(game.money >= c) { game.money -= c; game.rep += r; refresh(); } }

function updateFee(v) {
    game.tuition = parseInt(v);
    document.getElementById('fee-val').innerText = v;
    const pill = document.getElementById('risk-pill');
    if(v < 15000) { pill.innerText = "风险: 安全"; pill.style.background = "#e1f5fe"; }
    else if(v < 40000) { pill.innerText = "风险: 较高"; pill.style.background = "#fff3e0"; }
    else { pill.innerText = "风险: 极度危险"; pill.style.background = "#ffeaf0"; }
}

// --- 学期结算 ---
function nextRound() {
    let cap = 0, totalS = 0, totalP = 0;
    game.slots.forEach(s => { if(s) { cap += s.cap; totalS += s.study; totalP += s.p; } });
    game.teachers.forEach(t => { totalS += t.q; game.money -= t.wage; });

    // 收入
    if(game.tuition > 20000 && Math.random() < 0.4) {
        alert("🚨 家长集体抗议！政府开出 ¥40w 罚单！");
        game.money -= 400000; game.rep -= 20;
    } else {
        game.money += cap * game.tuition;
    }

    game.pressure = Math.max(0, game.pressure + totalP);
    game.rep += Math.floor(totalS / 100);

    // 自杀逻辑
    if(game.pressure > 95 && Math.random() < 0.3) {
        let hush = 1000000 / (game.media + 1);
        if(game.money >= hush) {
            alert(`💀 噩耗：有学生跳楼。你支付了 ¥${(hush/10000).toFixed(1)}w 封口费。`);
            game.money -= hush;
        } else {
            alert("💀 惨剧曝光！名望清零，学校关停！");
            location.reload();
        }
    }

    game.money += 150000; // 政府基础补贴
    game.round++;
    refresh();
}

function refresh() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${game.pressure}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('joy').innerText = game.joy;
    renderGrid();
}

window.onload = refresh;
