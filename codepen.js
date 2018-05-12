// 2018-05-12
// Code written in Codepen at https://codepen.io/whusterj/pen/VxxoEz

/*
Alphabet:
  F: line(0,0,0,len); translate(0,len);
  G: translate(0,len);
  +: rotate(angle);
  -: rotate(-angle);
  [: pushMatrix();
  ]: popMatrix();
*/

const canvas = document.getElementById('theCanvas');
const ctx = canvas.getContext('2d');

const Log = {
  log () {
    const consoleDiv = document.getElementById('console')
    const args = Array.from(arguments)
    const msg = args.join(' ')
    const newP = document.createElement('p')
    newP.innerHTML = msg
    consoleDiv.prepend(newP)
  },
}

const Vec2 = {
  create (opts = {}) {
    const x = opts.x || 0
    const y = opts.y || 0
    return {x, y, ...Vec2}
  },
  fromRadians (angle) {
    return Vec2.create({
      x: Math.cos(angle),
      y: Math.sin(angle),
    })
  },
  scale (vec, scalar) {
    return Vec2.create({
      x: vec.x * scalar,
      y: vec.y * scalar,
    })
  },
  sum () {
    let x = 0
    let y = 0
    for (i = 0; i < arguments.length; i++) {
      x += arguments[i].x
      y += arguments[i].y
    }
    return Vec2.create({x, y})
  },
  toString () {
    return '(' + [this.x, this.y].join(', ') + ')'
  }
}

const Turtle = {
  create(opts = {}) {
    const position = opts.position || Vec2.create()
    const heading = opts.heading || 0
    const matrixStack = opts.matrixStack || []
    return {position, heading, matrixStack, ...Turtle}
  },
  rotate (angle) {
    this.heading += angle
  },
  forward (distance) {
    const headingVec = Vec2.scale(
      Vec2.fromRadians(this.heading),
      distance
    )
    this.position = Vec2.sum(this.position, headingVec)
  },
  draw (distance) {
    const start = this.position
    const directionVector = Vec2.scale(
      Vec2.fromRadians(this.heading),
      distance
    )
    const end = Vec2.sum(this.position, directionVector)
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(0, 200, 0, 0.6)'
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  },
  push () {
    this.matrixStack.push({
      position: this.position,
      heading: this.heading,
    })
  },
  pop () {
    const popped = this.matrixStack.pop()
    if (popped) {
      this.position = popped.position
      this.heading = popped.heading
    }
  },
  render (
     sentence,
     drawDistance = 10,
     rotateAngle = (Math.PI / 6)
  ) {
    for (let i = 0; i < sentence.length; i++) {
      let word = sentence[i]
      if (word === 'F') {
        this.draw(drawDistance)
        this.forward(drawDistance)
      } else if (word === '+') {
        this.rotate(rotateAngle)
      } else if (word === '-') {
        this.rotate(-rotateAngle)
      } else if (word === '[') {
        this.push()
      } else if (word === ']') {
        this.pop()
      }
    }
  },
}

const turtle = Turtle.create({
  position: Vec2.create({x: 600, y: 1100}),
  heading: Math.PI + Math.PI / 2,
})
function step () {
  const sentence = getNextGeneration()
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  turtle.render(sentence, 10)
}

function doStep () {
  step()
}

// TEXT-ONLY
// 
// Alphabet: { A, B }
// Axiom:    A
// Ruleset:  A -> AB, B -> A
// 
const rules = []
rules[0] = {
  a: 'F',
  b: 'FF+[+F-F-F]-[-F+F+F]',
}
const axiom = 'F'

// State
let current = axiom
let count = 0
const outputDiv = document.querySelector('#output')

printGeneration()

function getNextGeneration () {
  let next = ''
  for (let i = 0; i < current.length; i++) {
    let found = false
    let letter = current[i]
    for (let j = 0; j < rules.length; j++) {
      if (letter === rules[j].a) {
        found = true
        next += rules[j].b
        break
      }
    }
    if (!found) {
      next += letter
    }
  }
  current = next
  count++
  printGeneration()
  return current
}

function printGeneration () {
  const msg = `Generation ${count}: ${current}`
  Log.log(msg)
}
