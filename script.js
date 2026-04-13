/**
 * 传奇校长：终极权力版引擎 (完全重写)
 */

// --- 数据库 ---
const ROOM_TYPES = {
    '核心教学': [
        { id: 'c1', name: "标准教室", cost: 60000, study: 25, cap: 0, p: 10 },
        { id: 'c2', name: "微机中心", cost: 200000, study: 90, cap: 0, p: 25 },
        { id: 'c3', name: "理化实验室", cost: 250000, study: 110, cap: 0, p: 30 },
        { id: 'c4', name: "艺术中心", cost: 180000, study: 30, cap: 0, p: -25 }
    ],
    '基础设施': [
        { id: 'i1', name: "学生宿舍", cost: 100000, study: 0, cap: 40, p: 5 },
        { id: 'i2', name: "心理咨询室", cost: 300000, study: 0, cap: 0, p: -60 },
        { id: 'i3', name: "教师公寓", cost: 200000, study: 10, cap: 0, p: -10 }
    ]
};

const TEACHER_STORE = [
    { name: "刚毕业大学生", wage: 3500, quality: 15 },
    { name: "资深老教师", wage: 8000, quality: 45 },
    { name: "竞赛教练", wage: 18000, quality: 95 },
    { name: "外教老师", wage: 15000, quality: 70 }
];

// --- 游戏状态 ---
let school = {
    money: 1000000, rep: 60, round: 1, pressure: 0,
    slots: Array(24).fill(null),
    teachers: [],
    happiness: 0, mediaLv: 0,
    govGrant: 150000
};

// --- UI 工具 ---
function pop(html) {
    const ov = document.createElement('div');
    ov.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2000;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement('div');
    box.style.cssText = "width:90%;max-height:80%;background:white;border-radius:20px;padding:20px;overflow-y:auto;position:relative;color:#333;";
    box.innerHTML = `<div onclick="this.parentElement.parentElement.remove()" style="position:absolute;right:15px;top:10px;font-size:24px;color:#ccc;">×</div>${html}`;
    ov.appendChild(box); document.body.appendChild(ov);
}

// --- 功能模块 ---

// 1. 建造与升级
function ui_build(idx) {
    let h = `<h3>新建设施</h3>`;
    for(let cat in ROOM_TYPES) {
        h += `<div style="margin:10px 0;font-weight:bold;color:var(--p-blue);">${cat}</div>`;
        ROOM_TYPES[cat].forEach(r => {
            h += `<div onclick="doBuild(${idx}, '${r.id}')" style="background:#f0f0f0;padding:12px;border-radius:10px;margin-bottom:8px;">
                <b>${r.name}</b> <span style="float:right;color:var(--p-red)">¥${r.cost}</span><br>
                <small>学力:+${r.study} | 压力:${r.p} | 容量:+${r.cap}</small>
            </div>`;
        });
    }
    pop(h);
}

function doBuild(idx, rid) {
    let all = [...ROOM_TYPES['核心教学'], ...ROOM_TYPES['基础设施']];
    let r = all.find(x => x.id === rid);
    if(school.money >= r.cost) {
        school.money -= r.cost;
        school.slots[idx] = { ...r, lv: 1 };
        document.querySelector('.ov')?.parentElement?.remove(); // 关闭弹窗
        updateUI();
    } else alert("经费不足！");
}

// 2. 招聘
function ui_recruit() {
    let h = `<h3>人才市场 (当前:${school.teachers.length}人)</h3>`;
    TEACHER_STORE.forEach(t => {
        h += `<div onclick="doHire('${t.name}', ${t.wage}, ${t.quality})" style="background:#f0f0f0;padding:15px;border-radius:10px;margin-bottom:10px;">
            <b>${t.name}</b> <span style="float:right;">月薪: ¥${t.wage}</span><br>
            <small>教学贡献: +${t.quality}</small>
        </div>`;
    });
    pop(h);
}

function doHire(n, w, q) {
    school.teachers.push({name:n, wage:w, q:q});
    updateUI();
}

// 3. 奢侈品
function ui_luxury() {
    pop(`<h3>校长私人奢享</h3>
        <div onclick="buyL(50000, 10)" style="padding:15px;background:#fffde7;border:1px solid #ffd54f;margin-bottom:10px;border-radius:10px;">🏆 纯金奖杯 - ¥5w (快乐+10)</div>
        <div onclick="buyL(500000, 100)" style="padding:15px;background:#fffde7;border:1px solid #ffd54f;margin-bottom:10px;border-radius:10px;">🚢 私人游艇 - ¥50w (快乐+100)</div>
    `);
}
function buyL(c, h) {
    if(school.money >= c) { school.money -= c; school.happiness += h; updateUI(); }
}

// 4. 升级系统 (研究)
function ui_research() {
    pop(`<h3>升级与公关</h3>
        <div onclick="upMed()" style="padding:15px;background:#f3e5f5;margin-bottom:10px;border-radius:10px;">📱 媒体控制等级: ${school.mediaLv} <br><small>花费 ¥20w。减少自杀负面影响，增加政府好感。</small></div>
    `);
}
function upMed() { if(school.money >= 200000) { school.money -= 200000; school.mediaLv++; updateUI(); } }

// --- 核心刷新 ---
function updateUI() {
    let cap = 0;
    school.slots.forEach(s => { if(s) cap += s.cap; });

    document.getElementById('money').innerText = `¥${(school.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(school.pressure)}%`;
    document.getElementById('rep').innerText = school.rep;
    document.getElementById('stu-info').innerText = `${cap > 0 ? cap : 0}/${cap}`;
    document.getElementById('tea-info').innerText = school.teachers.length;
    document.getElementById('happiness').innerText = school.happiness;

    // 渲染地图
    const g = document.getElementById('grid'); g.innerHTML = '';
    school.slots.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = `slot ${s ? 'built' : ''}`;
        d.innerHTML = s ? `<div class="lv-badge">Lv.${s.lv}</div><div class="slot-name">${s.name}</div>` : `<span style="color:#aaa;font-size:20px">+</span>`;
        d.onclick = () => s ? alert("此地块已占用") : ui_build(i);
        g.appendChild(d);
    });

    // 警告效果
    document.getElementById('main-area').className = `main-content ${school.pressure > 80 ? 'stress-high' : ''}`;
}

// --- 结算逻辑 ---
function runSemester() {
    // 1. 开学校验
    let classrooms = school.slots.filter(s => s && s.id.startsWith('c')).length;
    if(classrooms < 6 || school.teachers.length < 6) {
        alert("🚨 无法开学！政府规定：至少需要 6 间教室和 6 名老师！目前你只有 " + classrooms + " 间教室和 " + school.teachers.length + " 名老师。");
        return;
    }

    // 2. 财务：学费收入
    let tuition = parseInt(document.getElementById('tuition').value);
    let cap = 0; school.slots.forEach(s => { if(s) cap += s.cap; });
    
    if(tuition > 15000) {
        if(Math.random() < 0.5) {
            alert("💢 学费过高(¥" + tuition + ")！家长向教育局举报了你。罚款 ¥30w，声望 -20！");
            school.money -= 300000; school.rep -= 20;
        }
    }
    school.money += cap * tuition;

    // 3. 产出计算
    let style = document.getElementById('teach-style').value;
    let s_mul = 1, p_mul = 1;
    if(style === 'hard') { s_mul = 2.2; p_mul = 3.0; }
    if(style === 'easy') { s_mul = 0.4; p_mul = -1.0; }

    let roundStudy = 0, roundPress = 0;
    school.slots.forEach(s => { if(s) { roundStudy += s.study; roundPress += s.p; } });
    school.teachers.forEach(t => { roundStudy += t.q; school.money -= t.wage; });

    school.pressure = Math.max(0, school.pressure + (roundPress * p_mul));
    school.rep += Math.floor(roundStudy * s_mul / 150);

    // 4. 随机事件：自杀
    if(school.pressure > 95 && Math.random() < 0.4) {
        let hush = 800000 / (school.mediaLv + 1);
        if(school.money >= hush) {
            alert("💀 惨剧！一名学生因压力过大自杀。你支付了 ¥" + (hush/10000).toFixed(1) + "w 封口费，媒体没有报道。");
            school.money -= hush;
        } else {
            alert("💀 惨剧发生！由于你没钱封口，消息引爆全网！政府介入，名望暴跌 80，罚款 100w！");
            school.rep -= 80; school.money -= 1000000;
        }
    }

    // 5. 政府拨款
    school.money += school.govGrant + (school.mediaLv * 100000);

    // 6. 破产判定
    if(school.money < -100000) { alert("你破产了，校长。"); location.reload(); }
    if(school.rep <= 0) { alert("你被撤职了，名望已清零。"); location.reload(); }

    school.round++;
    updateUI();
    alert("第 " + (school.round-1) + " 学期结算完成！\n资金余额: ¥" + (school.money/10000).toFixed(1) + "w");
}

window.onload = updateUI;
