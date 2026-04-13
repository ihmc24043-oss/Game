# Game
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>校长模拟器 - Principal Tycoon</title>
    <style>
        body { font-family: 'Microsoft YaHei', sans-serif; background: #f0f2f5; padding: 20px; }
        .dashboard { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .controls { display: flex; gap: 10px; margin-bottom: 20px; }
        button { padding: 10px 20px; cursor: pointer; border: none; border-radius: 5px; background: #3498db; color: white; transition: 0.3s; }
        button:hover { background: #2980b9; }
        button:disabled { background: #bdc3c7; }
        #log { background: #34495e; color: #ecf0f1; padding: 10px; height: 150px; overflow-y: auto; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🏫 校长模拟器</h1>
    
    <div class="dashboard">
        <div class="card"><h3>资金</h3><p id="money">¥1000</p></div>
        <div class="card"><h3>学生</h3><p id="studentCount">0 / 20</p></div>
        <div class="card"><h3>教师</h3><p id="teacherCount">0</p></div>
        <div class="card"><h3>升学率</h3><p id="promoRate">0%</p></div>
    </div>

    <div class="controls">
        <button onclick="buildClassroom()">建新教室 (¥500)</button>
        <button onclick="hireTeacher()">招聘老师 (¥300)</button>
    </div>

    <div id="log">
        <p>系统：欢迎来到你的新学校！请开始建设。</p>
    </div>

    <script src="script.js"></script>
</body>
</html>

// 游戏初始状态
let gameState = {
    money: 1000,
    students: 0,
    teachers: 0,
    classrooms: 1, // 初始1间教室
    capacityPerRoom: 20,
    teacherSalary: 50,
    studentTuition: 10,
    tickSpeed: 3000 // 每3秒为一个结算周期（学期）
};

// 更新UI
function updateUI() {
    document.getElementById('money').innerText = `¥${Math.floor(gameState.money)}`;
    document.getElementById('studentCount').innerText = `${gameState.students} / ${gameState.classrooms * gameState.capacityPerRoom}`;
    document.getElementById('teacherCount').innerText = gameState.teachers;
    
    // 升学率计算逻辑：老师越多，学生越少，升学率越高
    let rate = 0;
    if (gameState.students > 0) {
        rate = (gameState.teachers * 10 / gameState.students) * 100;
        rate = Math.min(Math.max(rate, 5), 98); // 升学率在5%到98%之间
    }
    document.getElementById('promoRate').innerText = `${rate.toFixed(1)}%`;
    return rate;
}

function addLog(msg) {
    const log = document.getElementById('log');
    const p = document.createElement('p');
    p.innerText = `[消息] ${msg}`;
    log.prepend(p);
}

// 建设教室
function buildClassroom() {
    if (gameState.money >= 500) {
        gameState.money -= 500;
        gameState.classrooms++;
        addLog("扩建成功！学校容纳人数增加了。");
        updateUI();
    } else {
        addLog("资金不足，无法建教室。");
    }
}

// 招聘老师
function hireTeacher() {
    if (gameState.money >= 300) {
        gameState.money -= 300;
        gameState.teachers++;
        addLog("新老师入职，教学质量提升了！");
        updateUI();
    } else {
        addLog("资金不足，请不起老师。");
    }
}

// 游戏主循环 (模拟时间流逝)
setInterval(() => {
    // 1. 学生入学逻辑
    let maxCapacity = gameState.classrooms * gameState.capacityPerRoom;
    if (gameState.students < maxCapacity) {
        let newStudents = Math.floor(Math.random() * 5) + 1;
        gameState.students = Math.min(gameState.students + newStudents, maxCapacity);
    }

    // 2. 财务结算
    let income = gameState.students * gameState.studentTuition; // 学费收入
    let expense = gameState.teachers * gameState.teacherSalary; // 老师工资支出
    
    // 3. 升学率奖金 (政府拨款)
    let rate = updateUI();
    let bonus = (rate / 100) * gameState.students * 20; 

    gameState.money += (income + bonus - expense);

    addLog(`学期结束：收入¥${income}，拨款¥${Math.floor(bonus)}，支出工资¥${expense}`);
    
    if (gameState.money < 0) {
        addLog("警报：学校财务赤字！");
    }
    
    updateUI();
}, gameState.tickSpeed);

updateUI();
