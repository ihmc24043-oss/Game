/**
 * 传奇校长：彻底根除白条版
 * 策略：1. 使用 visibility 替代 display 解决渲染残留
 * 2. 动态清理 innerHTML
 * 3. 锁定背景滚动
 */

const MASTER_ROOMS = {
    'standard': { name: "标准教室", cost: 30000, study: 15, pressure: 10, cat: "核心教学" },
    'language': { name: "语言实验室", cost: 60000, study: 25, pressure: 12, cat: "核心教学" },
    'math': { name: "数学研讨室", cost: 55000, study: 22, pressure: 10, cat: "核心教学" },
    'physics': { name: "物理实验室", cost: 85000, study: 40, pressure: 20, cat: "科学技术" },
    'chemistry': { name: "化学实验室", cost: 90000, study: 42, pressure: 22, cat: "科学技术" },
    'computer': { name: "计算机房", cost: 120000, study: 50, pressure: 25, cat: "科学技术" },
    'maker': { name: "创客空间", cost: 150000, study: 65, pressure: 30, cat: "科学技术" },
    'music': { name: "音乐教室", cost: 85000, study: 10, pressure: -20, cat: "艺术体育" },
    'dance': { name: "舞蹈教室", cost: 100000, study: 12, pressure: -22, cat: "艺术体育" },
    'gym': { name: "体育馆 (双格)", cost: 400000, study: 30, pressure: -50, cat: "艺术体育", double: true },
    'pool': { name: "游泳馆 (双格)", cost: 450000, study: 25, pressure: -60, cat: "艺术体育", double: true },
    'library': { name: "图书馆 (双格)", cost: 250000, study: 45, pressure: -15, cat: "高级空间", double: true },
    'hall': { name: "大礼堂 (双格)", cost: 500000, study: 20, pressure: -30, cat: "高级空间", double: true },
    'dorm': { name: "豪华宿舍", cost: 150000, study: 5, pressure: -40, cat: "高级空间" }
};

let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, 
    mode: 2, students: 20, slots: Array(24).fill(null)
};

// 弹窗控制：终极修复方案
function showPopup(content) {
    const mask = document.getElementById('overlay');
    const box = document.getElementById('modal');
    if(!mask || !box) return;

    box.innerHTML = content;
    // 强制显示
    mask.style.cssText = "display: block; opacity: 1; visibility: visible; pointer-events: auto;";
    box.style.cssText = "display: block; opacity: 1; visibility: visible; pointer-events: auto;";
    // 锁定主体滚动，防止白条位移
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    const mask = document.getElementById('overlay');
    const box = document.getElementById('modal');
    if(!mask || !box) return;

    // 彻底隐藏：三管齐下
    mask.style.cssText = "display: none; opacity: 0; visibility: hidden; pointer-events: none;";
    box.style.cssText = "display: none; opacity: 0; visibility: hidden; pointer-events: none;";
    
    // 清空 HTML，防止某些手机浏览器保留渲染快照
    box.innerHTML = ""; 
    document.body.style.overflow = 'auto';
}

// 渲染 24 地块
function refreshGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    game.slots.forEach((item, i) => {
        const slot = document.createElement('div');
        slot.className = `slot ${item ? 'built' : ''}`;
        // 根据你的截图增加样式兼容
        slot.innerHTML = item ? 
            `<div style="color:#3498db;font-weight:bold">${item.name}</div><div class="lv-badge">Lv.${item.lv}</div>` : 
            `<span style="color:#ccc;font-size:24px">+</span>`;
        slot.onclick = () => item ? openUpgrade(i) : openBuild(i);
        grid.appendChild(slot);
    });
}

function openBuild(idx) {
    let html = `<h2 style="margin:0 0 15px 0; font-size:18px; text-align:center;">建造新设施</h2>`;
    const cats = ["核心教学", "科学技术", "艺术体育", "高级空间"];
    
    cats.forEach(cat => {
        html += `<div style="font-size:12px; color:#888; margin-top:10px; border-left:3px solid #3498db; padding-left:8px;">${cat}</div>`;
        html += `<div class="build-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:8px 0;">`;
        for(let k in MASTER_ROOMS) {
            let r = MASTER_ROOMS[k];
            if(r.cat === cat) {
                html += `
                    <div class="build-item" onclick="confirmBuild(${idx}, '${k}')" 
                         style="border:1px solid #eee; padding:10px; border-radius:12px; text-align:center; background:#f9f9f9;">
                        <div style="font-size:13px; color:#333; margin-bottom:4px;">${r.name}</div>
                        <div style="font-size:11px; color:#e67e22;">¥${r.cost.toLocaleString()}</div>
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
        alert("经费不足，校长请三思！");
    }
}

function openUpgrade(idx) {
    const r = game.slots[idx];
    const cost = Math.floor(r.cost * 0.7 * r.lv);
    showPopup(`
        <h3 style="text-align:center">${r.name} 升级</h3>
        <p style="text-align:center; color:#666;">当前等级: Lv.${r.lv}</p>
        <button onclick="confirmUpgrade(${idx}, ${cost})" 
                style="width:100%; background:#2c3e50; color:#f1c40f; border:none; padding:15px; border-radius:12px; font-weight:bold; font-size:16px;">
            支付 ¥${cost.toLocaleString()} 升级
        </button>
    `);
}

function confirmUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        game.slots[idx].lv++;
        game.slots[idx].study *= 1.5;
        closePopup();
        refreshGrid();
        updateUI();
    }
}

function updateUI() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(game.pressure)}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('round').innerText = game.round;
}

function nextRound() {
    let s = 0, p = 0;
    game.slots.forEach(it => { if(it) { s += it.study; p += it.pressure; }});
    game.money += (game.students * 6000);
    game.pressure = Math.max(0, Math.min(100, game.pressure + p));
    game.rep += Math.floor(s / 15);
    game.round++;
    updateUI();
}

function setMode(m) {
    game.mode = m;
    document.querySelectorAll('.btn-mode').forEach((b, i) => b.classList.toggle('active', i+1===m));
}

window.onload = () => { closePopup(); refreshGrid(); updateUI(); };
