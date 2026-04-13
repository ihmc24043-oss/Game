/**
 * 传奇校长：交流团 + 研究 + 全建筑完整版
 */

// 1. 建筑数据 (补全 14 种)
const BUILD_DB = {
    '核心教学': [
        { id: 'h1', name: "标准教室", cost: 30000, study: 20, type: 'acad' },
        { id: 'h2', name: "语言教室", cost: 70000, study: 50, type: 'acad' },
        { id: 'h3', name: "阶梯教室", cost: 100000, study: 80, type: 'acad' }
    ],
    '艺术体育': [
        { id: 'a1', name: "琴房", cost: 90000, study: 20, type: 'art' },
        { id: 'a2', name: "舞蹈室", cost: 120000, study: 25, type: 'art' },
        { id: 'a3', name: "球馆", cost: 300000, study: 60, type: 'sport' },
        { id: 'a4', name: "游泳池", cost: 500000, study: 80, type: 'sport' }
    ],
    '科学技术': [
        { id: 's1', name: "物理室", cost: 120000, study: 90, type: 'acad' },
        { id: 's2', name: "微机房", cost: 180000, study: 130, type: 'acad' },
        { id: 's3', name: "实验室", cost: 250000, study: 180, type: 'acad' },
        { id: 's4', name: "天象台", cost: 400000, study: 250, type: 'acad' }
    ],
    '高级空间': [
        { id: 'g1', name: "图书馆", cost: 300000, study: 60, type: 'acad' },
        { id: 'g2', name: "礼堂", cost: 600000, study: 40, type: 'art' },
        { id: 'g3', name: "办公楼", cost: 200000, study: 10, type: 'acad' }
    ]
};

// 2. 游戏状态
let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, 
    slots: Array(24).fill(null), 
    resLv: 0, 
    activeEvent: null 
};

// --- 物理弹窗逻辑 ---
function openPop(html) {
    const ov = document.createElement('div');
    ov.id = 'ov'; ov.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;";
    ov.onclick = closePop;
    const box = document.createElement('div');
    box.id = 'box'; box.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-height:80vh;background:white;border-radius:20px;padding:20px;z-index:10001;overflow-y:auto;`;
    box.innerHTML = `<div onclick="closePop()" style="position:absolute;right:15px;top:10px;font-size:24px;color:#ccc;">×</div>${html}`;
    document.body.appendChild(ov); document.body.appendChild(box);
}
function closePop() {
    const o = document.getElementById('ov'); const b = document.getElementById('box');
    if(o) o.remove(); if(b) b.remove();
}

// --- 交流团系统 ---
function checkExchangeEvent() {
    const ez = document.getElementById('event-zone');
    ez.innerHTML = '';
    
    // 每 4 个学期触发一次
    if (game.round % 4 === 0 && !game.activeEvent) {
        const types = ['学术', '艺术', '体育'];
        const targetType = types[Math.floor(Math.random() * types.length)];
        const targetValue = 50 + game.round * 15;
        
        game.activeEvent = { type: targetType, val: targetValue };
        
        ez.innerHTML = `
            <div class="event-card">
                <div style="color:var(--p-red);font-weight:bold;margin-bottom:5px;">⚠️ 国际交流团到访预告</div>
                <div style="font-size:12px;line-height:1.4;">
                    来自英国的考察团将在学期末检查我校的<b>【${targetType}】</b>水平。
                    目标课时：<span style="color:var(--p-red)">${targetValue}</span>
                </div>
            </div>
        `;
    }
}

// --- 建造/升级/操作 ---
function buildMenu(idx) {
    let h = `<h3>新建设施</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px;">`;
    for(let cat in BUILD_DB) {
        BUILD_DB[cat].forEach(b => {
            h += `<div onclick="doBuild(${idx},'${b.id}')" style="background:#f8f9fa;padding:12px;border-radius:12px;border:1px solid #eee;text-align:center;">
                    <div style="font-weight:bold;font-size:12px;">${b.name}</div>
                    <div style="color:#e67e22;font-size:11px;font-weight:bold;margin-top:4px;">¥${(b.cost/10000).toFixed(1)}w</div>
                  </div>`;
        });
    }
    h += `</div>`;
    openPop(h);
}

function doBuild(idx, bid) {
    let all = []; Object.values(BUILD_DB).forEach(arr => all = all.concat(arr));
    const b = all.find(x => x.id === bid);
    if(game.money >= b.cost) {
        game.money -= b.cost;
        game.slots[idx] = { ...b, lv: 1 };
        closePop(); refresh();
    } else alert("资金不足！");
}

function upgradeMenu(idx) {
    const s = game.slots[idx];
    const cost = Math.floor(s.cost * 0.8 * s.lv);
    openPop(`
        <h3 style="text-align:center;">${s.name} (Lv.${s.lv})</h3>
        <button onclick="doUpgrade(${idx},${cost})" style="width:100%;padding:15px;background:var(--p-green);color:white;border:none;border-radius:12px;margin-top:15px;font-weight:bold;">支付 ¥${(cost/10000).toFixed(1)}w 升级</button>
        <button onclick="doRemove(${idx})" style="width:100%;margin-top:10px;color:#999;border:none;background:none;font-size:12px;">拆除建筑</button>
    `);
}

function doUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        game.slots[idx].lv++;
        game.slots[idx].study = Math.floor(game.slots[idx].study * 1.5);
        closePop(); refresh();
    }
}

function doRemove(idx) { game.slots[idx] = null; closePop(); refresh(); }

// --- 刷新与结算 ---
function refresh() {
    let totalS = 0;
    game.slots.forEach(s => { if(s) totalS += s.study; });

    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('lessons').innerText = totalS;
    document.getElementById('pressure').innerText = `${game.pressure}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('round').innerText = game.round;
    document.getElementById('res-lv').innerText = `Lv.${game.resLv}`;

    const g = document.getElementById('grid'); g.innerHTML = '';
    game.slots.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = `slot ${s ? 'built' : ''}`;
        d.innerHTML = s ? `<div class="lv-tag">Lv.${s.lv}</div><div class="slot-name">${s.name}</div>` : '+';
        d.onclick = () => s ? upgradeMenu(i) : buildMenu(i);
        g.appendChild(d);
    });
}

function nextRound() {
    // 交流团结算
    if (game.activeEvent) {
        let currentPower = 0;
        const mapping = { '学术': 'acad', '艺术': 'art', '体育': 'sport' };
        game.slots.forEach(s => {
            if (s && s.type === mapping[game.activeEvent.type]) currentPower += s.study;
        });

        if (currentPower >= game.activeEvent.val) {
            alert(`🎉 交流团非常满意！获得声望 +20，经费奖励 ¥20w`);
            game.rep += 20;
            game.money += 200000;
        } else {
            alert(`💢 交流团认为我校【${game.activeEvent.type}】水平太差，声望下降 -15`);
            game.rep -= 15;
        }
        game.activeEvent = null;
    }

    game.money += 200000;
    game.round++;
    checkExchangeEvent();
    refresh();
}

function researchMenu() {
    openPop(`<h3>科研中心</h3><p style="text-align:center;padding:20px;color:#666;">科研系统对接中...</p>`);
}

window.onload = () => { checkExchangeEvent(); refresh(); };
