import { Player } from './player.js'
import { Projectile } from './projectile.js'
import { Enemy } from './enemy.js'
import { distanceBetweenTwoPoints } from './utilities.js'

const music = new Audio()
const sound = new Audio()
const sound2 = new Audio()
const sound3 = new Audio()
music.src = '../sound/music.mp3'
sound.src = '../sound/sound.mp3'
sound2.src = '../sound/sound2.mp3'
sound3.src = '../sound/sound3.mp3'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
canvas.width = document.documentElement.clientWidth
canvas.height = document.documentElement.clientHeight

const scoreEl = document.querySelector('#score')
const wastedElement = document.querySelector('.wasted')

let player
let projectiles = []
let enemies = []
let particles = []
let score = 0
let animationId
let countIntervalId
let spawnIntervalId

startGame()

function startGame() {
  init()
  animate()
  spawnEnemies()
}

function init() {
  const movementLimits = {
    minX: 0,
    maxX: canvas.width,
    minY: 0,
    maxY: canvas.height,
  }
  player = new Player(canvas.width / 2, canvas.height / 2, context, movementLimits)
  sound2.play()
  addEventListener('click', createProjectile)
  // document.addEventListener('keydown', createProjectileSpace)
}

function createProjectile(event) {
  sound.play()
  projectiles.push(new Projectile(player.x, player.y, event.clientX, event.clientY, context))
}

function createProjectileSpace(event) {
  if (event.code === 'Space') {
    sound.play()
    projectiles.push(new Projectile(player.x, player.y, event.clientX, event.clientY, context))
  }
}

function spawnEnemies() {
  let countOfSpawnEnemies = 1

  countIntervalId = setInterval(() => countOfSpawnEnemies++, 30000)
  spawnIntervalId = setInterval(() => spawnCountEnemies(countOfSpawnEnemies), 2500)

  spawnCountEnemies(countOfSpawnEnemies)
}

function spawnCountEnemies(count) {
  for (let i = 0; i < count; i++) {
    enemies.push(new Enemy(canvas.width, canvas.height, context, player))
  }
}

function animate() {
  animationId = requestAnimationFrame(animate)
  context.clearRect(0, 0, canvas.width, canvas.height)

  particles = particles.filter((particle) => particle.alpha > 0)
  projectiles = projectiles.filter(projectileInsideWindow)
  enemies.forEach((enemy) => checkHittingEnemy(enemy))
  enemies = enemies.filter((enemy) => enemy.health > 0)
  const isGameOver = enemies.some(checkHittingPlayer)
  if (isGameOver) {
    sound3.play()
    wastedElement.style.display = 'block'
    clearInterval(countIntervalId)
    clearInterval(spawnIntervalId)
    cancelAnimationFrame(animationId)
  }

  particles.forEach((particle) => particle.update())
  projectiles.forEach((projectile) => projectile.update())
  player.update()
  enemies.forEach((enemy) => enemy.update())
}

function projectileInsideWindow(projectile) {
  return (
    projectile.x + projectile.radius > 0 &&
    projectile.x - projectile.radius < canvas.width &&
    projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height
  )
}

function checkHittingPlayer(enemy) {
  const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y)
  return distance - enemy.radius - player.radius < 0
}

function checkHittingEnemy(enemy) {
  projectiles.some((projectile, index) => {
    const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y)
    if (distance - enemy.radius - projectile.radius > 0) return false

    removeProjectileByIndex(index)
    enemy.health--

    if (enemy.health < 1) {
      increaseScore()
      enemy.createExplosion(particles)
    }

    return true
  })
}

function removeProjectileByIndex(index) {
  projectiles.splice(index, 1)
}

function increaseScore() {
  score += 250
  scoreEl.innerHTML = score
}
