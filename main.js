// GLOBALS
const canvas = document.getElementById('theCanvas')
const ctx = canvas.getContext('2d')

// Simulation
let zoomLevel = 1
let autoplay = false

// Branch characteristics
let branchMaxWidth = 1000        // Max width a branch can be
let branchMaxLength = 10000      // Max length a branch can be
let branchingMinWidth = 20       // Min width required to create child branches
let branchColor = 'white'         // Color of branches
let deadBranchColor = 'gray'    // Color of branches
let numBranches = 2              // Number of branches generated
let branchAngle = radians(22.5)  // Angle of generated branches
let angleJitter = 1

// CONSTANTS
DEBUG = false

function debug () {
  if (DEBUG) {
    console.log(...arguments)
  }
}

// Libraries

class Vector2 {

  constructor (opts = {}) {
    this.x = opts.x || 0
    this.y = opts.y || 0
  }

  static fromRadians (radians) {
    return new Vector2({
      x: Math.cos(radians),
      y: Math.sin(radians),
    })
  }

  static scale (vector, scalar) {
    return new Vector2({
      x: vector.x * scalar,
      y: vector.y * scalar,
    })
  }

  static sum () {
    let x = 0
    let y = 0
    for (let i = 0; i < arguments.length; i++) {
      x += arguments[i].x
      y += arguments[i].y
    }
    return new Vector2({x, y})
  }

  toString () {
    return '(' + [this.x, this.y].join(', ') + ')'
  }

}

//
function degrees (radians) {
  return radians * (180 / Math.PI);
}

function radians (degrees) {
  return degrees * (Math.PI / 180);
}

//
class Branch {

  constructor (opts = {}) {
    this.root = opts.root || new Vector2()
    this.width = opts.width || 1
    this.length = opts.length || 1
    this.rotation = opts.rotation || radians(270)
    this.parent = opts.parent || null
    this.branches = opts.branches || []
    this.generation = opts.generation || 0
    this.dead = false
  }

  update () {
    // Branch death. Chance increases by generation
    if (Math.random() < (0.0001 * Math.max(1, this.generation))) {
      this.dead = true
    }

    // Chance dead branch falls off
    if (this.dead && this.parent) {
      if (Math.random() < (0.00001 * this.width * this.generation)) {
        const idx = this.parent.branches.indexOf(this)
        this.parent.branches.splice(idx, 1)
      }
    }

    if (this.dead && !this.parent) {
      setup()
    }

    if (!this.dead) {
      // Branch grows
      if (this.length <= branchMaxLength) {
        this.length += 10 * Math.random()
      }
      if (this.width <= branchMaxWidth) {
        this.width += 1
      }

      // Possibility of branching
      if (this.width >= branchingMinWidth && this.branches.length <= 1 && Math.random() < 0.05) {
        this.branches.push(new Branch({
          rotation: this.rotation + (radians(22.5 + angleJitter * (0.5 - Math.random()))),
          root: this.getEndPoint(),
          parent: this,
          generation: this.generation + 1,
        }))
        this.branches.push(new Branch({
          rotation: this.rotation - (radians(22.5 + angleJitter * (0.5 - Math.random()))),
          root: this.getEndPoint(),
          parent: this,
          generation: this.generation + 1,
        }))
      }
    }

    // Set the 'root' of child branches to be the 'end' of this branch
    if (this.parent) {
      this.root = this.parent.getEndPoint()
    }

    if (this.parent && this.parent.dead) {
      this.dead = true
    }

    this.branches.forEach(b => b.update())
  }

  getStartPoint () {
    this.root = this.parent ? this.parent.getEndPoint() : this.root
    return this.root
  }

  getEndPoint () {
    const headingVec = Vector2.scale(
      Vector2.fromRadians(this.rotation),
      this.length * (1/zoomLevel)
    )
    const endPoint = Vector2.sum(this.root, headingVec)
    // debug('getEndPoint:')
    // debug('    rotation:', this.rotation)
    // debug('    endPoint:', endPoint)
    return endPoint
  }

  render () {
    const start = this.getStartPoint()
    const end = this.getEndPoint()
    // debug('branch render:')
    // debug('   width:', this.width)
    // debug('   length:', this.length)
    // debug('   start:', start)
    // debug('   end:', end)
    ctx.beginPath()
    ctx.lineWidth = this.width * (1/zoomLevel)
    ctx.strokeStyle = this.dead ? deadBranchColor : branchColor
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    this.branches.forEach(b => b.render())
  }

}

// Update & Render Loop
function step () {
  branches.forEach(b => b.update())
}

function loop () {
  if (autoplay) {
    branches.forEach(b => b.update())
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  branches.forEach(b => b.render())
  window.requestAnimationFrame(loop)
}

// Event Listeners
function play () {
  autoplay = true
}

function stop () {
  autoplay = false
}

function reset () {
  setup()
}

function doStep () {
  step()
}

function zoomOut () {
  zoomLevel += 1
  debug('zoomLevel', zoomLevel)
}

function zoomIn () {
  if (zoomLevel !== 1) {
    zoomLevel -= 1
  }
  debug('zoomLevel', zoomLevel)
}

canvas.addEventListener('wheel', handleMouseWheel)
function handleMouseWheel(e) {
  // cross-browser wheel delta
  var e = window.event || e // old IE support
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))
  if (delta > 0) {
    zoomIn()
  } else if (delta < 0) {
    zoomOut()
  }
}

angleJitterSlider = document.getElementById('angleJitterSlider')
angleJitterSlider.oninput = function () {
  angleJitter = this.value
}

//
// Execution Code
//

let branches = []

function setup () {
  branches = [
    new Branch({root: {x: 1000, y: 1200}})
  ]
}

setup()
loop()
