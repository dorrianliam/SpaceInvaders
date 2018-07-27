// CONSTANTS
const CANVAS = document.createElement('canvas')
const CTX = CANVAS.getContext('2d') as CanvasRenderingContext2D

const SCREEN_WIDTH = (CANVAS.width = 420)
const SCREEN_HEIGHT = (CANVAS.height = 420)

const PRESSED_KEYS = {} as { [key: string]: boolean }
const KEYS = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  UP_ARROW: 38,
  DOWN_ARROW: 40,
  LEFT_ARROW: 37,
  RIGHT_ARROW: 39,
  SPACE_BAR: 32
}

const GAME = {} as { player: Player; invaders: Invader[]; bullets: Bullet[] }

// CLASSES
abstract class GameObject {
  public x: number = 0
  public y: number = 0
  public alive: boolean = true
  public abstract width: number
  public abstract speed: number
  public abstract height: number
  public abstract update(): void
  public abstract renderAs: string
  public moveUp = () => (this.y -= this.speed)
  public moveDown = () => (this.y += this.speed)
  public moveLeft = () => (this.x -= this.speed)
  public moveRight = () => (this.x += this.speed)
  public intersects(obj: GameObject): boolean {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.height + this.y > obj.y
    )
  }
}

class Player extends GameObject {
  speed = 4
  width = 35
  height = 12
  renderAs = 'player'

  public fireRate = 10
  public cooldown = 0

  public update(): void {
    if (KEYS.A in PRESSED_KEYS || KEYS.LEFT_ARROW in PRESSED_KEYS) {
      if (this.x > 0) {
        this.moveLeft()
      }
    }

    if (KEYS.D in PRESSED_KEYS || KEYS.RIGHT_ARROW in PRESSED_KEYS) {
      if (this.x < SCREEN_WIDTH - this.width) {
        this.moveRight()
      }
    }

    if (KEYS.SPACE_BAR in PRESSED_KEYS) {
      this.shoot()
    }
  }

  public shoot(enforceCooldown = true): void {
    if (this.cooldown) {
      this.cooldown -= 1
      if (enforceCooldown) {
        return
      }
    }

    const bullet = new Bullet()
    bullet.x = this.x + this.width / 2 - bullet.width / 2
    bullet.y = this.y - this.height / 2
    GAME.bullets.push(bullet)
    this.cooldown = this.fireRate
  }
}

class Invader extends GameObject {
  speed = 4
  width = 20
  height = 20
  renderAs = 'invader'

  public update(): void {}
}

class Bullet extends GameObject {
  speed = 4
  width = 5
  height = 5
  renderAs = 'bullet'

  public update(): void {
    this.y -= this.speed
  }
}

class Stage {
  static render(object: GameObject) {
    switch (object.renderAs) {
      case 'player':
        Stage.renderPlayer(object)
        break
      case 'bullet':
        Stage.renderBullet(object)
        break
      case 'invader':
        Stage.renderInvader(object)
        break
    }
  }

  static renderBullet({ width, height, x, y }: Bullet) {
    CTX.save()
    CTX.translate(x, y)
    CTX.fillStyle = 'red'
    CTX.fillRect(0, 0, width, height)
    CTX.restore()
  }

  static renderPlayer({ width, height, x, y }: GameObject) {
    CTX.save()
    CTX.translate(x, y)
    CTX.fillStyle = 'lime'
    CTX.fillRect(0, 0, width, height)
    CTX.fillRect(width / 2 - height / 4, -height / 2, height / 2, height / 2)
    CTX.restore()
  }
  static renderInvader({ width, height, x, y }: Bullet) {
    CTX.save()
    CTX.translate(x, y)
    CTX.fillStyle = 'white'
    CTX.fillRect(0, 0, width, height)
    CTX.restore()
  }
}

// EVENTS
const keyDownHandler = (event: KeyboardEvent) => {
  PRESSED_KEYS[event.keyCode] = true
}

const keyUpHandler = (event: KeyboardEvent) => {
  if (event.keyCode in PRESSED_KEYS) delete PRESSED_KEYS[event.keyCode]
  if (event.keyCode === KEYS.SPACE_BAR) GAME.player.shoot(false)
}

// GAME FUNCTIONS
const gameLoop = () => {
  requestAnimationFrame(gameLoop)

  CTX.fillStyle = 'black'
  CTX.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)

  GAME.player.update()
  Stage.render(GAME.player)

  GAME.invaders.map(invader => (invader.update(), invader)).map(Stage.render)

  GAME.bullets
    .map(bullet => (bullet.update(), bullet))
    .map((bullet, index) => {
      if (bullet.y < 0) GAME.bullets.splice(index, 1)

      GAME.invaders.map((invader, invaderIndex) => {
        if (bullet.intersects(invader)) {
          GAME.bullets.splice(index, 1)
          GAME.invaders.splice(invaderIndex, 1)
        }
      })

      return bullet
    })
    .map(Stage.render)
}

const setup = () => {
  let player = new Player()
  player.y = SCREEN_HEIGHT - player.height
  player.x = SCREEN_WIDTH / 2 - player.width / 2

  GAME.bullets = []
  GAME.invaders = []

  let invaderCount = 50
  const horizontalGap = 40
  const verticalGap = 40
  const startPosition = { x: -20, y: 50 }
  for (let i = 1; i <= 5; i++) {
    const currentposition = {
      x: startPosition.x,
      y: startPosition.y * i
    }

    for (let j = 1; j <= 10; j++) {
      const invader = new Invader()
      invader.x = currentposition.x + horizontalGap * j
      invader.y = currentposition.y

      GAME.invaders.push(invader)
    }
  }

  GAME.player = player

  window.addEventListener('keyup', keyUpHandler, false)
  window.addEventListener('keydown', keyDownHandler, false)
}

// INIT
const main = !(() => {
  document.body.appendChild(CANVAS)

  setup()
  gameLoop()
})()
