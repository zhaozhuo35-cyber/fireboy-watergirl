// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 960;
canvas.height = 640;

// 游戏状态
let gameState = 'start'; // start, playing, levelComplete, gameOver
let currentLevelIndex = 0;
let animationFrame = 0;
let particles = [];

// 瓦片大小
const TILE_SIZE = 40;
const COLS = canvas.width / TILE_SIZE; // 24
const ROWS = canvas.height / TILE_SIZE; // 16

// 玩家对象
const fireboy = {
    x: 2 * TILE_SIZE,
    y: 12 * TILE_SIZE,
    width: 30,
    height: 35,
    velocityX: 0,
    velocityY: 0,
    speed: 4,
    jumpPower: 12,
    onGround: false,
    hasGem: false,
    atDoor: false,
    color: '#FF4500',
    facing: 'right'
};

const watergirl = {
    x: 4 * TILE_SIZE,
    y: 12 * TILE_SIZE,
    width: 30,
    height: 35,
    velocityX: 0,
    velocityY: 0,
    speed: 4,
    jumpPower: 12,
    onGround: false,
    hasGem: false,
    atDoor: false,
    color: '#4169E1',
    facing: 'right'
};

// 键盘控制
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === 'Enter' && gameState === 'levelComplete') {
        nextLevel();
    }
    if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'gameOver') {
            restartLevel();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 关卡地图 (0: 空气, 1: 墙壁, 2: 岩浆, 3: 水, 4: 毒液, 5: 火人宝石, 6: 冰人宝石, 7: 火人门, 8: 冰人门, 9: 平台)
const levels = [
    // 第1关 - 简单教学关
    {
        name: "森林入口",
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,8,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,5,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
            [1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        fireboyStart: {x: 2, y: 12},
        watergirlStart: {x: 4, y: 12}
    },
    // 第2关 - 岩浆与冰水
    {
        name: "岩浆洞穴",
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,8,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1],
            [1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
            [1,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,1],
            [1,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,1],
            [1,2,2,2,2,2,2,0,0,0,0,4,4,0,0,0,0,3,3,3,3,3,3,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        fireboyStart: {x: 3, y: 11},
        watergirlStart: {x: 20, y: 11}
    },
    // 第3关 - 协作跳跃
    {
        name: "天空之桥",
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,8,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,6,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        fireboyStart: {x: 1, y: 13},
        watergirlStart: {x: 22, y: 13}
    },
    // 第4关 - 复杂迷宫
    {
        name: "毒液迷宫",
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,8,1],
            [1,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
            [1,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,1],
            [1,2,2,2,2,0,0,4,4,4,4,4,4,4,4,0,0,0,3,3,3,3,3,1],
            [1,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,1],
            [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        fireboyStart: {x: 3, y: 10},
        watergirlStart: {x: 20, y: 10}
    },
    // 第5关 - 高难度协作
    {
        name: "终极挑战",
        map: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,8,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1],
            [1,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
            [1,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        fireboyStart: {x: 2, y: 13},
        watergirlStart: {x: 21, y: 13}
    }
];

let currentLevel = levels[currentLevelIndex];

// 重力
const GRAVITY = 0.6;

// 粒子系统
class Particle {
    constructor(x, y, color, size, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.life = 60;
        this.maxLife = 60;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life--;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// 创建粒子效果
function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, color, Math.random() * 3 + 2, velocityX, velocityY));
    }
}

// 初始化玩家位置
function initPlayers() {
    fireboy.x = currentLevel.fireboyStart.x * TILE_SIZE;
    fireboy.y = currentLevel.fireboyStart.y * TILE_SIZE;
    fireboy.velocityX = 0;
    fireboy.velocityY = 0;
    fireboy.hasGem = false;
    fireboy.atDoor = false;

    watergirl.x = currentLevel.watergirlStart.x * TILE_SIZE;
    watergirl.y = currentLevel.watergirlStart.y * TILE_SIZE;
    watergirl.velocityX = 0;
    watergirl.velocityY = 0;
    watergirl.hasGem = false;
    watergirl.atDoor = false;
}

// 绘制地图
function drawMap() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = currentLevel.map[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            switch(tile) {
                case 1: // 墙壁 - 添加纹理
                    // 基础色
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 添加渐变
                    const wallGradient = ctx.createLinearGradient(x, y, x + TILE_SIZE, y + TILE_SIZE);
                    wallGradient.addColorStop(0, 'rgba(139, 90, 43, 0.3)');
                    wallGradient.addColorStop(1, 'rgba(101, 67, 33, 0.3)');
                    ctx.fillStyle = wallGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 边框
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 添加纹理线
                    ctx.strokeStyle = 'rgba(139, 90, 43, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + 10, y);
                    ctx.lineTo(x + 10, y + TILE_SIZE);
                    ctx.moveTo(x + 30, y);
                    ctx.lineTo(x + 30, y + TILE_SIZE);
                    ctx.stroke();
                    break;

                case 2: // 岩浆 - 动画效果
                    // 基础岩浆
                    const lavaGradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
                    lavaGradient.addColorStop(0, '#FF4500');
                    lavaGradient.addColorStop(0.5, '#FF6347');
                    lavaGradient.addColorStop(1, '#DC143C');
                    ctx.fillStyle = lavaGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 波浪效果
                    const wave = Math.sin((animationFrame * 0.1) + (col * 0.5)) * 3;
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                    ctx.fillRect(x, y + TILE_SIZE * 0.7 + wave, TILE_SIZE, TILE_SIZE * 0.3);

                    // 气泡效果
                    if (Math.random() < 0.02) {
                        createParticles(x + Math.random() * TILE_SIZE, y + TILE_SIZE, '#FFD700', 1);
                    }
                    break;

                case 3: // 水 - 动画效果
                    // 基础水
                    const waterGradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
                    waterGradient.addColorStop(0, '#4169E1');
                    waterGradient.addColorStop(0.5, '#6495ED');
                    waterGradient.addColorStop(1, '#4682B4');
                    ctx.fillStyle = waterGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 波浪效果
                    const waterWave = Math.sin((animationFrame * 0.1) + (col * 0.5)) * 3;
                    ctx.fillStyle = 'rgba(135, 206, 250, 0.5)';
                    ctx.fillRect(x, y + TILE_SIZE * 0.7 + waterWave, TILE_SIZE, TILE_SIZE * 0.3);

                    // 气泡效果
                    if (Math.random() < 0.02) {
                        createParticles(x + Math.random() * TILE_SIZE, y + TILE_SIZE, '#87CEEB', 1);
                    }
                    break;

                case 4: // 毒液 - 动画效果
                    // 基础毒液
                    const poisonGradient = ctx.createLinearGradient(x, y, x, y + TILE_SIZE);
                    poisonGradient.addColorStop(0, '#32CD32');
                    poisonGradient.addColorStop(0.5, '#00FF00');
                    poisonGradient.addColorStop(1, '#228B22');
                    ctx.fillStyle = poisonGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 波浪效果
                    const poisonWave = Math.sin((animationFrame * 0.15) + (col * 0.3)) * 4;
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
                    ctx.fillRect(x, y + TILE_SIZE * 0.7 + poisonWave, TILE_SIZE, TILE_SIZE * 0.3);
                    break;

                case 5: // 火人宝石 - 闪烁动画
                    const fireGemPulse = Math.sin(animationFrame * 0.1) * 2 + 12;

                    // 外发光
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#FFD700';

                    // 外圈
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, fireGemPulse, 0, Math.PI * 2);
                    ctx.fill();

                    // 内圈
                    ctx.fillStyle = '#FF4500';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, fireGemPulse - 4, 0, Math.PI * 2);
                    ctx.fill();

                    // 核心
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.shadowBlur = 0;

                    // 粒子效果
                    if (Math.random() < 0.1) {
                        createParticles(x + TILE_SIZE/2, y + TILE_SIZE/2, '#FF6347', 2);
                    }
                    break;

                case 6: // 冰人宝石 - 闪烁动画
                    const iceGemPulse = Math.sin(animationFrame * 0.1) * 2 + 12;

                    // 外发光
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#87CEEB';

                    // 外圈
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, iceGemPulse, 0, Math.PI * 2);
                    ctx.fill();

                    // 内圈
                    ctx.fillStyle = '#4169E1';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, iceGemPulse - 4, 0, Math.PI * 2);
                    ctx.fill();

                    // 核心
                    ctx.fillStyle = '#87CEEB';
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 3, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.shadowBlur = 0;

                    // 粒子效果
                    if (Math.random() < 0.1) {
                        createParticles(x + TILE_SIZE/2, y + TILE_SIZE/2, '#87CEEB', 2);
                    }
                    break;

                case 7: // 火人门
                    // 门框
                    ctx.fillStyle = '#8B0000';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 渐变
                    const fireDoorGradient = ctx.createRadialGradient(x + TILE_SIZE/2, y + TILE_SIZE/2, 0, x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2);
                    fireDoorGradient.addColorStop(0, 'rgba(255, 69, 0, 0.5)');
                    fireDoorGradient.addColorStop(1, 'rgba(139, 0, 0, 0.5)');
                    ctx.fillStyle = fireDoorGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 图标
                    ctx.fillStyle = '#FF4500';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🔥', x + TILE_SIZE/2, y + TILE_SIZE/2);
                    break;

                case 8: // 冰人门
                    // 门框
                    ctx.fillStyle = '#00008B';
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 渐变
                    const iceDoorGradient = ctx.createRadialGradient(x + TILE_SIZE/2, y + TILE_SIZE/2, 0, x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/2);
                    iceDoorGradient.addColorStop(0, 'rgba(65, 105, 225, 0.5)');
                    iceDoorGradient.addColorStop(1, 'rgba(0, 0, 139, 0.5)');
                    ctx.fillStyle = iceDoorGradient;
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                    // 图标
                    ctx.fillStyle = '#4169E1';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('❄️', x + TILE_SIZE/2, y + TILE_SIZE/2);
                    break;
            }
        }
    }
}

// 绘制玩家 - 改进版
function drawPlayer(player, isFireboy) {
    const x = player.x;
    const y = player.y;

    // 发光效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;

    // 身体渐变
    const bodyGradient = ctx.createLinearGradient(x, y, x, y + player.height);
    if (isFireboy) {
        bodyGradient.addColorStop(0, '#FF6347');
        bodyGradient.addColorStop(1, '#FF4500');
    } else {
        bodyGradient.addColorStop(0, '#6495ED');
        bodyGradient.addColorStop(1, '#4169E1');
    }

    // 身体
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.roundRect(x + 5, y, player.width, player.height, 10);
    ctx.fill();

    // 身体高光
    ctx.fillStyle = isFireboy ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 10, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // 眼睛底色
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 12, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 26, y + 12, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 眼珠
    const eyeOffsetX = player.velocityX > 0 ? 2 : player.velocityX < 0 ? -2 : 0;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + 12 + eyeOffsetX, y + 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 26 + eyeOffsetX, y + 13, 3, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛高光
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x + 13 + eyeOffsetX, y + 12, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 27 + eyeOffsetX, y + 12, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 微笑
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 19, y + 22, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 名字
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.strokeText(isFireboy ? '🔥火人' : '❄️冰人', x + player.width/2, y - 5);
    ctx.fillText(isFireboy ? '🔥火人' : '❄️冰人', x + player.width/2, y - 5);

    // 宝石状态
    if (player.hasGem) {
        const gemY = y - 20 + Math.sin(animationFrame * 0.15) * 3;

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + player.width/2, gemY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // 移动粒子效果
    if (Math.abs(player.velocityX) > 0 && player.onGround && Math.random() < 0.3) {
        createParticles(x + player.width/2, y + player.height, player.color, 1);
    }
}

// 获取瓦片
function getTile(x, y) {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return 1; // 边界视为墙壁
    }

    return currentLevel.map[row][col];
}

// 检查玩家碰撞
function checkPlayerCollisions(player, isFireboy) {
    // 检查地图碰撞
    const corners = [
        {x: player.x, y: player.y},
        {x: player.x + player.width, y: player.y},
        {x: player.x, y: player.y + player.height},
        {x: player.x + player.width, y: player.y + player.height}
    ];

    for (let corner of corners) {
        const tile = getTile(corner.x, corner.y);

        // 致命碰撞
        if (tile === 4) { // 毒液对两者都致命
            return 'dead';
        }
        if (isFireboy && tile === 3) { // 水对火人致命
            return 'dead';
        }
        if (!isFireboy && tile === 2) { // 岩浆对冰人致命
            return 'dead';
        }
    }

    // 检查宝石
    const playerCol = Math.floor((player.x + player.width/2) / TILE_SIZE);
    const playerRow = Math.floor((player.y + player.height/2) / TILE_SIZE);

    if (playerRow >= 0 && playerRow < ROWS && playerCol >= 0 && playerCol < COLS) {
        const tile = currentLevel.map[playerRow][playerCol];

        if (isFireboy && tile === 5) {
            player.hasGem = true;
            currentLevel.map[playerRow][playerCol] = 0;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#FFD700', 10);
        }
        if (!isFireboy && tile === 6) {
            player.hasGem = true;
            currentLevel.map[playerRow][playerCol] = 0;
            createParticles(player.x + player.width/2, player.y + player.height/2, '#87CEEB', 10);
        }

        // 检查门
        if (isFireboy && tile === 7 && player.hasGem) {
            player.atDoor = true;
        }
        if (!isFireboy && tile === 8 && player.hasGem) {
            player.atDoor = true;
        }
    }

    return 'alive';
}

// 更新玩家
function updatePlayer(player, leftKey, rightKey, jumpKey, isFireboy) {
    // 水平移动
    if (keys[leftKey]) {
        player.velocityX = -player.speed;
        player.facing = 'left';
    } else if (keys[rightKey]) {
        player.velocityX = player.speed;
        player.facing = 'right';
    } else {
        player.velocityX = 0;
    }

    // 跳跃
    if (keys[jumpKey] && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
        createParticles(player.x + player.width/2, player.y + player.height, player.color, 5);
    }

    // 应用重力
    player.velocityY += GRAVITY;

    // 限制下落速度
    if (player.velocityY > 15) {
        player.velocityY = 15;
    }

    // 水平移动并检查碰撞
    player.x += player.velocityX;

    // 检查左右碰撞
    const corners = [
        {x: player.x, y: player.y + 5},
        {x: player.x + player.width, y: player.y + 5},
        {x: player.x, y: player.y + player.height - 5},
        {x: player.x + player.width, y: player.y + player.height - 5}
    ];

    for (let corner of corners) {
        const tile = getTile(corner.x, corner.y);
        if (tile === 1) {
            if (player.velocityX > 0) {
                player.x = Math.floor(corner.x / TILE_SIZE) * TILE_SIZE - player.width - 1;
            } else if (player.velocityX < 0) {
                player.x = Math.ceil(corner.x / TILE_SIZE) * TILE_SIZE;
            }
            player.velocityX = 0;
            break;
        }
    }

    // 垂直移动并检查碰撞
    player.y += player.velocityY;
    player.onGround = false;

    // 检查上下碰撞
    const verticalCorners = [
        {x: player.x + 5, y: player.y},
        {x: player.x + player.width - 5, y: player.y},
        {x: player.x + 5, y: player.y + player.height},
        {x: player.x + player.width - 5, y: player.y + player.height}
    ];

    for (let corner of verticalCorners) {
        const tile = getTile(corner.x, corner.y);
        if (tile === 1) {
            if (player.velocityY > 0) {
                player.y = Math.floor(corner.y / TILE_SIZE) * TILE_SIZE - player.height;
                player.velocityY = 0;
                player.onGround = true;
            } else if (player.velocityY < 0) {
                player.y = Math.ceil(corner.y / TILE_SIZE) * TILE_SIZE;
                player.velocityY = 0;
            }
            break;
        }
    }

    // 检查危险
    const status = checkPlayerCollisions(player, isFireboy);
    if (status === 'dead') {
        gameState = 'gameOver';
        document.getElementById('gameOver').classList.remove('hidden');
        // 死亡粒子效果
        createParticles(player.x + player.width/2, player.y + player.height/2, player.color, 20);
    }
}

// 更新粒子
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// 绘制粒子
function drawParticles() {
    particles.forEach(particle => particle.draw());
}

// 游戏循环
function gameLoop() {
    if (gameState !== 'playing') {
        requestAnimationFrame(gameLoop);
        return;
    }

    animationFrame++;

    // 清空画布 - 渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制地图
    drawMap();

    // 更新粒子
    updateParticles();
    drawParticles();

    // 更新玩家
    updatePlayer(fireboy, 'ArrowLeft', 'ArrowRight', 'ArrowUp', true);
    updatePlayer(watergirl, 'a', 'd', 'w', false);

    // 绘制玩家
    drawPlayer(fireboy, true);
    drawPlayer(watergirl, false);

    // 检查关卡完成
    if (fireboy.atDoor && watergirl.atDoor) {
        gameState = 'levelComplete';
        document.getElementById('levelComplete').classList.remove('hidden');
        // 完成粒子效果
        createParticles(fireboy.x + fireboy.width/2, fireboy.y + fireboy.height/2, '#FFD700', 30);
        createParticles(watergirl.x + watergirl.width/2, watergirl.y + watergirl.height/2, '#FFD700', 30);
    }

    requestAnimationFrame(gameLoop);
}

// 开始游戏
document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').classList.add('hidden');
    gameState = 'playing';
    initPlayers();
    gameLoop();
});

// 下一关
function nextLevel() {
    document.getElementById('levelComplete').classList.add('hidden');
    currentLevelIndex++;

    if (currentLevelIndex >= levels.length) {
        alert('恭喜你通关所有关卡！🎉');
        currentLevelIndex = 0;
    }

    currentLevel = levels[currentLevelIndex];
    document.getElementById('currentLevel').textContent = currentLevelIndex + 1;
    particles = [];
    initPlayers();
    gameState = 'playing';
}

// 重新开始
function restartLevel() {
    document.getElementById('gameOver').classList.add('hidden');
    particles = [];
    initPlayers();
    currentLevel = levels[currentLevelIndex];
    gameState = 'playing';
}

// 初始化
initPlayers();
