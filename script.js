// --- 游戏核心状态 ---
let state = {
    money: 1000000, // 初始 100 万
    pressure: 0,
    reputation: 60,
    students: 20,
    capacity: 20, // 初始容量
    round: 1,
    mode: 2, // 1:快乐, 2:标准, 3:魔鬼
    fee: 5000,
    slots: Array(24).fill(null), // 24个地块
    teachers: [],
    skills: [],
    luxuries: [],
    isGameOver: false
};

// --- 配置数据 ---
    // 1. 扩充后的教室定义
const ROOM_DEFS = {
    // --- 核心学科 ---
    std_class: { name: "标准教室", cost: 30000, study: 10, pressure: 5, size: 1 },
    lang_lab: { name: "语言实验室", cost: 60000, study: 18, pressure: 3, size: 1 },
    human_room: { name: "人文教室", cost: 45000, study: 12, pressure: 2, size: 1 },
    math_sem: { name: "数学研讨室", cost: 55000, study: 20, pressure: 8, size: 1 },

    // --- 科学技术 ---
    phy_lab: { name: "物理实验室", cost: 85000, study: 25, pressure: 10, size: 1 },
    chem_lab: { name: "化学实验室", cost: 90000, study: 28, pressure: 12, size: 1 },
    bio_lab: { name: "生物实验室", cost: 80000, study: 22, pressure: 8, size: 1 },
    comp_lab: { name: "计算机房", cost: 120000, study: 35, pressure: 5, size: 1 },
    maker_space: { name: "创客空间", cost: 150000, study: 40, pressure: -5, size: 1 },

    // --- 艺术表演 ---
    art_studio: { name: "美术工作室", cost: 70000, study: 15, pressure: -8, size: 1 },
    pottery_room: { name: "陶艺教室", cost: 75000, study: 12, pressure: -12, size: 1 },
    music_room: { name: "音乐教室", cost: 85000, study: 18, pressure: -15, size: 1 },
    dance_studio: { name: "舞蹈教室", cost: 100000, study: 20, pressure: -10, size: 1 },

    // --- 职业与实践 ---
    culinary_lab: { name: "烹饪实验室", cost: 95000, study: 15, pressure: -18, size: 1 },
    fashion_studio: { name: "服装设计室", cost: 88000, study: 18, pressure: -5, size: 1 },

    // --- 辅助与健康 ---
    library: { name: "图书馆(大)", cost: 250000, study: 30, pressure: -10, size: 2 }, // 占用2格
    clinic: { name: "心理辅导室", cost: 120000, study: 0, pressure: -30, size: 1 },
    career_off: { name: "职业规划室", cost: 80000, study: 10, reputation: 15, size: 1 },
    study_hall: { name: "自习室", cost: 40000, study: 15, pressure: 10, size: 1 },

    // --- 大型空间 ---
    gym: { name: "室内体育馆", cost: 400000, study: 10, pressure: -25, size: 2 }, // 占用2格
    auditorium: { name: "大礼堂", cost: 500000, study: 5, reputation: 50, size: 2 }, // 占用2格
    
    
};

// 2. 修改后的建造函数 (处理双格占用)
function openBuildModal(index) {
    if (state.slots[index]) {
        upgradeRoom(index); // 如果有东西，就触发升级
        return;
    }

    const content = document.getElementById('modal-content');
    content.innerHTML = '';

    for (let key in ROOM_DEFS) {
        const r = ROOM_DEFS[key];
        const canBuildLarge = (r.size === 2 && (index % 4 !== 3) && !state.slots[index + 1]);
        
        // 如果是大型建筑但右侧没位置，则禁用
        const isDisable = (r.size === 2 && !canBuildLarge);

        content.innerHTML += `
            <button onclick="buildRoom(${index}, '${key}')" 
                ${isDisable ? 'disabled style="opacity:0.4"' : ''} 
                style="padding:15px; border:1px solid #ddd; border-radius:10px; background:#fff; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <b style="font-size:14px;">${r.name} ${r.size === 2 ? '(大)' : ''}</b><br>
                    <span style="font-size:11px; color:#666;">效果: 学术+${r.study || 0} 压力${r.pressure || 0}</span>
                </div>
                <b style="color:#e67e22;">¥${r.cost.toLocaleString()}</b>
            </button>`;
    }
    document.getElementById('modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function buildRoom(index, type) {
    const room = ROOM_DEFS[type];
    if (state.money >= room.cost) {
        // 扣钱
        state.money -= room.cost;
        
        // 基础属性
        const newRoom = { ...room, type, lv: 1 };
        
        // 处理占用
        state.slots[index] = newRoom;
        if (room.size === 2) {
            state.slots[index + 1] = { name: "占用 (附属于" + room.name + ")", isPart: true, parentIndex: index };
        }

        addLog(`[建设] ${room.name} 竣工，投入使用！`);
        closeModal();
        renderCampus();
        updateUI();
    } else {
        alert("校长，预算不足！");
    }
}

// 3. 升级系统：更新硬件 (Update)
function upgradeRoom(index) {
    let s = state.slots[index];
    // 如果点到的是大建筑的附属格，跳转到主格
    if (s.isPart) {
        index = s.parentIndex;
        s = state.slots[index];
    }

    const upCost = Math.floor(s.cost * 1.5 * s.lv);
    if (confirm(`升级 ${s.name} 到 Lv.${s.lv + 1}?\n消耗: ¥${upCost.toLocaleString()}\n效果: 效率提升 30%`)) {
        if (state.money >= upCost) {
            state.money -= upCost;
            s.lv++;
            // 属性提升逻辑
            s.study = Math.floor(s.study * 1.3);
            if(s.pressure < 0) s.pressure = Math.floor(s.pressure * 1.2); // 减压效果更强
            
            addLog(`[升级] ${s.name} 已更新到最新配置 (Lv.${s.lv})`);
            renderCampus();
            updateUI();
        } else {
            alert("钱不够升级！");
        }
    }
}

    
};

const TOUR_DEFS = [
    { id: 0, name: "硅谷科技名企考察", cost: 250000, study: 100, rep: 30 },
    { id: 1, name: "欧洲艺术殿堂游学", cost: 180000, study: 50, rep: 60 },
    { id: 2, name: "国内乡村支教小组", cost: 50000, study: 20, rep: 100 }
];

// --- 初始化系统 ---
function init() {
    renderCampus();
    refreshMarket();
    renderResearch();
    renderTours();
    renderLuxury();
    updateUI();
    
    // 学费滑动条
    const range = document.getElementById('fee-range');
    if(range) {
        range.oninput = function() {
            state.fee = parseInt(this.value);
            document.getElementById('fee-val').innerText = `¥${state.fee.toLocaleString()}/期`;
        };
    }
}

// 渲染24个地块
function renderCampus() {
    const grid = document.getElementById('campus-grid');
    if(!grid) return;
    grid.innerHTML = '';
    state.slots.forEach((slot, i) => {
        const div = document.createElement('div');
        div.className = 'slot' + (slot ? ' built' : '');
        if (slot) {
            div.innerHTML = `<b>${slot.name}</b><br><span class="lv-tag">Lv.${slot.lv}</span>`;
        } else {
            div.innerHTML = '空地<br>点击建造';
        }
        div.onclick = () => openBuildModal(i);
        grid.appendChild(div);
    });
}

// 建造逻辑
function openBuildModal(index) {
    if (state.slots[index]) {
        upgradeRoom(index);
        return;
    }
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');
    content.innerHTML = '';
    
    for (let key in ROOM_DEFS) {
        const r = ROOM_DEFS[key];
        content.innerHTML += `
            <button onclick="buildRoom(${index}, '${key}')" style="padding:12px; border:1px solid #ddd; border-radius:10px; background:#fff; text-align:left;">
                <div style="font-weight:bold;">${r.name}</div>
                <div style="font-size:10px; color:#e67e22;">¥${r.cost.toLocaleString()}</div>
                <div style="font-size:9px; color:#666;">${r.desc}</div>
            </button>`;
    }
    modal.style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function buildRoom(index, type) {
    const room = ROOM_DEFS[type];
    if (state.money >= room.cost) {
        state.money -= room.cost;
        state.slots[index] = { ...room, type, lv: 1 };
        if (type === 'dorm') state.capacity += 50;
        addLog(`[建设] 成功建造了 ${room.name}，花费 ¥${room.cost.toLocaleString()}`);
        closeModal();
        renderCampus();
        updateUI();
    } else {
        alert("校长，咱们账上钱不够了！这间教室要 ¥" + room.cost.toLocaleString());
    }
}

function upgradeRoom(index) {
    const s = state.slots[index];
    const upCost = Math.floor(s.cost * 1.8 * s.lv);
    if (confirm(`升级 ${s.name} 到 Lv.${s.lv + 1} 需要 ¥${upCost.toLocaleString()}。升级后教学效果提升 40%，确定吗？`)) {
        if (state.money >= upCost) {
            state.money -= upCost;
            s.lv++;
            s.study = (s.study || 0) * 1.4;
            addLog(`[升级] ${s.name} 提升至等级 ${s.lv}`);
            renderCampus();
            updateUI();
        }
    }
}

// 教师系统
function refreshMarket() {
    const row = document.getElementById('teacher-market');
    if(!row) return;
    row.innerHTML = '';
    const teacherTypes = [
        { n: "奥数金牌教练", s: "理科" }, { n: "外籍口语专家", s: "文科" },
        { n: "退休老教授", s: "理科" }, { n: "艺术团总监", s: "艺术" }
    ];
    
    for (let i = 0; i < 4; i++) {
        let type = teacherTypes[Math.floor(Math.random() * teacherTypes.length)];
        let salary = 3000 + Math.floor(Math.random() * 2000); // 3000-5000
        let power = Math.floor(salary / 80);
        row.innerHTML += `
            <div class="card">
                <h4>${type.n}</h4>
                <p>擅长: ${type.s}</p>
                <p>月薪: <b style="color:#e74c3c">¥${salary}</b></p>
                <p>能力值: +${power}</p>
                <button onclick="hireTeacher('${type.n}', ${salary}, ${power})">签约</button>
            </div>`;
    }
}

function hireTeacher(n, s, p) {
    state.teachers.push({ name: n, salary: s, power: p });
    addLog(`[人事] 成功签约 ${n}，月薪 ¥${s.toLocaleString()}`);
    updateUI();
}

// --- 结算系统 (回合/学期) ---
function nextRound() {
    // 门槛检查：6个房间 + 6个老师
    const builtCount = state.slots.filter(s => s !== null).length;
    if (builtCount < 6 || state.teachers.length < 6) {
        alert("【无法开学】教育部规定：至少需要 6 间教室和 6 名老师才能开启学期！目前你只有 " + builtCount + " 间教室和 " + state.teachers.length + " 名老师。");
        return;
    }

    addLog(`--- 第 ${state.round} 学期结算报告 ---`);

    // 1. 教学力与压力核心逻辑
    let baseStudy = state.teachers.reduce((sum, t) => sum + t.power, 0);
    let roomStudy = state.slots.reduce((sum, s) => sum + (s ? (s.study || 0) : 0), 0);
    let roomPressure = state.slots.reduce((sum, s) => sum + (s ? (s.pressure || 0) : 0), 0);

    // 教学模式倍率
    let modeStudyMult = [0.4, 1, 2.8][state.mode - 1]; 
    let modePressMult = [0.1, 1, 4.0][state.mode - 1]; 

    let totalStudy = (baseStudy + roomStudy) * modeStudyMult;
    let totalPressure = (roomPressure + (totalStudy / 3)) * modePressMult;

    state.pressure = Math.max(0, Math.min(100, state.pressure + totalPressure));
    
    // 2. 财务结算
    let tuitionIncome = state.students * state.fee;
    let salaryExpense = state.teachers.reduce((sum, t) => sum + t.salary, 0);
    
    // 政府拨款 (一次性发放)
    let govGrant = state.reputation * 600; 
    if(state.skills.includes('media')) govGrant *= 1.8;

    state.money += (tuitionIncome + govGrant - salaryExpense);
    state.reputation += (totalStudy / 60);

    addLog(`💰 收入：学费 ¥${tuitionIncome.toLocaleString()} + 拨款 ¥${govGrant.toLocaleString()}`);
    addLog(`💸 支出：薪资 ¥${salaryExpense.toLocaleString()}`);

    // 3. 负面事件判定
    // A. 压力过高导致的自杀
function handleTragedy() {
    // 如果学了“媒体控制”或使用金钱封口
    let bribe = state.skills.includes('shield') ? 50000 : 200000;
    
    if (confirm(`发生意外！支付 ¥${bribe} 封口吗？`)) {
        state.money -= bribe;
        addLog("🤐 媒体已搞定，消息没有传出去。");
    } else {
        state.reputation -= 50; // 不给钱声望就暴跌
    }
}

    if (state.pressure > 85 && Math.random() > 0.5) {
        handleTragedy();
    }

    // B. 高收费/低声望引发的政府检查
    if (state.fee > 60000 || state.reputation < 20) {
        if (Math.random() > 0.6) handleGovCheck();
    }

    // 4. 毕业生与招生
    if (state.round % 4 === 0 && state.students > 0) {
        let grads = Math.max(5, Math.floor(state.students * 0.7));
        let donation = grads * (totalStudy * 15);
        state.money += donation;
        state.students -= grads;
        addLog(`🎓 毕业礼：${grads} 名学生离开，带回校友捐赠 ¥${donation.toLocaleString()}`);
    }
    
    // 新生入学 (受声望影响)
    let newComing = Math.floor(state.reputation / 3);
    state.students = Math.min(state.capacity, state.students + newComing);

    state.round++;
    updateUI();

    // 失败判定
    if (state.money < -50000) {
        alert("【游戏结束】由于严重亏损，政府强行接管了你的学校！");
        location.reload();
    }
}

// 突发：悲剧事件
function handleTragedy() {
    let bribe = state.skills.includes('shield') ? 80000 : 300000;
    if (confirm(`🚨 警告：一名学生压力过大选择跳楼！\n\n是否花费 ¥${bribe.toLocaleString()} 雇佣公关公司封锁消息？如果不封锁，声望将毁灭。`)) {
        if(state.money >= bribe) {
            state.money -= bribe;
            addLog("🤐 已压下新闻，但你晚上睡觉总能听到哭声...");
        } else {
            alert("你没钱封口！新闻爆掉了！");
            state.reputation -= 60;
        }
    } else {
        state.reputation -= 70;
        addLog("📢 媒体头条曝光！你的学校被指控为“地狱工厂”，声望暴跌。");
    }
}

// 家长索要赞助费逻辑
function askParents() {
    let amt = prompt("请输入向每位家长收取的额外赞助费(0 - 100,000)：", "20000");
    if (!amt) return;
    amt = parseInt(amt);

    if (amt > 100000) {
        alert("家长们怒了！这分明是抢劫！他们直接写信给了教育局。");
        state.reputation -= 40;
        handleGovCheck();
    } else {
        let successRate = state.skills.includes('speech') ? 0.75 : 0.4;
        if (Math.random() < successRate) {
            let total = amt * state.students;
            state.money += total;
            addLog(`💰 筹款成功！从家长兜里掏出了 ¥${total.toLocaleString()}`);
        } else {
            addLog("❌ 筹款失败。家长们表示生活艰难，拒绝了你的提议。");
            state.reputation -= 15;
        }
    }
    updateUI();
}

function handleGovCheck() {
    addLog("🚨 警告：政府调查小组进驻校园！");
    if (state.pressure > 75 || state.fee > 50000) {
        let fine = 200000;
        state.money -= fine;
        state.reputation -= 20;
        alert("检查未通过！你因“违规办学”被罚款 ¥" + fine.toLocaleString());
    } else {
        addLog("✅ 检查通过，你的学校表现尚算合规。");
    }
}

// --- 基础渲染函数 ---
function updateUI() {
    document.getElementById('money').innerText = `¥${state.money.toLocaleString()}`;
    document.getElementById('pressure').innerText = `${Math.floor(state.pressure)}%`;
    document.getElementById('reputation').innerText = Math.floor(state.reputation);
    document.getElementById('students').innerText = `${state.students}/${state.capacity}`;
    document.getElementById('round').innerText = state.round;
    
    // 视觉反馈
    if(state.pressure > 80) document.getElementById('pressure').style.color = '#e74c3c';
    else document.getElementById('pressure').style.color = '#f1c40f';
}

function addLog(msg) {
    const l = document.getElementById('log');
    if(!l) return;
    l.innerHTML = `> ${msg}<br>${l.innerHTML}`;
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function setMode(m) {
    state.mode = m;
    document.querySelectorAll('.btn-mode').forEach((b, i) => {
        b.className = (i + 1 === m) ? 'btn-mode active' : 'btn-mode';
    });
}

// 渲染其它面板
function renderResearch() {
    const row = document.getElementById('research-panel');
    const skills = [
        { id: 'speech', n: "演讲家", c: 100000, d: "大幅提高筹款成功率" },
        { id: 'shield', n: "黑脸", c: 150000, d: "大幅降低封口费金额" },
        { id: 'media', n: "公关大亨", c: 200000, d: "政府拨款翻倍" }
    ];
    row.innerHTML = '';
    skills.forEach(s => {
        const owned = state.skills.includes(s.id);
        row.innerHTML += `
            <div class="card" style="border-top:3px solid #9b59b6">
                <h4>${s.n}</h4>
                <p style="font-size:10px">${s.d}</p>
                <button onclick="buySkill('${s.id}', ${s.c})" ${owned?'disabled':''}>${owned?'已掌握':'¥'+s.c/1000+'k 学习'}</button>
            </div>`;
    });
}

function buySkill(id, cost) {
    if(state.money >= cost) {
        state.money -= cost;
        state.skills.push(id);
        addLog(`[技能] 校长学会了 ${id}`);
        renderResearch();
        updateUI();
    }
}

function renderTours() {
    const row = document.getElementById('tour-panel');
    row.innerHTML = '';
    TOUR_DEFS.forEach(t => {
        row.innerHTML += `
            <div class="card" style="border-top:3px solid #f39c12">
                <h4>${t.name}</h4>
                <p>学费: ¥${t.cost.toLocaleString()}</p>
                <button onclick="doTour(${t.id})">立即启程</button>
            </div>`;
    });
}

function doTour(id) {
    const t = TOUR_DEFS[id];
    if(state.money >= t.cost) {
        state.money -= t.cost;
        state.reputation += t.rep;
        state.pressure = Math.max(0, state.pressure - 20);
        addLog(`[研学] 参加了 ${t.name}，声望大幅提升！`);
        updateUI();
    }
}

function renderLuxury() {
    const row = document.getElementById('luxury-panel');
    const lux = [ { n: "纯金校训石", c: 400000 }, { n: "校长专属游艇", c: 1000000 } ];
    row.innerHTML = '';
    lux.forEach(l => {
        row.innerHTML += `
            <div class="card">
                <h4>${l.n}</h4>
                <button onclick="buyLux('${l.n}', ${l.cost})" style="background:#27ae60">¥${l.cost/1000}k 购买</button>
            </div>`;
    });
}

function buyLux(n, cost) {
    if(state.money >= cost) {
        state.money -= cost;
        state.luxuries.push(n);
        alert("校长，你购买了 " + n + "！虽然对教学没帮助，但你感到无比的快乐。");
        updateUI();
    }
}

function doPR() {
    if(state.money >= 50000) {
        state.money -= 50000;
        state.reputation += 15;
        addLog("[公关] 投放了一波软文，名声好转了。");
        updateUI();
    }
}
// 政府根据声望给钱
let govGrant = state.reputation * 500; 
if (state.skills.includes('media')) govGrant *= 2; // 如果有媒体技能，钱更多
state.money += govGrant;

// 追加减压操作函数
window.takeHoliday = function() {
    const cost = 20000 + (state.students * 100);
    if (state.money >= cost) {
        state.money -= cost;
        state.pressure = Math.max(0, state.pressure - 30); // 立即减30%压力
        state.reputation += 5; // 学生和家长很开心
        addLog("🏝️ 校长宣布全校放假一天！学生压力大幅减退。");
        updateUI();
    } else {
        alert("经费不足，没法给老师发加班工资和补贴。");
    }
};

// 媒体公关减压（修复版）
window.doPR = function() {
    if (state.money >= 50000) {
        state.money -= 50000;
        state.reputation += 15;
        state.pressure = Math.max(0, state.pressure - 10); // 媒体正面报道也能减压
        addLog("📢 媒体公关成功：通过美化宣传，缓解了校内焦虑。");
        updateUI();
    }
};

/* --- 模式系统：全自动恢复与重做补丁 --- */

(function rebootModeSystem() {
    // 1. 强行在页面底部注入 HTML 结构 (防止你删掉了相关的 div)
    const injectHTML = () => {
        // 如果页面没有控制栏，直接在 body 最后加一个
        let controls = document.querySelector('.controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.className = 'controls';
            document.body.appendChild(controls);
        }

        // 强行清理并重做模式按钮组
        let modeToggles = document.querySelector('.mode-toggles');
        if (!modeToggles) {
            modeToggles = document.createElement('div');
            modeToggles.className = 'mode-toggles';
            // 插入到“结束本学期”按钮之前
            const nextBtn = controls.querySelector('.btn-next');
            if (nextBtn) controls.insertBefore(modeToggles, nextBtn);
            else controls.appendChild(modeToggles);
        }

        // 写入按钮内容
        modeToggles.innerHTML = `
            <button class="btn-mode ${state.mode === 1 ? 'active' : ''}" onclick="setMode(1)">佛系教育</button>
            <button class="btn-mode ${state.mode === 2 ? 'active' : ''}" onclick="setMode(2)">标准模式</button>
            <button class="btn-mode ${state.mode === 3 ? 'active' : ''}" onclick="setMode(3)">应试魔鬼</button>
        `;
    };

    // 2. 重新定义 setMode 逻辑 (重点：佛系减压)
    window.setMode = function(m) {
        state.mode = m;
        // 刷新 UI 样式
        document.querySelectorAll('.btn-mode').forEach((btn, i) => {
            btn.classList.toggle('active', (i + 1) === m);
        });

        const msgs = [
            "🍃 已切换为【佛系模式】：压力将每回合大幅自动减少！",
            "📊 已切换为【标准模式】：稳健发展。",
            "🔥 已切换为【应试模式】：教学质量暴涨，但压力也会狂飙！"
        ];
        addLog(msgs[m-1]);
    };

    // 3. 拦截并重做结算逻辑 (让佛系模式真正减压)
    const originalNextRound = nextRound;
    window.nextRound = function() {
        // --- 结算前修正 ---
        if (state.mode === 1) {
            // 佛系模式：降低一点基础压力增长
            addLog("🧘 佛系光环生效中...");
        }

        // 执行原有结算逻辑
        originalNextRound();

        // --- 结算后修正 (强制减压) ---
        if (state.mode === 1) {
            // 佛系模式：每回合额外减 20% 压力，且压力上限锁定在低位
            state.pressure = Math.max(0, state.pressure - 25);
            addLog("✨ 佛系效果：学生们在冥想和玩耍中释放了大量压力。");
        } else if (state.mode === 3) {
            // 应试模式：额外增加 15% 压力
            state.pressure = Math.min(100, state.pressure + 15);
            addLog("💢 应试压力：繁重的课业让学生喘不过气！");
        }

        updateUI(); // 确保数值立即刷新
    };

    // 执行注入
    setTimeout(injectHTML, 500);
})();

/* --- 强制 CSS 修复 (确保按钮看得见) --- */
const styleFix = document.createElement('style');
styleFix.innerHTML = `
    .mode-toggles { 
        display: flex !important; 
        justify-content: center !important; 
        gap: 8px !important; 
        margin-bottom: 10px !important; 
        width: 100%;
    }
    .btn-mode {
        background: white !important;
        border: 1px solid #ccc !important;
        padding: 8px 15px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        color: #333 !important;
        cursor: pointer !important;
    }
    .btn-mode.active {
        background: #3498db !important;
        color: white !important;
        border-color: #3498db !important;
        font-weight: bold !important;
    }
`;
document.head.appendChild(styleFix);


// 启动游戏
window.onload = init;
