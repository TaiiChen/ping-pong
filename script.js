let playerPaddle, computerPaddle, ball;
let playerScore = 0;
let computerScore = 0;
let gameState = 'start';

function setup() {
    const canvas = createCanvas(800, 600);
    textAlign(CENTER, CENTER);
    resetGame();
}

function resetGame() {
    playerPaddle = new Paddle(20, height / 2 - 50);
    computerPaddle = new Paddle(width - 30, height / 2 - 50);
    ball = new Ball();
    playerScore = 0;
    computerScore = 0;
}

function draw() {
    background(0);
    
    if (gameState === 'start') {
        showStartScreen();
    } else if (gameState === 'playing') {
        drawCourt();
        playGame();
    } else if (gameState === 'end') {
        showEndScreen();
    }
}

// 新增繪製球場邊際線的函數
function drawCourt() {
    stroke(255);
    strokeWeight(2);
    
    // 繪製外圍邊框
    noFill();
    rect(10, 10, width - 20, height - 20);
    
    // 繪製中線
    setLineDash([10, 10]); // 設置虛線樣式
    line(width/2, 10, width/2, height - 10);
    
    // 重設線條樣式
    setLineDash([]);
    strokeWeight(1);
}

// 新增設置虛線的輔助函數
function setLineDash(list) {
    drawingContext.setLineDash(list);
}

function showStartScreen() {
    fill(255);
    textSize(32);
    text('乒乓球遊戲', width/2, height/3);
    textSize(20);
    text('點擊滑鼠開始遊戲', width/2, height/2);
    text('使用滑鼠上下移動控制左側球拍', width/2, height/2 + 40);
}

function showEndScreen() {
    fill(255);
    textSize(32);
    text('遊戲結束!', width/2, height/3);
    textSize(24);
    const winner = playerScore > computerScore ? '玩家獲勝!' : '電腦獲勝!';
    text(winner, width/2, height/2);
    text(`最終比分: ${playerScore} - ${computerScore}`, width/2, height/2 + 40);
    textSize(20);
    text('點擊滑鼠重新開始', width/2, height/2 + 80);
}

function playGame() {
    // 顯示分數
    fill(255);
    textSize(32);
    text(playerScore, width/4, 50);
    text(computerScore, 3*width/4, 50);

    playerPaddle.show();
    playerPaddle.move(mouseY);

    computerPaddle.show();
    computerPaddle.aiMove(ball);

    ball.show();
    ball.move();
    ball.checkCollision(playerPaddle, computerPaddle);

    // 檢查是否有人得分
    if (ball.x < 0) {
        computerScore++;
        checkGameEnd();
        ball.reset();
    } else if (ball.x > width) {
        playerScore++;
        checkGameEnd();
        ball.reset();
    }
}

function checkGameEnd() {
    if (playerScore >= 11 || computerScore >= 11) {
        if (Math.abs(playerScore - computerScore) >= 2) {
            gameState = 'end';
        }
    }
}

function mousePressed() {
    if (gameState === 'start' || gameState === 'end') {
        gameState = 'playing';
        resetGame();
    }
}

function windowResized() {
    // 移除自動調整視窗大小的功能，改為固定大小
}

class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 100;
    }

    show() {
        fill(255);
        rect(this.x, this.y, this.width, this.height);
    }

    move(y) {
        this.y = constrain(y - this.height / 2, 0, height - this.height);
    }

    aiMove(ball) {
        const AI_MOVE_SPEED = 3.5; // 降低 AI 的移動速度
        const targetY = this.y + this.height/2;
        
        if (ball.xSpeed > 0) {
            // 精確預測球的落點，沒有誤差
            const predictedY = ball.y + (ball.ySpeed * ((width - ball.x) / ball.xSpeed));
            const boundedPredictedY = constrain(predictedY, 0, height);
            
            // 根據預測位置決定移動方向，使用固定速度
            if (Math.abs(boundedPredictedY - targetY) > 5) {
                if (boundedPredictedY > targetY) {
                    this.y += AI_MOVE_SPEED;
                } else {
                    this.y -= AI_MOVE_SPEED;
                }
                this.y = constrain(this.y, 0, height - this.height);
            }
        } else {
            // 當球遠離時，以固定速度回到中間位置
            const middleY = height/2 - this.height/2;
            if (Math.abs(this.y - middleY) > 5) {
                if (this.y > middleY) {
                    this.y -= AI_MOVE_SPEED/2;
                } else {
                    this.y += AI_MOVE_SPEED/2;
                }
            }
        }
    }
}

class Ball {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.radius = 10;
        this.xSpeed = random([-4.5, 4.5]);
        this.ySpeed = random(-3, 3);
        this.maxSpeed = 15;                 // 提高最大速度限制
        this.initialSpeed = 4.5;
        this.speedMultiplier = 1;
        this.hitCount = 0;
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, this.radius * 2);
    }

    move() {
        this.x += this.xSpeed * this.speedMultiplier;
        this.y += this.ySpeed * this.speedMultiplier;

        // 邊界碰撞檢查並加速
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.ySpeed *= -1;
            // 碰到上邊界時增加速度
            this.speedMultiplier *= 1.05;
            this.constrainSpeed();
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.ySpeed *= -1;
            // 碰到下邊界時增加速度
            this.speedMultiplier *= 1.05;
            this.constrainSpeed();
        }
    }

    // 新增速度限制檢查函數
    constrainSpeed() {
        const currentSpeed = Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed) * this.speedMultiplier;
        if (currentSpeed > this.maxSpeed) {
            this.speedMultiplier = this.maxSpeed / Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
        }
    }

    checkCollision(player, computer) {
        // 檢查與玩家球拍的碰撞
        if (this.x - this.radius < player.x + player.width &&
            this.x + this.radius > player.x &&
            this.y + this.radius > player.y &&
            this.y - this.radius < player.y + player.height) {
            
            const relativeIntersectY = (player.y + (player.height/2)) - this.y;
            const normalizedRelativeIntersectY = relativeIntersectY / (player.height/2);
            
            this.ySpeed = -normalizedRelativeIntersectY * 5;
            this.xSpeed = Math.abs(this.xSpeed);
            
            this.x = player.x + player.width + this.radius;
            
            // 增加撞擊後的加速幅度
            this.speedMultiplier *= 1.15;
            this.hitCount++;
            this.constrainSpeed();
            
            return true;
        }

        // 檢查與電腦球拍的碰撞
        if (this.x + this.radius > computer.x &&
            this.x - this.radius < computer.x + computer.width &&
            this.y + this.radius > computer.y &&
            this.y - this.radius < computer.y + computer.height) {
            
            const relativeIntersectY = (computer.y + (computer.height/2)) - this.y;
            const normalizedRelativeIntersectY = relativeIntersectY / (computer.height/2);
            
            this.ySpeed = -normalizedRelativeIntersectY * 5;
            this.xSpeed = -Math.abs(this.xSpeed);
            
            this.x = computer.x - this.radius;
            
            // 增加撞擊後的加速幅度
            this.speedMultiplier *= 1.15;
            this.hitCount++;
            this.constrainSpeed();
            
            return true;
        }

        return false;
    }

    updateSpeedMultiplier() {
        // 移除原本的速度更新邏輯，因為現在我們使用直接的乘法加速
        this.constrainSpeed();
    }
}