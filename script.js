/**
 * 修复逻辑：增加报错提示 + 物理清理白条
 */

const ROOMS = [
    { id: 'c1', name: "标准教室", cost: 60000, study: 20, cap: 40, p: 10 },
    { id: 'c2', name: "微机中心", cost: 200000, study: 80, cap: 20, p: 25 },
    { id: 'i1', name: "心理诊所", cost: 300000, study: 0, cap: 0, p: -80 },
    { id: 'l1', name: "奢华游艇", cost: 800000, study: 0, cap: 0, p: 0, luxury: true }
];

let state = { money: 1000000, rep: 60, pressure: 0, hap: 0, slots: Array(24).fill(null), teachers: [] };

// --- 弹窗逻辑 (彻底解决白条) ---
function openModal(html) {
    const m = document.getElementById('modal-overlay');
    const b = document.getElementById('modal-body');
    b.innerHTML = html + `<button onclick="closeModal()" style="width:100%;margin-top:15px;padding:10px;border:none;background:#eee;border-radius:10px;">返回</button>`;
    m.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-body').innerHTML = ''; // 物理清理，防止白条
}

// --- 建造 ---
function showBuild(idx) {
    let h = `<h3>建造设施 (地块 ${idx+1})</h3>`;
    ROOMS.forEach(r => {
        h += `<div onclick="doBuild(${idx}, '${r.id}')" style="background:#f9f9f9;padding:12px;border-radius:10px;margin-top:10px;border:1px solid #ddd;">
                <b>${r.name}</b> <span style="color:red;float:right;">¥${r.cost}</span>
              </div>`;
    });
    openModal(h);
}

function doBuild(idx, rid) {
    let r = ROOMS.find(x => x.id === rid);
    if(state.money >= r.cost) {
        state.money -= r.cost;
        if(r.luxury) state.hap += 100;
        state.slots[idx] = { ...r, lv: 1 };
        closeModal();
        render();
    } else alert("资金不足！");
}

// --- 招聘 ---
function showHire() {
    let h = `<h3>人才招聘</h3>
        <div onclick="doHire(5000)" style="padding:15px;background:#f0f7ff;margin-top:10px;border-radius:10px;">招聘资深教师 (月薪¥5000)</div>
        <div onclick="doHire(2000)" style="padding:15px;background:#f0f7ff;margin-top:10px;border-radius:10px;">招聘支教大学生 (月薪¥2000)</div>`;
    openModal(h);
}
function doHire(w) { state.teachers.push(w); closeModal(); render(); }

// --- 核心渲染 ---
function render() {
    let cap = 0; state.slots.forEach(s => { if(s) cap += s.cap; });
    document.getElementById('money').innerText = `¥${(state.money/10000).toFixed(1)}w`;
    document.getElementById('pressure').innerText = `${Math.floor(state.pressure)}%`;
    document.getElementById('rep').innerText = state.rep;
    document.getElementById('stu').innerText = `${cap}/${cap}`;
    document.getElementById('tea').innerText = state.teachers.length;
    document.getElementById('hap').innerText = state.hap;

    const g = document.getElementById('grid'); g.innerHTML = '';
    state.slots.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = `slot ${s ? 'built' : ''}`;
        d.innerHTML = s ? `<div class="lv-tag">Lv.${s.lv}</div><div class="slot-name">${s.name}</div>` : '+';
        d.onclick = () => s ? alert("地块已占用") : showBuild(i);
        g.appendChild(d);
    });
}

// --- 结算 (带报错提示) ---
function startRound() {
    let classrooms = state.slots.filter(s => s && s.cap > 0).length;
    let errors = [];
    
    // 检查硬性条件
    if(classrooms < 6) errors.push("教室不足 (当前 " + classrooms + "/6)");
    if(state.teachers.length < 6) errors.push("教师不足 (当前 " + state.teachers.length + "/6)");
    
    if(errors.length > 0) {
        // 如果点不进去，现在会告诉你为什么！
        alert("🚨 无法开学！\n------------------\n" + errors.join("\n") + "\n------------------\n请继续建设和招聘。");
        return;
    }

    // 逻辑结算
    let fee = parseInt(document.getElementById('fee').value);
    let cap = 0; state.slots.forEach(s => { if(s) cap += s.cap; });
    state.money += cap * fee; // 收入
    state.teachers.forEach(w => state.money -= w); // 支出工资
    
    // 压力计算
    let p_add = 0; state.slots.forEach(s => { if(s) p_add += s.p; });
    if(document.getElementById('mode').value === 'hard') p_add *= 2;
    state.pressure = Math.max(0, state.pressure + p_add);
    
    alert("学期结算完成！资金流入：¥" + (cap * fee / 10000).toFixed(1) + "w");
    render();
}

window.onload = render;
