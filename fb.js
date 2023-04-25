var GAME_ID = 'oreo';
var POINT_EARED = 12;
var API_URL = 'https://api.flowco.io';

var canvas, ctx;
var width, height, birdPos;
var sky,
  star,
  devilUp,
  devilDown,
  rock,
  land,
  bird,
  pipeUp,
  pipeDown,
  cloud,
  dualPipeUp,
  dualPipeDown,
  scoreBoard,
  instro,
  instro2,
  blankPipe;
var dist, birdY, birdF, birdN, birdV, nextBirdY, speedDelta, intervalSpeed, intervalUpdateSpeed, startedTime;
var animation, death, deathAnim;
var pipes = [],
  pipesDir = [],
  pipeSt,
  pipeNumber,
  stars = [],
  rocks = [];
var score, maxScore, realScore, starEarned;
var dropSpeed;
var flashlight_switch = false,
  hidden_switch = false;
var mode, delta;
var wechat = false;
var playend = false,
  playdata = [];
var wxData;
var playedTime = 0;
var countDown = 45,
  intervalCountdown;

var isPlaying = false;

var soundOn = true;
if (localStorage.getItem('_soundOn') === 'false') {
  soundOn = false;
}

var clearCanvas = function () {
  ctx.fillStyle = '#03c5ff';
  ctx.fillRect(0, 0, width, height);
};

var soundBackground,
  soundStart,
  soundWin,
  soundHit,
  soundflapping,
  soundGameOver,
  soundEarnPoint,
  soundSpeedUp,
  soundBtnClick,
  soundLeaderBoard,
  soundTimUp,
  soundCountdown;
var extraScore, lastTimeExtraScore;
var isDropMode = 1;
var disableAddScore = false;
var loadImages = function () {
  var imgNumber = 5,
    imgComplete = 0;

  var onImgLoad = function () {
    imgComplete++;

    if (imgComplete == imgNumber) {
      death = 1;
      dist = 0;
      birdY = (height - 112) / 2;
      nextBirdY = birdY;
      speedDelta = 1;
      birdF = 0;
      birdN = 0;
      birdV = 0;
      birdPos = width * 0.35;
      score = 0;
      realScore = -1;
      pipeSt = 0;
      pipeNumber = 10;
      pipes = [];
      rocks = [];
      pipesDir = [];
      extraPoint = 0;
      lastTimeExtraPoint = 0;
      drawCanvas();
    }
  };

  sky = new Image();
  sky.src = 'images/sky.jpg';
  sky.onload = onImgLoad;

  land = new Image();
  land.src = 'images/land.png';
  land.onload = onImgLoad;
  land.style.zIndex = -1;

  cloud = new Image();
  cloud.src = 'images/clouds.png';
  cloud.onload = onImgLoad;

  bird = new Image();
  bird.src = 'images/bird.png';
  bird.width = 50;
  bird.height = 50;
  bird.onload = onImgLoad;

  pipeUp = new Image();
  pipeUp.src = 'images/pipe-up.png';
  pipeUp.style.zIndex = 9;

  pipeDown = new Image();
  pipeDown.src = 'images/pipe-down.png';
  pipeDown.style.zIndex = 9;

  // pipeBreak = new Image();
  // pipeBreak.src = 'images/pipe-break.png';
  // pipeBreak.onload = onImgLoad;

  dualPipeUp = new Image();
  dualPipeUp.src = 'images/dual-pipe-up.png';
  // dualPipeUp.onload = onImgLoad;

  dualPipeDown = new Image();
  dualPipeDown.src = 'images/dual-pipe-down.png';
  // dualPipeDown.onload = onImgLoad;
  splash = new Image();
  // splash.src = 'images/splash.png';
  // splash.onload = onImgLoad;

  star = new Image();
  star.src = 'images/star.png';
  star.width = 40;
  star.height = 42;

  devilUp = new Image();
  devilUp.src = 'images/devil-up.png';

  devilDown = new Image();
  devilDown.src = 'images/devil-down.png';

  rock = new Image();
  rock.src = 'images/rock.png';
  // rock.onload = onImgLoad;

  scoreBubble = new Image();
  scoreBubble.src = 'images/score-bubble.png';
  // scoreBubble.onload = onImgLoad;

  impactPoint = new Image();
  impactPoint.src = 'images/impact-point.png';
  // impactPoint.onload = onImgLoad;

  instro = new Image();
  instro.src = 'images/instro.png';
  instro.onload = onImgLoad;

  instro2 = new Image();
  instro2.src = 'images/instro.png';
  instro2.onload = onImgLoad;

  blankPipe = new Image();
  blankPipe.src = 'images/blank-pipe.png';
  blankPipe.onload = onImgLoad;
};

function loadSounds(url) {
  soundHit = new Howl({
    src: ['sounds/hit.mp3'],
  });
  soundStart = new Howl({
    src: ['sounds/start.mp3'],
  });
  soundGameOver = new Howl({
    src: ['sounds/game-over.mp3'],
  });
  soundWin = new Howl({
    src: ['sounds/win.mp3'],
  });
  soundflapping = new Howl({
    src: ['sounds/flapping-wings.mp3'],
  });

  soundEarnPoint = new Howl({
    src: ['sounds/earn-point.mp3'],
  });
  soundSpeedUp = new Howl({
    src: ['sounds/speed-up.mp3'],
  });
  soundBtnClick = new Howl({
    src: ['sounds/btn-click.mp3'],
  });
  soundLeaderBoard = new Howl({
    src: ['sounds/leaderboard.mp3'],
  });
  soundBackground = new Howl({
    src: ['sounds/background.mp3'],
    loop: true,
  });

  soundTimUp = new Howl({
    src: ['sounds/time-up.mp3'],
  });

  soundCountdown = new Howl({
    src: ['sounds/countdown.mp3'],
  });
}

/**API */
function apiGetRankBySession(score) {
  const url = `${API_URL}/game/rank-by-session?gameId=${GAME_ID}&score=${score}`;
  return fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(function (res) {
    return res.json();
  });
}

function is_touch_device() {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
}

var initCanvas = function () {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width = Math.min(875, window.innerWidth);
  canvas.height = height = Math.min(875, window.innerHeight);
  document.getElementById('game').width = width;
  document.getElementById('game').height = height;
  if (is_touch_device()) {
    canvas.addEventListener(
      'touchend',
      function (e) {
        e.preventDefault();
      },
      false
    );
    canvas.addEventListener(
      'touchstart',
      function (e) {
        if (death) {
          jump();
        } else if (isDropMode) {
          jump();
        }
        e.preventDefault();
      },
      false
    );
  } else canvas.onmousedown = jump;
  // window.onkeydown = jump;
  FastClick.attach(canvas);
  loadImages();
  document.addEventListener('keydown', function (e) {
    var keyCode = e.keyCode;
    if (death === 1) {
      e.preventDefault();
      return;
    }
    if (keyCode === 38 || keyCode === 32) {
      jump();
      e.preventDefault();
    }
    if (keyCode === 40) {
      down();
      e.preventDefault();
    }
  });
};

var deathAnimation = function () {
  playedTime = 0;

  if (intervalCountdown) {
    clearInterval(intervalCountdown);
  }

  soundOn && soundHit.play();
  soundBackground.stop();
  soundCountdown.stop();

  if (soundOn) {
    setTimeout(() => {
      soundGameOver.play();
    }, 300);
  }

  ctx.drawImage(impactPoint, birdPos + 20, birdY - 40);
  ctx.drawImage(bird, birdPos, birdY);
  maxScore = Math.max(maxScore, score);
  openEndScreen();
};

var drawSky = function () {
  var totWidth = 0;
  while (totWidth < width) {
    ctx.drawImage(sky, totWidth, height - 780);
    totWidth += sky.width;
  }
};

var drawCloud = function () {
  if (isPlaying) {
    var totWidth = -dist;
    while (totWidth < width) {
      ctx.drawImage(cloud, totWidth, 20);
      totWidth += cloud.width;
    }
  }
};

var drawLand = function () {
  var numberOfLand = 1;
  var totWidth = -dist;
  while (totWidth < width) {
    for (let index = 0; index <= numberOfLand; index++) {
      ctx.drawImage(land, totWidth, height - 52 * index);
    }
    totWidth += land.width;
  }

  if (birdY > height - 52 * (numberOfLand + 1)) {
    death = 1;
    clearInterval(animation);
    deathAnimation();
    return;
  }

  dist = dist + 2;
  var tmp = Math.floor(dist - width * 0.65) % 330;
  if (dist >= width * 0.65 && Math.abs(tmp) <= 1) {
    realScore++;
    if (realScore && realScore % 2 == 0 && realScore % 6 != 0) {
      // 2 cột
      extraScore = 2 * POINT_EARED;
      if (realScore % 5 == 0 || realScore % 4 == 0) {
        extraScore = 4 * POINT_EARED;
      }
    } else if (realScore % 6 == 0 && realScore) {
      // đá rơi
      extraScore = POINT_EARED;
    } else {
      extraScore = POINT_EARED;
    }
    addScore(extraScore);
  }
};

var addScore = function (val) {
  console.log(val);
  score += val;
  lastTimeExtraScore = new Date().getTime();
  soundOn && soundEarnPoint.play();
};

var drawScoreImg = function () {
  ctx.drawImage(scoreBubble, birdPos + 36, birdY - 30);
  ctx.font = '20px "BwSurcoBlackItalic"';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#0245A2';
  var txt = '' + score;

  const posText = score > 100 ? birdPos + 45 : birdPos + 50;
  ctx.fillText(txt, posText, birdY - 8);
};

var drawPipe = function (x, y, pipeIndex) {
  var PIPE_HEIGHT = 50,
    STAR_HEIGHT = 42,
    ROCK_HEIGHT = 18;
  const upPipesNumber = Math.round(y / PIPE_HEIGHT);
  const upColumnLength = upPipesNumber * PIPE_HEIGHT;
  const downColumnStart = upColumnLength + 200;
  const downPipesNumber = Math.ceil((height - downColumnStart) / PIPE_HEIGHT);

  if (pipeIndex > 0 && pipeIndex % 6 == 0) {
    const rockY = rocks[pipeIndex];
    if (rockY < downColumnStart - ROCK_HEIGHT) {
      drawRock(x, rockY, pipeIndex);
    } else {
      drawRock(x, downColumnStart - ROCK_HEIGHT, pipeIndex);
    }
  }

  // if (pipeIndex > 0 && pipeIndex % 2 == 0) {
  //   // star
  //   const starY = rocks[pipeIndex];
  //   if (starY < downColumnStart - STAR_HEIGHT) {
  //     drawStarE(x + 150, starY - 50, pipeIndex);
  //   }
  // }

  for (let i = 0; i < upPipesNumber; i++) {
    if (pipeIndex > 0 && pipeIndex % 6 == 0 && i == upPipesNumber - 1) {
      drawPipeItem(x, i * PIPE_HEIGHT, 'up', true);
    } else {
      drawPipeItem(x, i * PIPE_HEIGHT, 'up', false);
    }
  }

  for (let i = 0; i < downPipesNumber; i++) {
    drawPipeItem(x, downColumnStart + i * PIPE_HEIGHT, 'down', false);
  }

  if (x + 40 < 0) {
    pipeSt++;
    pipeNumber++;
    const pipeY = Math.max(Math.floor(Math.random() * (height - 300 - delta) + 10), 160);
    pipes.push(pipeY);
    pipesDir.push(Math.random() > 0.5);
    // rocks.push(pipeY);
    initArrayRocks(pipeY);
    initArrayStars(pipeY + 50);
  }
};

var drawPipeItem = function (x, y, mode, isBreak, isBlank) {
  var isDrawUp = mode === 'up';

  if (isDrawUp) {
    isDeathY = Math.abs(birdY - y) < (isBreak ? 10 : 50);
  } else {
    isDeathY = y - birdY < 85;
  }

  if (x < birdPos + 45 && x + 50 > birdPos && isDeathY) {
    death = 1;
    clearInterval(animation);
  }

  if (isBlank) {
    ctx.drawImage(blankPipe, x, y);
  } else {
    if (isDrawUp) {
      ctx.drawImage(pipeUp, x, y);
    } else {
      var isMobile = canvas.width <= 480 ? true : false;

      var cotSpace = isMobile ? 60 : 32;
      ctx.drawImage(pipeDown, x, y - cotSpace);
    }
  }
};

var drawStarX = function (x, y) {
  var STAR_WITH = 40;
  if (x < birdPos + STAR_WITH && x + STAR_WITH > birdPos && Math.abs(birdY - y) < STAR_WITH + 5) {
    if (!disableAddScore) {
      addScore(5);
    }
    disableAddScore = true;
    setTimeout(() => {
      disableAddScore = false;
    }, 500);
  } else {
    ctx.drawImage(star, x + STAR_WITH, y);
  }
};

var drawDevilUp = function (x, y) {
  var DEVIL_WITH = 25;
  if (x < birdPos + DEVIL_WITH && x + DEVIL_WITH > birdPos && Math.abs(birdY - y) < DEVIL_WITH + 5) {
    death = 1;
    clearInterval(animation);
  }
  ctx.drawImage(devilUp, x + DEVIL_WITH, y);
};

var drawDevilDown = function (x, y) {
  if (x < birdPos + 40 && x + 40 > birdPos && Math.abs(birdY - y) < 30) {
    death = 1;
    clearInterval(animation);
  }
  ctx.drawImage(devilDown, x + 40, y);
};

var drawRock = function (x, y, indexRock) {
  if (x < birdPos + 45 && x + 50 > birdPos && Math.abs(birdY - y) < 35) {
    death = 1;
    clearInterval(animation);
  }

  const dropPoint = width < 400 ? width : 0.5 * width;
  if (x < dropPoint) {
    rocks[indexRock] = rocks[indexRock] + 1;
    ctx.drawImage(rock, x, y);
  } else {
    ctx.drawImage(rock, birdN, 0, rock.width, rock.height, x, y, rock.width, rock.height);
    birdF = (birdF + 1) % 6;
    if (birdF % 6 == 0) birdN = (birdN + 1) % 3;
  }
};

// var drawStarE = function (x, y, idx) {
//   if (x < birdPos + 45 && x + 50 > birdPos && Math.abs(birdY - y) < 35) {
//     console.log('add score star');
//   }

//   const dropPoint = width < 400 ? width : 0.5 * width;
//   if (x < dropPoint) {
//     stars[idx] = stars[idx] + 1;
//     ctx.drawImage(star, x, y);
//   } else {
//     ctx.drawImage(star, birdN, 0, star.width, star.height, x, y, star.width, star.height);
//     birdF = (birdF + 1) % 6;
//     if (birdF % 6 == 0) birdN = (birdN + 1) % 3;
//   }
// };

// var drawStar = function (x, y) {
//   var STAR_WITH = 40;
//   if (x < birdPos + 45 && x + 50 > birdPos && Math.abs(birdY - y) < 35) {
//     console.log('add score star');
//     addScore(5);
//   } else {
//     const dropPoint = width < 400 ? width : 0.5 * width;
//     if (x < dropPoint) {
//       ctx.drawImage(star, x, y);
//     } else {
//       ctx.drawImage(star, birdN, 0, star.width, star.height, x, y, star.width, star.height);
//       birdF = (birdF + 1) % 6;
//       if (birdF % 6 == 0) birdN = (birdN + 1) % 3;
//     }
//   }
// };

var drawBird = function () {
  var BIRD_POS = 52;

  // drawScoreImg();
  if (new Date().getTime() - lastTimeExtraScore < 500) {
    drawScoreImg();
  }
  if (new Date().getTime() - startedTime < 4000 && !isDropMode) {
    ctx.drawImage(instro, birdPos - 78, birdY + BIRD_POS);
  }

  if (new Date().getTime() - startedTime < 4000) {
    ctx.drawImage(instro2, birdPos - 78, birdY + BIRD_POS);
  }

  if (isPlaying && !death) {
    ctx.drawImage(bird, 0, 0, bird.width, BIRD_POS, birdPos, birdY, bird.width, BIRD_POS);
  }

  if (isDropMode) {
    // dropmode
    birdY -= birdV;
    birdV -= dropSpeed;
  } else {
    //up down mode
    if (birdY != nextBirdY) {
      birdY += birdV;
    }
  }

  if (birdY + 10 > height) {
    clearInterval(animation);
    death = 1;
  }
  if (isPlaying && death) {
    deathAnimation();
  }
};

var drawScore = function () {
  ctx.font = '40px "Press Start 2P"';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#000';
  var txt = '' + score;
  ctx.strokeText(txt, 0, height * 0.15);
  ctx.fillText(txt, 0, height * 0.15);
};

var drawShadow = function () {
  var left_shadow =
    'linear, ' +
    ((width * 0.35 - 170) / width) * 100 +
    '% 0, ' +
    ((width * 0.35 + 60) / width) * 100 +
    '% 0, from(black), to(rgba(0,0,0,0))';
  var right_shadow =
    'linear, ' +
    ((width * 0.35 + 190) / width) * 100 +
    '% 0, ' +
    ((width * 0.35 - 30) / width) * 100 +
    '% 0, from(black), to(rgba(0,0,0,0))';
  var grd = ctx.createLinearGradient(width * 0.35 - 170, 0, width * 0.35 + 60, 0);
  grd.addColorStop(0, 'black');
  grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grd;
  ctx.fillRect(width * 0.35 - 170, 0, 230, height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width * 0.35 - 170, height);
  grd = ctx.createLinearGradient(width * 0.35 - 30, 0, width * 0.35 + 190, 0);
  grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grd.addColorStop(1, 'black');
  ctx.fillStyle = grd;
  ctx.fillRect(width * 0.35 - 30, 0, 220, height);
  ctx.fillStyle = 'black';
  ctx.fillRect(width * 0.35 + 190, 0, width * 0.65 - 190, height);
};

var drawHidden = function () {
  ctx.fillStyle = 'black';
  ctx.fillRect(width * 0.35, 30, 300, height - 180);
};

var drawCanvas = function () {
  clearCanvas();
  drawSky();
  drawLand();
  drawCloud();

  const SCREEN_HEIGHT = canvas.height;

  for (var i = pipeSt; i < pipeNumber; ++i) {
    const pipePost = width - dist + i * 330;
    var pipeIdx = pipes[i];

    drawPipe(pipePost, pipeIdx, i);

    // if (i % 3 == 0) drawStarE(pipePost + 60, pipeIdx + 150, i);

    let specialItem = 0;
    if (i % 2 == 0 && i && i % 6 != 0) {
      specialItem = 1;
      // double pipe
      drawPipe(pipePost + 50, pipeIdx, i);

      const dualPipeYItem = pipeIdx - 80;
      if (i % 4 == 0) {
        ctx.drawImage(dualPipeUp, pipePost, dualPipeYItem);
        if (pipePost < birdPos + 30 && pipePost + 50 > birdPos && birdY - dualPipeYItem < 90) {
          death = 1;
          clearInterval(animation);
        }
      }
      if (i % 5 == 0 && i % 4 != 0) {
        ctx.drawImage(dualPipeDown, pipePost, dualPipeYItem);
        if (pipePost < birdPos + 30 && pipePost + 50 > birdPos && birdY - dualPipeYItem < 90) {
          death = 1;
          clearInterval(animation);
        }
      }
    }

    if (i > 0 && !specialItem) {
      var SPACE = 150;
      if (i % 2) {
        drawStarX(pipePost - 200, pipeIdx + SPACE);
      }

      if (i % 3 == 0) {
        // drawStar(pipePost + 150, pipeIdx - 10);
        drawDevilUp(pipePost - SPACE, pipeIdx - 50);
      } else if (i > 0 && i % 5 == 0) {
        drawDevilDown(pipePost - SPACE, SCREEN_HEIGHT - 160);
      }
    }
  }
  // const numberOfLand = Math.max(Math.ceil((height - 821) / 52), 1);

  if (flashlight_switch) drawShadow();
  else if (hidden_switch) drawHidden();
  drawBird();
};

var anim = function (time = 1000) {
  animation = setInterval(drawCanvas, time / 60);
};
var jump = function () {
  if (death) {
    dist = 0;
    birdY = (height - 112) / 2;
    nextBirdY = birdY;
    speedDelta = 1;
    birdF = 0;
    birdN = 0;
    birdV = 0;
    death = 0;
    score = 0;
    realScore = -1;
    birdPos = width * 0.35;
    pipeSt = 0;
    pipeNumber = 10;
    pipes = [];
    rocks = [];
    pipesDir = [];
    countDown = 45;

    if (intervalCountdown) {
      clearInterval(intervalCountdown);
    }

    for (var i = 0; i < 10; ++i) {
      const pipeY = Math.max(Math.floor(Math.random() * (height - 300 - delta) + 10), 160);
      pipes.push(pipeY);
      pipesDir.push(Math.random() > 0.5);
      initArrayRocks(pipeY);
      initArrayStars(pipeY + 50);
    }

    anim();
    startedTime = new Date().getTime();

    if (soundOn) {
      soundOn && soundStart.play();
      setTimeout(() => {
        if (death) return;
        soundOn && soundBackground.play();
      }, 3000);
    }

    intervalCountdown = setInterval(() => {
      countDown--;
      $('#timer').html(countDown);

      if (countDown == 11) {
        soundOn && soundCountdown.play();
      }

      if (countDown <= 0) {
        death = 1;
        soundOn && soundTimUp.play();
        deathAnimation();
        clearInterval(intervalCountdown);
        clearInterval(animation);
      }
    }, 1000);
  }
  birdV = 4;
};

function initArrayRocks(pipeY) {
  const upPipesNumber = Math.round(pipeY / 52);
  const upColumnLength = upPipesNumber * 52;
  rocks.push(upColumnLength - 22);
}

function initArrayStars(pipeY) {
  const upPipesNumber = Math.round(pipeY / 42);
  const upColumnLength = upPipesNumber * 42;
  stars.push(upColumnLength - 22);
}

var easy, normal, hard;
function flashlight() {
  document.getElementById('flashlight').style.background = ['red', 'rgba(255, 255, 255, 0.6)'][+flashlight_switch];
  flashlight_switch ^= 1;
}

function hidden() {
  document.getElementById('hidden').style.background = ['red', 'rgba(255, 255, 255, 0.6)'][+hidden_switch];
  hidden_switch ^= 1;
}
function up() {
  birdV = -6;
  nextBirdY = birdY - 30;
  soundflapping.stop();
  soundflapping.play();
}
function down() {
  birdV = 6;
  nextBirdY = birdY + 30;
  soundflapping.stop();
  soundOn && soundflapping.play();
}
function speedUp() {
  if (speedDelta >= 900) {
    return;
  }
  soundOn && soundSpeedUp.play();
  speedDelta += 300;
  updateSpeed();

  const speedUpLevel = Math.floor(speedDelta / 100);
  document.getElementById('speedup-level').innerHTML = speedUpLevel;
}

function updateSpeed() {
  clearInterval(animation);
  anim(1000 - speedDelta);
}

var gameStart = function (mode) {
  isDropMode = mode;
  isPlaying = true;
  $('#game .timer').show();

  addClassTo('#screen-group', 'hidden');
  addClassTo('#screen-start', 'hidden');
  jump();
};

function fixBoxSize(screenId, width, height) {
  // $(screenId).css('width', `${width}px`);
  // $(screenId).css('height', `height`);
  console.log('width, height', width, height);
  $(screenId).width(width).height(height);
}

function onResize() {
  // fix height
  const screenHeight = window.innerHeight;
  let screenWidth = window.innerWidth;

  if (screenWidth > 480) {
    screenWidth = (screenHeight * 320) / 455;
  }
  fixBoxSize('#game', screenWidth, screenHeight);
  fixBoxSize('#screen-start', screenWidth, screenHeight);
  fixBoxSize('#screen-gameover', screenWidth, screenHeight); 
  fixBoxSize('#screen-board', screenWidth, screenHeight);

  if(canvas){
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    drawCanvas();
  }
  
}

window.onload = function () {
  onResize();

  // reset variable
  mode = 0;
  score = 0;
  realScore = -1;
  playdata = [0, 0];
  maxScore = 0;
  dropSpeed = 0.3;
  delta = 100;
  initCanvas();
  loadSounds();
  soundControl();
  $('#game .timer').hide();

  // window.onresize = function () {
  //   onResize();
  // };
};

function addClassTo(el, className) {
  if (!$(el).hasClass(className)) {
    $(el).addClass(className);
  }
}

// handle screens logic
function switchScreen(screenId) {
  $('#screen-group').removeClass('hidden');
  $('.screen').removeClass('active');
  $('#' + screenId).addClass('active');
}

function openEndScreen() {
  soundStart.stop();
  addClassTo('#footer-game', 'hidden');
  addClassTo('#screen-start', 'hidden');
  $('#total-score').html(score);

  if (countDown > 0) {
    // game over
    switchScreen('screen-gameover');
  } else {
    soundOn && soundWin.play();
    showResultBoard();
  }
 
  $('#screen-gameover').click(function () {
    soundOn && soundWin.play();
    showResultBoard();
  });
}

function showResultBoard() {
  clearCanvas();
  $('#game .timer').hide();
  apiGetRankBySession(score)
    .then((res) => {
      $('#js-rank-score').html(res.rank || '-');
      $('#js-rank-totalplayer').html(res.totalPlayer || '-');
      switchScreen('screen-board');
    })
    .catch(() => {
      $('#js-rank-score').html('-');
      $('#js-rank-totalplayer').html('-');
      switchScreen('screen-board');
    });
}

function soundControl() {
  if (soundOn) {
    $('#js-sound-off').addClass('hidden');
    $('#js-sound-on').removeClass('hidden');
  } else {
    $('#js-sound-on').addClass('hidden');
    $('#js-sound-off').removeClass('hidden');
  }

  $('#js-sound-on').click(function () {
    $('#js-sound-on').addClass('hidden');
    $('#js-sound-off').removeClass('hidden');
    soundOn = false;
    localStorage.setItem('_soundOn', false);
  });

  $('#js-sound-off').click(function () {
    $('#js-sound-off').addClass('hidden');
    $('#js-sound-on').removeClass('hidden');
    soundOn = true;
    localStorage.setItem('_soundOn', true);
  });
}

function closePopup() {
  window.parent.postMessage('closePopup', '*');
}

function share(type) {
  const appUrl = location.href;
  let redirectTo = '';
  switch (type) {
    case 'facebook':
      redirectTo = `https://www.facebook.com/sharer/sharer.php?u=${appUrl}`;
      break;
    case 'twitter':
      redirectTo = `http://twitter.com/share?url=${appUrl}`;
      break;
    case 'whatsapp':
      redirectTo = ` https://wa.me/?text=${appUrl}`;
      break;
    default:
      break;
  }
  window.open(redirectTo);
}
