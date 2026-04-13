/**
 * 校长：黑暗权力重制版 核心脚本
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

let game = {
    money: 1000000, pressure: 0, rep: 60, round: 1, joy: 0, media: 0,
    slots: Array(24).fill(null),
    teachers: [],
    tuition: 8000
};

// --- 初始化网格 ---
function initGrid() {
    const g = document.getElementById('game-grid');
    g.innerHTML = '';
    game.slots.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = `cell ${s ? 'occupied' : ''}`;
        div.innerHTML = s ? `<div class="lv-tag">Lv.${s.lv}</div>${s.name}` : '+';
        div.onclick = () => s ? upgradeRoom(i) : buildMenu(i);
        g.appendChild(div);
    });
    checkLock();
}

function checkLock() {
    const rooms = game.slots.filter(s => s && s.id.startsWith('c')).length;
    const teas = game.teachers.length;
    document.getElementById('room-count').innerText = `${rooms}/6`;
    document.getElementById('tea-count').innerText = `${teas}/6`;
    const btn = document.getElementById('run-btn');
    if(rooms >= 6 && teas >= 6) {
        btn.disabled = false;
        btn.innerText = "🔔 开始第 " + game.round + " 学期结算";
    } else {
        btn.disabled = true;
        btn.innerText = "需 6教室 + 6教师 (差" + (6-rooms) + "间/" + (6-teas) + "人)";
    }
}

// --- UI 系统 ---
function modal(title, html) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `<div class="modal"><h3>${title}</h3><hr style="margin:10px 0;">${html}</div>`;
    document.body.appendChild(overlay);
}

function buildMenu(idx) {
    let h = DATA.rooms.map(r => `
        <div class="list-item" onclick="doBuild(${idx},'${r.id}')">
            <b>${r.name}</b> <span style="float:right;color:#e74c3c">¥${r.cost}</span><br>
            <small>学力+${r.study} | 压力+${r.p} | 容量+${r.cap}</small>
        </div>
    `).join('');
    modal("基建工程部", h);
}

function doBuild(idx, rid) {
    let r = DATA.rooms.find(x => x.id === rid);
    if(game.money >= r.cost) {
        game.money -= r.cost;
        game.slots[idx] = { ...r, lv: 1 };
        document.querySelector('.overlay').remove();
        refresh();
    } else alert("钱不够！");
}

function upgradeRoom(idx) {
    let s = game.slots[idx];
    let cost = s.cost * 0.8;
    modal(s.name + " 升级中心", `
        <p>当前等级: Lv.${s.lv}</p>
        <p>升级费用: ¥${cost}</p>
        <button onclick="doUpgrade(${idx}, ${cost})" style="width:100%;padding:15px;background:#2ecc71;color:white;border:none;border-radius:10px;margin-top:10px;">执行全方位翻新</button>
        <button onclick="doRemove(${idx})" style="width:100%;margin-top:20px;background:none;border:none;color:#999;">拆除地块</button>
    `);
}

function doUpgrade(idx, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        game.slots[idx].lv++;
        game.slots[idx].study *= 1.6;
        document.querySelector('.overlay').remove();
        refresh();
    }
}

function doRemove(idx) { game.slots[idx] = null; document.querySelector('.overlay').remove(); refresh(); }

// --- 底部动作栏 ---
function ui(type) {
    if(type === 'hire') {
        let h = DATA.teachers.map(t => `
            <div class="list-item" onclick="doHire('${t.name}',${t.wage},${t.q})">
                <b>${t.name}</b> <span style="float:right">月薪: ¥${t.wage}</span><br>
                <small>教学贡献力: +${t.q}</small>
            </div>
        `).join('');
        modal("猎头公司", h);
    } else if(type === 'luxury') {
        modal("校长奢享店", `
            <div class="list-item" onclick="buy(100000, 20, '纯金雕像')">🏛️ 纯金自我雕像 - ¥10w (快乐+20)</div>
            <div class="list-item" onclick="buy(1000000, 200, '私人直升机')">🚁 湾流直升机 - ¥100w (快乐+200)</div>
        `);
    } else if(type === 'research') {
        modal("媒体与政府关系", `
            <div class="list-item" onclick="upMedia()">📱 升级媒体公关 (当前Lv.${game.media}) - ¥20w<br><small>发生意外时，封口费更便宜，政府拨款更多</small></div>
        `);
    } else if(type === 'exchange') {
        modal("国际交流团", `
            <div class="list-item" onclick="doExchange(50000, 5)">🇯🇵 东京学术会 - ¥5w (名望+5)</div>
            <div class="list-item" onclick="doExchange(200000, 25)">🇬🇧 牛津精英行 - ¥20w (名望+25)</div>
        `);
    }
}

function doHire(n, w, q) { game.teachers.push({name:n, wage:w, q:q}); refresh(); }
function buy(c, j, n) { if(game.money >= c) { game.money -= c; game.joy += j; alert("购买 " + n + " 成功！你感到无比愉悦。"); refresh(); } }
function upMedia() { if(game.money >= 200000) { game.money -= 200000; game.media++; refresh(); } }
function doExchange(c, r) { if(game.money >= c) { game.money -= c; game.rep += r; alert("交流圆满完成！"); refresh(); } }

function updateFee(v) {
    game.tuition = parseInt(v);
    document.getElementById('fee-val').innerText = v;
    const pill = document.getElementById('risk-pill');
    if(v < 15000) { pill.innerText = "风险: 安全"; pill.style.color = "green"; }
    else if(v < 40000) { pill.innerText = "风险: 较高"; pill.style.color = "orange"; }
    else { pill.innerText = "风险: 极度危险"; pill.style.color = "red"; }
}

// --- 结算逻辑 ---
function nextRound() {
    let cap = 0, totalS = 0, totalP = 0;
    game.slots.forEach(s => { if(s) { cap += s.cap; totalS += s.study; totalP += s.p; } });
    game.teachers.forEach(t => { totalS += t.q; game.money -= t.wage; });

    // 学费收入与风险
    if(game.tuition > 15000 && Math.random() < (game.tuition / 100000)) {
        alert("🚨 教育局接到了大量家长举报！查实你违规高收费，没收所有违规所得并罚款 ¥50w！");
        game.money -= 500000;
        game.rep -= 30;
    } else {
        game.money += cap * game.tuition;
    }

    // 状态更新
    game.pressure = Math.max(0, game.pressure + totalP);
    game.rep += Math.floor(totalS / 100);

    // 自杀事件
    if(game.pressure > 90 && Math.random() < 0.4) {
        let hush = 1000000 / (game.media + 1);
        if(game.money >= hush) {
            alert(`💀 噩耗：一名学生因无法承受压力在深夜跳楼。你支付了 ¥${(hush/10000).toFixed(1)}w 封口费。由于你的媒体控制力，消息被压下了。`);
            game.money -= hush;
        } else {
            alert("💀 惨剧发生！由于你没钱封口，媒体大规模报道！名望清零，政府强制关闭学校！");
            location.reload();
        }
    }

    // 政府补助
    game.money += 200000 + (game.media * 50000);

    // 破产判定
    if(game.money < -50000) { alert("你破产了！债主把你带走了。"); location.reload(); }

    game.round++;
    refresh();
    alert("学期结算成功！\n本学期净利润: 结算完成");
}

function refresh() {
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${game.pressure}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('joy').innerText = game.joy;
    initGrid();
}

window.onload = refresh;
