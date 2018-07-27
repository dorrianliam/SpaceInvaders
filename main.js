"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// CONSTANTS
var CANVAS = document.createElement('canvas');
var CTX = CANVAS.getContext('2d');
var SCREEN_WIDTH = (CANVAS.width = 420);
var SCREEN_HEIGHT = (CANVAS.height = 420);
var PRESSED_KEYS = {};
var KEYS = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    SPACE_BAR: 32
};
var GAME = {};
// CLASSES
var GameObject = /** @class */ (function () {
    function GameObject() {
        var _this = this;
        this.x = 0;
        this.y = 0;
        this.alive = true;
        this.moveUp = function () { return (_this.y -= _this.speed); };
        this.moveDown = function () { return (_this.y += _this.speed); };
        this.moveLeft = function () { return (_this.x -= _this.speed); };
        this.moveRight = function () { return (_this.x += _this.speed); };
    }
    GameObject.prototype.intersects = function (obj) {
        return (this.x < obj.x + obj.width &&
            this.x + this.width > obj.x &&
            this.y < obj.y + obj.height &&
            this.height + this.y > obj.y);
    };
    return GameObject;
}());
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.speed = 4;
        _this.width = 35;
        _this.height = 12;
        _this.renderAs = 'player';
        _this.fireRate = 10;
        _this.cooldown = 0;
        return _this;
    }
    Player.prototype.update = function () {
        if (KEYS.A in PRESSED_KEYS || KEYS.LEFT_ARROW in PRESSED_KEYS) {
            if (this.x > 0) {
                this.moveLeft();
            }
        }
        if (KEYS.D in PRESSED_KEYS || KEYS.RIGHT_ARROW in PRESSED_KEYS) {
            if (this.x < SCREEN_WIDTH - this.width) {
                this.moveRight();
            }
        }
        if (KEYS.SPACE_BAR in PRESSED_KEYS) {
            this.shoot();
        }
    };
    Player.prototype.shoot = function (enforceCooldown) {
        if (enforceCooldown === void 0) { enforceCooldown = true; }
        if (this.cooldown) {
            this.cooldown -= 1;
            if (enforceCooldown) {
                return;
            }
        }
        var bullet = new Bullet();
        bullet.x = this.x + this.width / 2 - bullet.width / 2;
        bullet.y = this.y - this.height / 2;
        GAME.bullets.push(bullet);
        this.cooldown = this.fireRate;
    };
    return Player;
}(GameObject));
var Invader = /** @class */ (function (_super) {
    __extends(Invader, _super);
    function Invader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.speed = 4;
        _this.width = 20;
        _this.height = 20;
        _this.renderAs = 'invader';
        return _this;
    }
    Invader.prototype.update = function () { };
    return Invader;
}(GameObject));
var Bullet = /** @class */ (function (_super) {
    __extends(Bullet, _super);
    function Bullet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.speed = 4;
        _this.width = 5;
        _this.height = 5;
        _this.renderAs = 'bullet';
        return _this;
    }
    Bullet.prototype.update = function () {
        this.y -= this.speed;
    };
    return Bullet;
}(GameObject));
var Stage = /** @class */ (function () {
    function Stage() {
    }
    Stage.render = function (object) {
        switch (object.renderAs) {
            case 'player':
                Stage.renderPlayer(object);
                break;
            case 'bullet':
                Stage.renderBullet(object);
                break;
            case 'invader':
                Stage.renderInvader(object);
                break;
        }
    };
    Stage.renderBullet = function (_a) {
        var width = _a.width, height = _a.height, x = _a.x, y = _a.y;
        CTX.save();
        CTX.translate(x, y);
        CTX.fillStyle = 'red';
        CTX.fillRect(0, 0, width, height);
        CTX.restore();
    };
    Stage.renderPlayer = function (_a) {
        var width = _a.width, height = _a.height, x = _a.x, y = _a.y;
        CTX.save();
        CTX.translate(x, y);
        CTX.fillStyle = 'lime';
        CTX.fillRect(0, 0, width, height);
        CTX.fillRect(width / 2 - height / 4, -height / 2, height / 2, height / 2);
        CTX.restore();
    };
    Stage.renderInvader = function (_a) {
        var width = _a.width, height = _a.height, x = _a.x, y = _a.y;
        CTX.save();
        CTX.translate(x, y);
        CTX.fillStyle = 'white';
        CTX.fillRect(0, 0, width, height);
        CTX.restore();
    };
    return Stage;
}());
// EVENTS
var keyDownHandler = function (event) {
    PRESSED_KEYS[event.keyCode] = true;
};
var keyUpHandler = function (event) {
    if (event.keyCode in PRESSED_KEYS)
        delete PRESSED_KEYS[event.keyCode];
    if (event.keyCode === KEYS.SPACE_BAR)
        GAME.player.shoot(false);
};
// GAME FUNCTIONS
var gameLoop = function () {
    requestAnimationFrame(gameLoop);
    CTX.fillStyle = 'black';
    CTX.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    GAME.player.update();
    Stage.render(GAME.player);
    GAME.invaders.map(function (invader) { return (invader.update(), invader); }).map(Stage.render);
    GAME.bullets
        .map(function (bullet) { return (bullet.update(), bullet); })
        .map(function (bullet, index) {
        if (bullet.y < 0)
            GAME.bullets.splice(index, 1);
        GAME.invaders.map(function (invader, invaderIndex) {
            if (bullet.intersects(invader)) {
                GAME.bullets.splice(index, 1);
                GAME.invaders.splice(invaderIndex, 1);
            }
        });
        return bullet;
    })
        .map(Stage.render);
};
var setup = function () {
    var player = new Player();
    player.y = SCREEN_HEIGHT - player.height;
    player.x = SCREEN_WIDTH / 2 - player.width / 2;
    GAME.bullets = [];
    GAME.invaders = [];
    var invaderCount = 50;
    var horizontalGap = 40;
    var verticalGap = 40;
    var startPosition = { x: -20, y: 50 };
    for (var i = 1; i <= 5; i++) {
        var currentposition = {
            x: startPosition.x,
            y: startPosition.y * i
        };
        for (var j = 1; j <= 10; j++) {
            var invader = new Invader();
            invader.x = currentposition.x + horizontalGap * j;
            invader.y = currentposition.y;
            GAME.invaders.push(invader);
        }
    }
    GAME.player = player;
    window.addEventListener('keyup', keyUpHandler, false);
    window.addEventListener('keydown', keyDownHandler, false);


};
// INIT
var main = !(function () {
    document.body.appendChild(CANVAS);
    setup();
    gameLoop();
})();
