/**
 * 传奇校长：终极权力版引擎
 */

// 1. 扩充的建筑数据
const ROOM_DB = {
    '教学': [
        { id: 'r1', name: "标准教室", cost: 50000, study: 20, cap: 0, p: 10 },
        { id: 'r2', name: "微机室", cost: 150000, study: 80, cap: 0, p: 20, update: "光纤网络" },
        { id: 'r3', name: "实验室", cost: 200000, study: 100, cap: 0, p: 25, update: "高端仪器" },
        { id: 'r4', name: "音乐室", cost: 120000, study: 15, cap: 0, p: -20, update: "施坦威钢琴" }
    ],
    '生活': [
        { id: 'l1', name: "简陋宿舍", cost: 80000, study: 0, cap: 50, p: 5 },
        { id: 'l2', name: "心理咨询室", cost: 250000, study: 0, cap: 0, p: -50 },
        { id: 'l3', name: "豪华食堂", cost: 180000, study: 5, cap: 0, p: -15 }
    ]
};

// 2. 教师数据
const TEACHER_DB = [
    { name: "实习生", wage: 2500, quality: 10, sub: "通用" },
    { name: "老学究", wage: 6000, quality: 35, sub: "学术" },
    { name: "海归博士", wage: 12000, quality: 75, sub: "科学" },
    { name: "魔鬼教官", wage: 9000, quality: 90, sub: "高压" }
];

// 3. 游戏核心状态
let game = {
    money: 1000000, rep: 60, round: 1, pressure: 0,
    slots: Array(24).fill(null),
    teachers: [],
    stuCap: 0, stuCurrent: 0,
    mediaControl: 0, // 媒体控制等级
    principalSkill: { speech: 0, thickSkin: 0, data: 0 }
};

// --- 物理弹窗管理 ---
function openPop(html) {
    const ov = document.createElement('div');
    ov.id = 'ov'; ov.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;";
    ov.onclick = closePop;
    const box = document.createElement('div');
    box.id = 'box'; box.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-height:85vh;background:white;border-radius:20px;padding:20px;z-index:10001;overflow-y:auto;`;
    box.innerHTML = `<div onclick="closePop()" style="position:absolute;right:15px;top:10px;font-size:24px;color:#ccc;">×</div>${html}`;
    document.body.appendChild(ov); document.body.appendChild(box);
}
function closePop() { const o=document.getElementById('ov'),b=document.getElementById('box'); if(o) o.remove(); if(b) b.remove(); }

// --- 招聘教师 ---
function openTeacherStore() {
    let h = `<h3>人才市场</h3>`;
    TEACHER_DB.forEach(t => {
        h += `<div class="list-item">
            <b>${t.name}</b> (${t.sub}) - 月薪: ¥${t.wage}<br>
            <button onclick="hireTeacher('${t.name}', ${t.wage}, ${t.quality})" style="background:var(--p-blue);color:white;border:none;padding:5px 10px;border-radius:5px;margin-top:5px;">雇佣</button>
        </div>`;
    });
    openPop(h);
}
function hireTeacher(n, w, q) {
    game.teachers.push({name:n, wage:w, quality:q});
    refresh();
}

// --- 建造功能 ---
function openBuild(idx) {
    let h = `<h3>建设新地块</h3>`;
    for(let cat in ROOM_DB) {
        h += `<div style="font-size:12px;color:#999;margin-top:10px;">${cat}</div>`;
        ROOM_DB[cat].forEach(r => {
            h += `<div class="list-item" onclick="doBuild(${idx}, '${r.id}')">
                <b>${r.name}</b> - 价格: ¥${r.cost}<br>
                <small>产出:${r.study} | 人数:+${r.cap} | 压力:${r.p}</small>
            </div>`;
        });
    }
    openPop(h);
}

function doBuild(idx, rid) {
    let r = [...ROOM_DB['教学'], ...ROOM_DB['生活']].find(x => x.id === rid);
    if(game.money >= r.cost) {
        game.money -= r.cost;
        game.slots[idx] = { ...r, lv: 1 };
        closePop(); refresh();
    } else alert("钱不够！");
}

// --- 交流团系统 ---
function openExchange() {
    openPop(`
        <h3>海外交流计划</h3>
        <p style="font-size:12px;color:#666;margin-bottom:10px;">送学生出国可以极大提升名望，但花费不菲。</p>
        <div class="list-item" onclick="startExchange('日本', 50000)">🇯🇵 东京研学 - 费用 ¥5w (名望 +5)</div>
        <div class="list-item" onclick="startExchange('英国', 200000)">🇬🇧 剑桥高端营 - 费用 ¥20w (名望 +25)</div>
        <button onclick="askGov()">🏛️ 申请政府资助 (概率成功)</button>
    `);
}
function startExchange(dest, cost) {
    if(game.money >= cost) {
        game.money -= cost;
        game.rep += (cost/10000);
        alert(`前往${dest}的旅程非常顺利！`);
        closePop(); refresh();
    }
}

// --- 奢侈品 (买了开心) ---
function openLuxury() {
    openPop(`
        <h3>校长办公室装饰</h3>
        <div class="list-item" onclick="buyLuxury('黄金地球仪', 50000)">🏆 纯金地球仪 - ¥5w (买了爽)</div>
        <div class="list-item" onclick="buyLuxury('红木办公桌', 120000)">🪵 红木大班台 - ¥12w (校长气场+0)</div>
    `);
}
function buyLuxury(n, c) {
    if(game.money >= c) {
        game.money -= c;
        alert(`你购买了${n}。什么都没发生，但你确实很快乐。`);
    }
}

// --- 研究与升级 ---
function openResearch() {
    openPop(`
        <h3>科研与媒体控制</h3>
        <div class="list-item" onclick="upMedia()">📱 媒体公关 Lv.${game.mediaControl} - ¥20w<br><small>降低自杀负面影响，增加政府拨款</small></div>
        <div class="list-item" onclick="upSkill('speech')">🎤 演讲技巧 Lv.${game.principalSkill.speech} - ¥10w<br><small>提高家长付费率</small></div>
    `);
}
function upMedia() {
    if(game.money >= 200000) { game.money -= 200000; game.mediaControl++; closePop(); refresh(); }
}

// --- 核心刷新 ---
function refresh() {
    let s = 0, p = 0, cap = 0;
    game.slots.forEach(slot => {
        if(slot) { s += slot.study; p += slot.p; cap += slot.cap; }
    });
    game.stuCap = cap;
    
    document.getElementById('money').innerText = `¥${(game.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(game.pressure)}%`;
    document.getElementById('rep').innerText = game.rep;
    document.getElementById('stu-count').innerText = `${game.stuCurrent}/${game.stuCap}`;
    document.getElementById('tea-count').innerText = game.teachers.length;
    document.getElementById('round').innerText = game.round;

    // 绘制地图
    const g = document.getElementById('grid'); g.innerHTML = '';
    game.slots.forEach((item, i) => {
        const d = document.createElement('div');
        d.className = `slot ${item?'built':''}`;
        d.innerHTML = item ? `<div class="lv-tag">Lv.${item.lv}</div><b>${item.name}</b>` : '+';
        d.onclick = () => item ? openUpgrade(i) : openBuild(i);
        g.appendChild(d);
    });

    // 压力警告红屏
    document.body.classList.toggle('danger-mode', game.pressure > 80);
}

// --- 升级面板 ---
function openUpgrade(idx) {
    const s = game.slots[idx];
    const cost = s.cost * 0.5;
    openPop(`
        <h3>管理：${s.name}</h3>
        <p>升级可提升50%产出能力</p>
        <button onclick="doLvUp(${idx}, ${cost})" style="width:100%;padding:10px;background:var(--p-green);color:white;border:none;border-radius:10px;margin-top:10px;">花费 ¥${cost} 升级</button>
    `);
}
function doLvUp(i, c) {
    if(game.money >= c) { game.money -= c; game.slots[i].lv++; game.slots[i].study *= 1.5; closePop(); refresh(); }
}

// --- 结算逻辑 ---
function nextRound() {
    // 1. 检查开学条件
    let classroomCount = game.slots.filter(x => x && x.id.startsWith('r')).length;
    if(classroomCount < 6 || game.teachers.length < 6) {
        alert("开学失败！需要至少 6 间教室和 6 名老师！");
        return;
    }

    // 2. 招生与学费
    let tuition = parseInt(document.getElementById('tuition').value);
    if(tuition > 50000 && Math.random() < 0.6) {
        alert("学费太高了！家长举报了你，政府罚款 20w！");
        game.money -= 200000;
        game.rep -= 20;
    }
    game.stuCurrent = game.stuCap; // 招满人
    game.money += game.stuCurrent * tuition;

    // 3. 教学质量与压力
    let style = document.getElementById('teach-style').value;
    let s_factor = 1, p_factor = 1;
    if(style === 'hard') { s_factor = 2; p_factor = 2.5; }
    if(style === 'easy') { s_factor = 0.5; p_factor = -0.5; }

    let roundStudy = 0, roundPress = 0;
    game.slots.forEach(slot => {
        if(slot) { roundStudy += slot.study; roundPress += slot.p; }
    });
    
    game.pressure = Math.max(0, game.pressure + (roundPress * p_factor));
    game.rep += Math.floor(roundStudy * s_factor / 100);

    // 4. 发工资
    game.teachers.forEach(t => { game.money -= t.wage; });

    // 5. 随机事件：自杀/媒体
    if(game.pressure > 90 && Math.random() < 0.3) {
        let hushMoney = 500000 / (game.mediaControl + 1);
        if(game.money >= hushMoney) {
            alert(`噩耗：一名学生跳楼了。你支付了 ¥${(hushMoney/10000).toFixed(1)}w 给媒体封口，政府还没发现。`);
            game.money -= hushMoney;
        } else {
            alert("一名学生自杀，消息走漏！政府调查，声望暴跌，罚款 100w！");
            game.rep -= 50; game.money -= 1000000;
        }
    }

    // 6. 政府拨款
    let grant = 100000 + (game.mediaControl * 50000);
    game.money += grant;
    
    // 7. 输赢判定
    if(game.money < -50000) { alert("你破产了！被踢出教育界。"); location.reload(); }
    if(game.rep <= 0) { alert("名誉扫地！学校被强行查封。"); location.reload(); }

    game.round++;
    refresh();
}

window.onload = refresh;
