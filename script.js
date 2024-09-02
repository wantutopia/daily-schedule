const canvas = document.getElementById('timeChart');
const ctx = canvas.getContext('2d');
const radius = canvas.height / 2 - 40; // 모서리 잘림 방지용으로 -40 적용
ctx.translate(radius + 40, radius + 40);
const localStorageKey = 'timeTableData';

let tasks = JSON.parse(localStorage.getItem(localStorageKey)) || [];

function addTask() {
    const startTime = parseTime(document.getElementById('startHour').value, document.getElementById('startMinute').value);
    const endTime = parseTime(document.getElementById('endHour').value, document.getElementById('endMinute').value);
    const task = document.getElementById('task').value;

    if (startTime >= 0 && startTime < 24 && endTime > startTime && endTime <= 24 && task) {
        const newTask = { startTime, endTime, task, color: getRandomColor() };
        tasks.push(newTask);
        tasks.sort((a, b) => a.startTime - b.startTime);
        localStorage.setItem(localStorageKey, JSON.stringify(tasks));
        drawClock();
        updateTaskTable();
    } else {
        alert('시간 입력을 확인해 주세요.');
    }
}

function parseTime(hour, minute) {
    return parseInt(hour) + parseInt(minute) / 60;
}

function formatTime(time) {
    const hour = Math.floor(time);
    const minute = Math.round((time % 1) * 60);
    return `${hour}:${minute < 10 ? '0' + minute : minute}`;
}

function drawClock(context = ctx, width = canvas.width, height = canvas.height) {
    const radius = width / 2 - 40;
    context.clearRect(-radius - 40, -radius - 40, width, height);
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.strokeStyle = '#333';
    context.lineWidth = 1;
    context.stroke();

    drawClockLabels(context, width, height);
    drawTimeSections(context);
}

function drawClockLabels(context, width, height) {
    const radius = width / 2 - 40;
    const labels = ['0', '6', '12', '18'];
    const positions = [
        { x: 0, y: -radius - 50 },  // 0시 (위쪽 바깥)
        { x: radius + 50, y: 0 },    // 6시 (오른쪽 바깥)
        { x: 0, y: radius + 50 },    // 12시 (아래쪽 바깥)
        { x: -radius - 50, y: 0 }    // 18시 (왼쪽 바깥)
    ];

    context.fillStyle = 'black';
    context.font = 'bold 20px Pretendard'; 
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    labels.forEach((label, index) => {
        if (!(label === '0' && tasks.some(task => task.startTime === 24))) {
            context.fillText(label, positions[index].x, positions[index].y);
        }
    });
}

function drawTimeSections(context) {
    const radius = canvas.width / 2 - 40;
    const colorMap = {};

    tasks.forEach((task) => {
        const startAngle = (task.startTime / 12) * Math.PI - Math.PI / 2;
        const endAngle = (task.endTime / 12) * Math.PI - Math.PI / 2;
        const overlap = checkOverlap(colorMap, startAngle, endAngle);

        context.globalAlpha = overlap ? 0.6 : 1.0;

        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, radius, startAngle, endAngle);
        context.closePath();
        context.fillStyle = task.color || getRandomColor();
        context.fill();
        context.strokeStyle = '#333';
        context.stroke();

        for (let angle = startAngle; angle < endAngle; angle += 0.01) {
            colorMap[angle.toFixed(2)] = true;
        }

        context.globalAlpha = 1.0;

        context.save();
        const middleAngle = (startAngle + endAngle) / 2;
        context.rotate(middleAngle);
        context.translate(radius * 0.7, 0);
        context.rotate(-middleAngle);
        context.fillStyle = 'black';
        context.font = "16px Pretendard";
        context.textAlign = 'center';
        const taskWithEmoji = addEmojiToTask(task.task);
        context.fillText(taskWithEmoji, 0, 0);
        context.restore();

        drawTimeLabels(context, startAngle, task.startTime);
        drawTimeLabels(context, endAngle, task.endTime);
    });
}

function drawTimeLabels(context, angle, time) {
    const radius = canvas.width / 2 - 40;
    const formattedTime = formatTime(time);

    if (time === 24 && tasks.some(task => task.startTime === 0)) return;
    context.save();
    context.rotate(angle);
    context.translate(radius + 20, 0);
    context.rotate(-angle);
    context.fillStyle = 'black';
    context.font = "14px Pretendard";
    context.textAlign = 'center';
    context.fillText(formattedTime, 0, 0);
    context.restore();
}

function updateTaskTable() {
    const tbody = document.querySelector('#taskTable tbody');
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatTime(task.startTime)}</td>
            <td>${formatTime(task.endTime)}</td>
            <td>${task.task}</td>
            <td><button onclick="editTask(${index})">수정</button></td>
            <td><button onclick="deleteTask(${index})">삭제</button></td>
        `;
        tbody.appendChild(row);
    });
}

function checkOverlap(colorMap, startAngle, endAngle) {
    for (let angle = startAngle; angle < endAngle; angle += 0.01) {
        if (colorMap[angle.toFixed(2)]) {
            return true;
        }
    }
    return false;
}

function getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 75%)`;
}

function addEmojiToTask(task) {
    const emojiMap = {
        '운동': '🏋️‍♂️', '회의': '💼', '점심': '🍽️', '공부': '📚', '수면': '🛌', 
        '휴식': '☕', '영화': '🎬', '산책': '🚶‍♂️', '저녁': '🍲', '쇼핑': '🛍️',
        '일정': '🗓️', '여행': '✈️', '운전': '🚗', '기상': '⏰', '음악': '🎵',
        '식사': '🍴', '운동': '🏃‍♂️', '전화': '📞', '공연': '🎤', '독서': '📖',
        '회의': '📝', '일기': '📅', '약속': '📅', '저녁식사': '🍽️', '조깅': '🏃‍♂️',
        '조리': '🍳', '빨래': '🧺', '요리': '👩‍🍳', '청소': '🧹', '수영': '🏊‍♂️',
        '등산': '🧗‍♂️', '스포츠': '⚽', '체육관': '🏋️‍♂️', '달리기': '🏃‍♂️',
        '산책': '🚶‍♂️', '여행': '🧳', '비행기': '✈️', '회의실': '🗣️', '사진': '📷',
        '강의': '🎓', '수업': '📚', '인터넷': '💻', '프로그래밍': '👨‍💻', '연구': '🔬',
        '과제': '📚', '시작': '🔛', '종료': '🔚', '장보기': '🛒', '커피': '☕',
        '와인': '🍷', '맥주': '🍺', '술': '🍶', '낮잠': '🛌', '쇼핑몰': '🏬',
        '카페': '☕', '디저트': '🍰', '식당': '🍜', '치과': '🦷', '병원': '🏥',
        '미용실': '💇‍♂️', '이발소': '💈', '네일': '💅', '마사지': '💆‍♂️'
    };

    const normalizedTask = task.replace(/\s+/g, ''); // 공백을 제거한 후 비교
    for (let keyword in emojiMap) {
        if (normalizedTask.includes(keyword)) {
            return `${emojiMap[keyword]} ${task}`;
        }
    }
    return task; // 해당하는 이모지가 없으면 원래 문장 반환
}

function clearAllTasks() {
    tasks = [];
    localStorage.removeItem(localStorageKey);
    drawClock();
    updateTaskTable();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    tasks.sort((a, b) => a.startTime - b.startTime); // 삭제 후 정렬
    localStorage.setItem(localStorageKey, JSON.stringify(tasks));
    drawClock();
    updateTaskTable();
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('startHour').value = Math.floor(task.startTime);
    document.getElementById('startMinute').value = (task.startTime % 1) * 60;
    document.getElementById('endHour').value = Math.floor(task.endTime);
    document.getElementById('endMinute').value = (task.endTime % 1) * 60;
    document.getElementById('task').value = task.task;

    deleteTask(index);
}

function changeColors() {
    tasks.forEach(task => {
        task.color = getRandomColor();
    });
    localStorage.setItem(localStorageKey, JSON.stringify(tasks));
    drawClock();
}

function downloadChart() {
    const canvas = document.getElementById('timeChart');
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // 스케일 값 설정
    const scale = 4;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = originalWidth * scale;
    scaledCanvas.height = originalHeight * scale;

    const scaledContext = scaledCanvas.getContext('2d');
    scaledContext.scale(scale, scale);

    // 고해상도 캔버스에 원본 캔버스 내용을 그리기
    scaledContext.translate(originalWidth / 2, originalHeight / 2);
    drawClock(scaledContext, originalWidth, originalHeight);

    // 원래 위치로 되돌림
    scaledContext.translate(-originalWidth / 2, -originalHeight / 2);

    const link = document.createElement('a');
    link.download = '생활계획표.png';
    link.href = scaledCanvas.toDataURL('image/png');
    link.click();
}

document.getElementById('addTask').addEventListener('click', addTask);
document.getElementById('clearAll').addEventListener('click', clearAllTasks);
document.getElementById('changeColors').addEventListener('click', changeColors);
document.getElementById('downloadChart').addEventListener('click', downloadChart);

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

drawClock();
updateTaskTable();
