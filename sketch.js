    let page = document.getElementById("scene");
    let pw = page.clientWidth;
    let ph = page.clientHeight;

    function optimizeCanvas(canvas) {
      //Get the DPR and size of canvas
      const dpr = window.devicePixelRatio;
      const rect = canvas.getBoundingClientRect();
      // Set the actual size of the canvas
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      //Scale the context to ensure correct drawing operations
      canvas.getContext("2d").scale(dpr, dpr);
      // Set the drawn size of the canvas
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    //background
    const bg = document.getElementById("background");
    const ctxbg = bg.getContext("2d");
    bg.width = pw;
    bg.height = ph;
    optimizeCanvas(bg);
    ctxbg.fillStyle = "pink";
    ctxbg.fillRect(0, 0, pw, ph);

  /*   //webcam
    const video = document.querySelector("#webcam");
    const vidcanvas = document.querySelector("#cam");
    const vidctx = vidcanvas.getContext("2d");

    if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
    }

    video.addEventListener("loadeddata", () => {
    vidcanvas.width = pw;
    vidcanvas.height = 3*pw/4;
    setInterval(() => {chromaKey()
    }, 40);
    
    })

    function chromaKey() {
      vidctx.drawImage(video, 0, 0, vidcanvas.width, vidcanvas.height);
      const imageData = vidctx.getImageData(0,0,vidcanvas.width, vidcanvas.height);
      const dataLength = imageData.data.length / 4
      for (let i = 0; i < dataLength; i++) {
        const offset = i * 4;
        const red = imageData.data[offset + 0]
        const blue = imageData.data[offset + 1]
        const green = imageData.data[offset + 2]
        //const alpha = imageData.data[offset + 3]

        if(blue>90 && blue > red && blue > green) {
          imageData.data[offset + 3] = 0;
        }
      }
      vidctx.putImageData(imageData, 0, 0);
    } */

    //effects
    window.addEventListener("load", function() {
    const effects = document.getElementById("effects");
    const ctxeffects = effects.getContext("2d");
    effects.width = pw;
    effects.height = ph;

    ctxeffects.lineWidth = 6;
    ctxeffects.lineCap = "round";
    ctxeffects.fillStyle = "blue";
    ctxeffects.shadowColor = "black";
    ctxeffects.shadowOffsetY= 10;
    ctxeffects.shadowOffsetX= 5;
    ctxeffects.shadowBlur = 10;

    const canvasRain = document.getElementById("rain");
    const ctxRain = canvasRain.getContext("2d");
    canvasRain.width = window.innerWidth;
    canvasRain.height = window.innerHeight;
    optimizeCanvas(canvasRain);

    class Fractal {
      constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.size = this.canvasWidth * 0.2;
        this.sides = 6;
        this.maxLevel = 2;
        this.scale = 0.5;
        this.spread = Math.random() * 2.8 + 0.1;
        this.branches = 2;
        this.color = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
      }

      draw(context) {
        context.strokeStyle = this.color;
        context.save();
        context.translate(this.canvasWidth/2,this.canvasHeight/2);
        context.scale(1,1);
        context.rotate(0);
        for (let i=0; i<this.sides; i++) {
        this.#drawLine(context, 0);
        context.rotate((Math.PI * 2)/this.sides); 
        }
        context.restore();
      }

      #drawLine(context, level) {
        if (level > this.maxLevel) return;
        context.beginPath();
        context.moveTo(0,0);
        context.lineTo(this.size, 0);
        context.stroke();
        
        for (let i = 0; i < this.branches; i++) {
          context.save();
        context.translate(this.size - (this.size/this.branches) * i,0)
        context.scale(this.scale, this.scale);

        context.save();
        context.rotate(this.spread);
        this.#drawLine(context, level + 1);
        context.restore();

        context.save();
        context.rotate(-this.spread);
        this.#drawLine(context, level + 1);
        context.restore();
        context.restore();
        }   
      }
    }

    class Particle {
      constructor(canvasWidth, canvasHeight, image) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.image=image;
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;
        this.sizeModifier = Math.random() *0.2 + 0.1;
        this.width = this.image.width * this.sizeModifier;
        this.height = this.image.height * this.sizeModifier;
        this.speed= Math.random() * 1 + 0.5;
        this.angle = 0;
        this.vang = Math.random() * 0.01 - 0.005;
      }
      update(){
        this.angle += this.vang;
        this.x += this.speed;
        if (this.x > this.canvasWidth + this.width) this.x = - this.width;
        this.y += this.speed;
        if (this.y > this.canvasWidth + this.height) this.y = - this.height;
      }
      draw(context){
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height)
        context.restore();
      }

    }

    class Rain {
      constructor(canvasWidth, canvasHeight, image) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.image = image;
        this.numberOfPArticles = 200;
        this.particles = [];
        this.#initialize();
      }

    #initialize(){
      for (let i=0; i<this.numberOfPArticles; i++) {
        this.particles.push(new Particle(this.canvasWidth, this.canvasHeight, this.image));
      }
    }
    run(context){
      this.particles.forEach(particle => {
        particle.draw(context);
        particle.update();
      });
    }
    }

    const fractal1 = new Fractal(effects.width, effects.height);
    fractal1.draw(ctxeffects);
    const fractalImage = new Image();
    fractalImage.src = effects.toDataURL();

    fractalImage.onload = function() {
      const rainEffect = new Rain(canvasRain.width, canvasRain.height, fractalImage);
    
    function animate(){
      ctxRain.clearRect(0,0,canvasRain.width, canvasRain.height)
      rainEffect.run(ctxRain);
      requestAnimationFrame(animate);
    }
    animate();
    }
    });