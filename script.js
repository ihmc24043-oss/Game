/**
 * 传奇校长：修复版核心引擎
 * 重点：消除白条 Bug，同步截图建筑列表
 */

// 1. 严格同步截图中的建筑数据
const MASTER_ROOMS = {
    // 核心教学
    'standard': { name: "标准教室", cost: 30000, study: 15, pressure: 10, cat: "核心教学" },
    'language': { name: "语言实验室", cost: 60000, study: 25, pressure: 12, cat: "核心教学" },
    'math': { name: "数学研讨室", cost: 55000, study: 22, pressure: 10, cat: "核心教学" },
    
    // 科学技术
    'physics': { name: "物理实验室", cost: 85000, study: 40, pressure: 20, cat: "科学技术" },
    'chemistry': { name: "化学实验室", cost: 90000, study: 42, pressure: 22, cat: "科学技术" },
    'computer': { name: "计算机房", cost: 120000, study: 50, pressure: 25, cat: "科学技术" },
    'maker': { name: "创客空间", cost: 150000, study: 65, pressure: 30, cat: "科学技术" },

    // 艺术体育
    'music': { name: "音乐教室", cost: 85000, study: 10, pressure: -20, cat: "艺术体育" },
    'dance': { name: "舞蹈教室", cost: 100000, study: 12, pressure: -22, cat: "艺术体育" },
    'gym': { name: "体育馆 (双格)", cost: 400000, study: 30, pressure: -50, cat: "艺术体育", double: true },
    'pool': { name: "游泳馆 (双格)", cost: 450000, study: 25, pressure: -60, cat: "艺术体育", double: true },

    // 高级空间
    'library': { name: "图书馆 (双格)", cost: 250000, study: 45, pressure: -15, cat: "高级空间", double: true },
    'hall': { name: "大礼堂 (双格)", cost: 500000, study: 20, pressure: -30, cat: "高级空间", double: true },
    'dorm': { name: "豪华宿舍", cost: 150000, study: 5, pressure: -40, cat: "高级空间" }
};

let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, 
    mode: 2, students: 20, maxStudents: 20,
    slots: Array(24).fill(null)
};

window.onload = () => {
    // 强制关闭弹窗，防止初始白条
    closePopup(); 
    refreshGrid();
    updateUI();
};

function refreshGrid() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    grid.innerHTML = '';
    game.slots.forEach((item, i) => {
        const slot = document.createElement('div');
        slot.className = `slot ${item ? 'built' : ''}`;
        slot.innerHTML = item ? `<b>${item.name}</b><div class="lv-badge">Lv.${item.lv}</div>` : '+';
        slot.onclick = () => item ? openUpgrade(i) : openBuild(i);
        grid.appendChild(slot);
    });
}

function openBuild(idx) {
    let html = `<h3 style="margin-top:0">建造新设施</h3>`;
    const categories = ["核心教学", "科学技术", "艺术体育", "高级空间"];
    
    categories.forEach(cat => {
        html += `<div style="font-size:12px; color:#999; margin:10px 0 5px;">${cat}</div><div class="build-grid">`;
        for(let key in MASTER_ROOMS) {
            const r = MASTER_ROOMS[key];
            if(r.cat === cat) {
                html += `
                    <div class="build-item" onclick="confirmBuild(${idx}, '${key}')">
                        <div style="color:#3498db; font-weight:bold; font-size:13px">${r.name}</div>
                        <div style="color:#e67e22; font-size:11px">¥${r.cost.toLocaleString()}</div>
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
        closePopup();
        refreshGrid();
        updateUI();
    } else {
        alert("经费不足！");
    }
}

function openUpgrade(idx) {
    const r = game.slots[idx];
    const cost = Math.floor(r.cost * 0.8 * r.lv);
    showPopup(`
        <h3>设施升级</h3>
        <p>${r.name} (Lv.${r.lv})</p>
        <button class="btn-next" style="font-size:14px" onclick="confirmUpgrade(${idx}, ${cost})">支付 ¥${cost.toLocaleString()} 升级</button>
    `);
}

function confirmUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        game.slots[idx].lv++;
        game.slots[idx].study = Math.floor(game.slots[idx].study * 1.5);
        closePopup();
        refreshGrid();
        updateUI();
    }
}

// 弹窗控制逻辑：彻底修复白条
function showPopup(content) {
    const mask = document.getElementById('overlay');
    const box = document.getElementById('modal');
    if(!mask || !box) return;
    
    box.innerHTML = content;
    mask.style.display = 'block';
    box.style.display = 'block';
}

function closePopup() {
    const mask = document.getElementById('overlay');
    const box = document.getElementById('modal');
    if(mask) mask.style.display = 'none';
    if(box) {
        box.style.display = 'none';
        box.innerHTML = ''; // 清空内容彻底消除高度
    }
}

function updateUI() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(game.pressure)}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('round').innerText = game.round;
}

// 模式切换
function setMode(m) {
    game.mode = m;
    const btns = document.querySelectorAll('.btn-mode');
    btns.forEach((btn, i) => {
        btn.classList.toggle('active', i + 1 === m);
    });
}

function nextRound() {
    let s = 0, p = 0;
    game.slots.forEach(item => {
        if(item) { s += item.study; p += item.pressure; }
    });
    
    // 简易结算逻辑
    game.money += (game.students * 5000);
    game.pressure = Math.max(0, Math.min(100, game.pressure + p));
    game.rep += Math.floor(s / 20);
    game.round++;
    updateUI();
    refreshGrid();
}
