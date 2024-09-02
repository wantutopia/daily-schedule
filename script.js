const canvas = document.getElementById('timeChart');
const ctx = canvas.getContext('2d');
const radius = canvas.height / 2 - 40; // 모서리 잘림 방지용으로 -40 적용
ctx.translate(radius + 40, radius + 40);
const localStorageKey = 'timeTableData';

let tasks = JSON.parse(localStorage.getItem(localStorageKey)) || [];

function drawClock(context = ctx, width = canvas.width, height = canvas.height) {
    const radius = (width / 2) - 40;
    context.clearRect(-radius - 40, -radius - 40, width, height);
    context.beginPath();
    context.arc(0, 0, radius, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    context.strokeStyle = '#333';
    context.lineWidth = 1;
    context.stroke();

    // 텍스트 및 기타 차트 요소 다시 그리기
    drawClockLabels(context, width, height);
    drawTimeSections(context);
}

function drawClockLabels(context = ctx, width = canvas.width, height = canvas.height) {
    const labels = ['0', '6', '12', '18'];
    const positions = [
        { x: 0, y: -radius - 50 },  // 0시 (위쪽 바깥)
        { x: radius + 50, y: 0 },    // 6시 (오른쪽 바깥)
        { x: 0, y: radius + 50 },    // 12시 (아래쪽 바깥)
        { x: -radius - 50, y: 0 }    // 18시 (왼쪽 바깥)
    ];

    context.fillStyle = 'black';
    context.font = 'bold 20px Pretendard'; // 폰트를 Pretendard Bold로 변경
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    labels.forEach((label, index) => {
        if (!(label === '0' && tasks.some(task => task.startTime === 24))) {
            context.fillText(label, positions[index].x, positions[index].y);
        }
    });
}

function drawTimeSections(context = ctx) {
    const colorMap = {}; // 특정 각도의 색상을 기록하여 겹침을 확인

    tasks.forEach((task, index) => {
        const startAngle = (task.startTime / 12) * Math.PI - Math.PI / 2;
        const endAngle = (task.endTime / 12) * Math.PI - Math.PI / 2;
        const overlap = checkOverlap(colorMap, startAngle, endAngle);

        context.globalAlpha = overlap ? 0.6 : 1.0; // 겹치는 경우만 반투명 적용

        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, radius, startAngle, endAngle);
        context.closePath();
        context.fillStyle = task.color || getRandomColor(); // 색상 저장 또는 새로 생성
        context.fill();
        context.strokeStyle = '#333';
        context.stroke();

        // 각도별로 색상 기록
        for (let angle = startAngle; angle < endAngle; angle += 0.01) {
            colorMap[angle.toFixed(2)] = true;
        }

        // 투명도 초기화
        context.globalAlpha = 1.0;

        // 할일 텍스트와 이모지 표시
        context.save();
        const middleAngle = (startAngle + endAngle) / 2;
        context.rotate(middleAngle);
        context.translate(radius * 0.7, 0);
        context.rotate(-middleAngle);
        context.fillStyle = 'black';
        context.font = "16px Pretendard"; // 폰트를 Pretendard Bold로 변경
        context.textAlign = 'center';
        const taskWithEmoji = addEmojiToTask(task.task);
        context.fillText(taskWithEmoji, 0, 0);
        context.restore();

        // 시작 시간과 종료 시간 표시
        drawTimeLabels(context, startAngle, task.startTime);
        drawTimeLabels(context, endAngle, task.endTime);
    });
}

function drawTimeLabels(context, angle, time) {
    if (time === 24 && tasks.some(task => task.startTime === 0)) return; // 00시와 24시가 겹칠 경우 24시만 표시
    context.save();
    context.rotate(angle);
    context.translate(radius + 20, 0); // 원 바깥으로 시간 표시
    context.rotate(-angle);
    context.fillStyle = 'black';
    context.font = "14px Pretendard"; // 폰트를 Pretendard Bold로 변경
    context.textAlign = 'center';
    context.fillText(`${time}:00`, 0, 0);
    context.restore();
}

// 겹치는 영역 확인 함수
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

// 할 일에 이모지를 추가하는 함수
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
        '미용실': '💇‍♂️', '이발소': '💈', '네일': '💅', '마사지': '💆‍♂️', '휴가': '🏖️',
        '해변': '🏝️', '산': '🏞️', '공원': '🌳', '도서관': '🏛️', '은행': '🏦',
        '사무실': '🏢', '집': '🏠', '학교': '🏫', '공항': '🛫', '기차역': '🚉',
        '버스터미널': '🚍', '헬스장': '🏋️‍♂️', '낚시': '🎣', '골프': '🏌️‍♂️',
        '축구': '⚽', '농구': '🏀', '야구': '⚾', '테니스': '🎾', '당구': '🎱',
        '탁구': '🏓', '배드민턴': '🏸', '스키': '🎿', '스노우보드': '🏂', '아이스스케이팅': '⛸️',
        '서핑': '🏄‍♂️', '요가': '🧘‍♂️', '명상': '🧘‍♂️', '산책': '🚶‍♂️', '사이클': '🚴‍♂️'
    };

    const normalizedTask = task.replace(/\s+/g, ''); // 공백을 제거한 후 비교
    for (let keyword in emojiMap) {
        if (normalizedTask.includes(keyword)) {
            return `${emojiMap[keyword]} ${task}`;
        }
    }
    return task; // 해당하는 이모지가 없으면 원래 문장 반환
}

function addTask() {
    const startTime = parseFloat(document.getElementById('startTime').value);
    const endTime = parseFloat(document.getElementById('endTime').value);
    const task = document.getElementById('task').value;

    if (startTime >= 0 && startTime < 24 && endTime > startTime && endTime <= 24 && task) {
        const newTask = { startTime, endTime, task, color: getRandomColor() };
        tasks.push(newTask);
        tasks.sort((a, b) => a.startTime - b.startTime); // 시작시간 기준으로 정렬
        localStorage.setItem(localStorageKey, JSON.stringify(tasks));
        drawClock();
        updateTaskTable();
    } else {
        alert('시간 입력을 확인해 주세요.');
    }
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

function updateTaskTable() {
    const tbody = document.querySelector('#taskTable tbody');
    tbody.innerHTML = '';

    tasks.forEach((task, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.startTime}</td>
            <td>${task.endTime}</td>
            <td>${task.task}</td>
            <td><button onclick="editTask(${index})">수정</button></td>
            <td><button onclick="deleteTask(${index})">삭제</button></td>
        `;
        tbody.appendChild(row);
    });
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('startTime').value = task.startTime;
    document.getElementById('endTime').value = task.endTime;
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

    // 원하는 해상도로 설정 (예: 4배 해상도)
    const scale = 4;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = originalWidth * scale;
    scaledCanvas.height = originalHeight * scale;

    const scaledContext = scaledCanvas.getContext('2d');
    
    // 고해상도로 스케일링
    scaledContext.scale(scale, scale);

    // 캔버스의 변환 설정을 동일하게 유지
    scaledContext.translate(radius + 40, radius + 40);

    // 원래의 캔버스 내용을 고해상도 캔버스로 복사
    drawClock(scaledContext, originalWidth, originalHeight);

    // 다운로드
    const link = document.createElement('a');
    link.download = '생활계획표.png';
    link.href = scaledCanvas.toDataURL('image/png');
    link.click();
}

document.getElementById('addTask').addEventListener('click', addTask);
document.getElementById('clearAll').addEventListener('click', clearAllTasks);
document.getElementById('changeColors').addEventListener('click', changeColors);
document.getElementById('downloadChart').addEventListener('click', downloadChart);

// Enter 키를 누르면 계획이 추가되도록 이벤트 리스너 추가
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

drawClock();
updateTaskTable();
