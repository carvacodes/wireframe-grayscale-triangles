window.addEventListener('load', () => {
  ///////////////////////////////
  //          Globals          //
  ///////////////////////////////
  let _w = window.innerWidth;
  let _h = window.innerHeight;

  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = _w;
  canvas.height = _h;

  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  let maxHeight = Math.min(_w / 2, _h / 2);
  let triCount = 50;
  let zDepth = 2, rFactor = 0.5, moving = 1;
  let userX = 0, userY = 0;

  ///////////////////////////////
  //       Triangle Class      //
  ///////////////////////////////

  class Triangle {
    constructor(x) {
      this.factor = x / triCount;
      this.height = maxHeight * this.factor;
      this.base = this.height * (2 / 3);
      this.rotation = 0;
      this.rSpeed = this.factor / this.triCount;
      this.x = centerX;
      this.y = centerY - this.height / 2;
      this.z = zDepth + this.factor;

      this.basePoints = {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        x3: 0,
        y3: 0
      };

      this.reflectGrad = ctx.createRadialGradient(this.x, this.y + this.height / this.z, 0, this.x, this.y + this.height / this.z, this.height * (this.z / zDepth));
      this.reflectGrad.addColorStop(0, '#111');
      this.reflectGrad.addColorStop(0.1, '#888');
      this.reflectGrad.addColorStop(0.11, '#fff');
      this.reflectGrad.addColorStop(0.3, '#444');
      this.reflectGrad.addColorStop(0.45, '#222');
      this.reflectGrad.addColorStop(0.6, '#efefef');
      this.reflectGrad.addColorStop(0.7, '#444');
      this.reflectGrad.addColorStop(0.8, '#fff');
    }

    rotate(refreshThrottle) {
      if (this.rotation + this.rSpeed * rFactor * refreshThrottle > 2) {
        this.rotation = 0;
      } else if (this.rotation + this.rSpeed * rFactor * refreshThrottle < 0) {
        this.rotation = 2;
      }
      this.rotation += 0.015 * rFactor * this.factor * refreshThrottle;

      for (let i = 1; i < 4; i++) {
        this.basePoints['x' + i] = this.x + Math.cos(Math.PI * this.rotation + (6 * i / 3)) * this.base;
        this.basePoints['y' + i] = this.y + this.height + Math.sin(Math.PI * this.rotation + (6 * i / 3)) * this.base / this.z;
      }

      this.x = centerX;
      this.y = centerY - (this.height / 2) - (zDepth * userY / innerHeight);
      this.z = zDepth + this.factor;
    }

    draw() {
      ctx.strokeStyle = this.reflectGrad;
      ctx.beginPath();
      for (let j = 1; j < 4; j++) {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.basePoints['x' + j], this.basePoints['y' + j]);
        ctx.stroke();
        if (j < 3) {
          ctx.moveTo(this.basePoints['x' + j], this.basePoints['y' + j]);
          ctx.lineTo(this.basePoints['x' + (j + 1)], this.basePoints['y' + (j + 1)]);
          ctx.stroke();
        } else {
          ctx.moveTo(this.basePoints['x' + j], this.basePoints['y' + j]);
          ctx.lineTo(this.basePoints.x1, this.basePoints.y1);
          ctx.stroke();
        }
      }
    }

    update() {
      this.x = centerX;
      this.y = centerY - this.height / 2 - (zDepth * userY / innerHeight);
      this.z = zDepth + this.factor;

      this.reflectGrad = ctx.createRadialGradient(this.x, this.y + this.height / this.z, 0, this.x, this.y + this.height / this.z, this.height * (this.z / zDepth));
      this.reflectGrad.addColorStop(0, '#111');
      this.reflectGrad.addColorStop(0.1, '#888');
      this.reflectGrad.addColorStop(0.11, '#fff');
      this.reflectGrad.addColorStop(0.3, '#444');
      this.reflectGrad.addColorStop(0.45, '#222');
      this.reflectGrad.addColorStop(0.6, '#efefef');
      this.reflectGrad.addColorStop(0.7, '#444');
      this.reflectGrad.addColorStop(0.8, '#fff');
    }
  }

  ///////////////////////////////
  //      Event Listeners      //
  ///////////////////////////////
  document.addEventListener('mousemove', handleMoveEvents);
  document.addEventListener('touchmove', handleMoveEvents, {passive: false});
  document.addEventListener('click', handleClickLikeEvents);

  window.addEventListener('resize', ()=>{ window.location.reload(); })
  window.addEventListener('resize', handleResize);

  ///////////////////////////////
  //       Event Handlers      //
  ///////////////////////////////
  function handleResize(){
    canvas.width = _w;
    canvas.height = _h;
  
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
  
    maxHeight = Math.min(_w / 2, _h / 2);
    
    for (let m = 0; m < pyramids.length; m++) {
      pyramids[m].update();
    }

  }

  function handleMoveEvents(event) {
    let isTouch = Boolean(event.changedTouches);
    
    if (isTouch) {
      event.preventDefault();
    }

    userX = isTouch ? event.touches[0].clientX : event.clientX;
    userY = isTouch ? event.touches[0].clientY : event.clientY;

    if (userY < 0) { userY = 0 }

    rFactor = Math.round(userX - innerWidth/2) / Math.round(innerWidth / 2);
    zDepth = 0.5 + (20 * userY / innerHeight);
  }

  function handleClickLikeEvents(event) {
    moving = moving ? 0 : 1;
  }

  ///////////////////////////////
  //      Animation Event      //
  ///////////////////////////////

  // these variables will adjust movement speed to match the frame rate of the device (the time between rAF calls)
  let firstFrameTime = performance.now();
  let refreshThrottle = 1;
  let tempRefreshThrottle = 0;

  function animate(callbackTime) {
    tempRefreshThrottle = callbackTime - firstFrameTime;
    firstFrameTime = callbackTime;
    refreshThrottle = tempRefreshThrottle / 30;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    
    for (let l = 0; l < pyramids.length; l++) {
      if (moving) { pyramids[l].rotate(refreshThrottle); }
      pyramids[l].draw();
    }
    
    window.requestAnimationFrame(animate);
  }

  ///////////////////////////////
  //       Initialization      //
  ///////////////////////////////

  let pyramids = [];

  for (let k = 0; k < triCount; k++) {
    pyramids.push(new Triangle(k));
  }

  window.requestAnimationFrame(animate);
});