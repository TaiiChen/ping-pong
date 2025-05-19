let canvas;
let playerPaddle, computerPaddle, ball;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('gameCanvas');

    playerPaddle = new Paddle(20, height / 2 - 50);
    computerPaddle = new Paddle(width - 30, height / 2 - 50);
    ball = new Ball();
}

function draw() {
    background(0);

    playerPaddle.show();
    playerPaddle.move(mouseY);

    computerPaddle.show();
    computerPaddle.aiMove(ball);

    ball.show();
    ball.move();
    ball.checkCollision(playerPaddle, computerPaddle);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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
        this.y = constrain(ball.y - this.height / 2, 0, height - this.height);
    }
}

class Ball {
    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.radius = 10;
        this.xSpeed = random([-5, 5]);
        this.ySpeed = random(-3, 3);
    }

    show() {
        fill(255);
        ellipse(this.x, this.y, this.radius * 2);
    }

    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;

        if (this.y < 0 || this.y > height) {
            this.ySpeed *= -1;
        }
    }

    checkCollision(player, computer) {
        if (
            this.x - this.radius < player.x + player.width &&
            this.y > player.y &&
            this.y < player.y + player.height
        ) {
            this.xSpeed *= -1;
            this.x = player.x + player.width + this.radius;
        }

        if (
            this.x + this.radius > computer.x &&
            this.y > computer.y &&
            this.y < computer.y + computer.height
        ) {
            this.xSpeed *= -1;
            this.x = computer.x - this.radius;
        }

        if (this.x < 0 || this.x > width) {
            this.reset();
        }
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.xSpeed = random([-5, 5]);
        this.ySpeed = random(-3, 3);
    }
}