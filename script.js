const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const rangeInputs = document.querySelectorAll('.slider input[type="range"]');
const textInputs = document.querySelectorAll('.slider input[type="text"]');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.height = window.innerWidth; //to make widt/heig 1:1
const ctx = canvas.getContext('2d');
const audio1 = document.getElementById('audio1');
audio1.volume = 0.2;
let audioContext = new AudioContext();
audio1.addEventListener('play', reloadAnimation);
//COLORPARAMETERS INIT
let [alphaRGB, lowMultiplierRed, highMultiplierRed, respMultiplierRed, lowMultiplierGreen, highMultiplierGreen, respMultiplierGreen, lowMultiplierBlue, highMultiplierBlue, respMultiplierBlue] = [1, 0, 0, 1, 0, 1, 0, 1, 0, 0];
// VISUALISATION PARAMETERS
let turns = document.getElementById('turns').value; //how many turns of radial bars. Integers > 1 give overlapping bars.
let fftSize = document.getElementById('droplistFftSizes').value; //number of FFT samples - 2^n values,   bars amount = fftSize/2
let highCutoff = document.getElementById('highCutoff').value * (fftSize/2); //part of frequencies cut (0 - 0.99)
let bufferLength = fftSize/2;
let bufferLengthAfterCutoff = bufferLength - highCutoff;
let amplification = document.getElementById('amplification').value;
let widthMultiplier = document.getElementById('widthMultiplier').value;
let visualizerType = document.getElementById('droplistVisualizers').value;
let polygonSymmetry = document.getElementById('polygonSymmetry').value;
let barWidth = widthMultiplier * 2 * (canvas.width/fftSize);

// ________ROTATION________
let frameCounter = 1;
let initialTurn = Math.PI;
let frameTurn;
let animationSpeed = 1;
// ________ROTATION________

// ON FILE CHANGE   -   click the button to reset after fftSize changes
file.addEventListener('change', function(){
    const files = this.files;
    audio1.src = URL.createObjectURL(files[0]);
});

colorInput1.addEventListener('input', setBackground);
colorInput2.addEventListener('input', setBackground);
droplistBackgrounds.addEventListener('input', setBackground);

function setBackground() {
    if (document.getElementById('droplistBackgrounds').value == 'linear'){
        document.getElementById('gradAngleSliderDiv').style.display = 'block';
        container.style.background = 'linear-gradient(' + document.getElementById('gradAngle').value +'deg, ' + colorInput1.value + ' ' + gradPosition1.value + '%, ' + colorInput2.value + ' ' + gradPosition2.value + '%)';
    }
    else {
        document.getElementById('gradAngleSliderDiv').style.display = 'none';
        container.style.background = 'radial-gradient(' + colorInput1.value + ' ' + gradPosition1.value + '%, ' + colorInput2.value + ' ' + gradPosition2.value + '%)';
    }
}
setBackground();

// _____________________SHADOW_____________________
colorInputShadow.addEventListener('input', setShadow);
alphaShadow.addEventListener('input', setShadow);
shadowOffsetX.addEventListener('input', setShadow);
shadowOffsetY.addEventListener('input', setShadow);
shadowBlur.addEventListener('input', setShadow);

function setShadow() {
    function hexToRgba(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        result ? rgbObj = {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
        return 'rgba(' + rgbObj.r + ', ' + rgbObj.g + ', ' + rgbObj.b + ', ' + alphaShadow.value + ')';
      }
    ctx.shadowColor = hexToRgba(colorInputShadow.value);
    ctx.shadowOffsetX = shadowOffsetX.value;
    ctx.shadowOffsetY = -shadowOffsetY.value;
    ctx.shadowBlur = shadowBlur.value;
}
setShadow();
// _____________________SHADOW_____________________

rangeInputs.forEach((el) => {
    el.addEventListener("input", updateField);
});

textInputs.forEach((el) => {
    el.addEventListener("change", updateField);
});

function updateField(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    document
      .querySelectorAll(`[data-field="${field}"]`)
      .forEach((el) => (el.value = value));
    // console.log(e.target.id);
    updateValues();
    setBackground();
    setShadow();
}

function updateValues() {
    [amplification,
    widthMultiplier,
    highCutoff,
    turns,
    polygonSymmetry,
    alphaRGB,
    lowMultiplierRed,
    highMultiplierRed,
    respMultiplierRed,
    lowMultiplierGreen,
    highMultiplierGreen,
    respMultiplierGreen,
    lowMultiplierBlue,
    highMultiplierBlue,
    respMultiplierBlue] = [...rangeInputs].map((el) => el.value);

    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    barWidth = widthMultiplier * 2 * (canvas.width/fftSize);
    bufferLength = fftSize/2;
    highCutoff = fftSize/2 * highCutoff;
    bufferLengthAfterCutoff = bufferLength - highCutoff;
}

//FFT UPDATE
droplistFftSizes.addEventListener('input', updateFftSize);

function updateFftSize() {
    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    updateValues();
    reloadAnimation();
}


//VISUALIZER TYPE
droplistVisualizers.addEventListener('input', updateVisualizerType);
// update type and disable unnecessary sliders
function updateVisualizerType() {
    visualizerType = document.getElementById('droplistVisualizers').value;
    if (visualizerType == 'radial bars' || visualizerType == 'radial bars log'){
        document.getElementById('turnsSliderDiv').style.display = 'block';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'none';
    }
    else if (visualizerType == 'polygons'){
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'block';
    }
    else {
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'none';
    }
    // console.log(visualizerType);
}
updateVisualizerType(); //to disable unnecessary elements at the start

//RELOAD ANIMATION
button.addEventListener('click', reloadAnimation);

let lastRequestId;

function reloadAnimation() {
    window.cancelAnimationFrame(lastRequestId); //to cancel possible multiple animation request
    console.log('reloadAnimation');
    if (typeof audioSource == 'undefined') { //without that condition there is an error on creating audioSource
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser(); // create node
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;    //data samples available - fftSize/2
    const dataArray = new Uint8Array(bufferLength);
    let barHeight;
    let x = 0;

    function animate() {
        frameCounter += 1;
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height); //clears previous frame
        analyser.getByteFrequencyData(dataArray); //copies the current frequency data into a Uint8Array
        if (visualizerType == 'horizontal bars') {
            drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (visualizerType == 'horizontal bars log') {
            drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (visualizerType == 'radial bars') {
            drawVisualizerRadialBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (visualizerType == 'radial bars log') {
            drawVisualizerRadialBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (visualizerType == 'polygons') {
            drawVisualizerPolygons(bufferLengthAfterCutoff, dataArray);
        }
        // requestAnimationFrame(animate);
        lastRequestId = window.requestAnimationFrame(animate);
    }
    animate();
};

//COLOR MIXER
function mixingColors(i, dataArray){
    const red =  respMultiplierRed*dataArray[i]  + lowMultiplierRed*255*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff)) + highMultiplierRed * 255*i / (bufferLengthAfterCutoff);
    const green =  respMultiplierGreen*dataArray[i]  + lowMultiplierGreen*255*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff)) + highMultiplierGreen * 255*i / (bufferLengthAfterCutoff);
    const blue =  respMultiplierBlue*dataArray[i]  + lowMultiplierBlue*255*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff)) + highMultiplierBlue * 255*i / (bufferLengthAfterCutoff);
    return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alphaRGB + ')';
};

// HORIZONTAL BARS VISUALIZER
function drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = dataArray[i] * amplification;
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
};

// POLYGONS VISUALIZER
// let frameCounter = 0;
function drawVisualizerPolygons(bufferLengthAfterCutoff, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        // frameCounter += 1;
        // initialTurn = frameCounter * Math.PI/100000;
        // barHeight = dataArray[i] * amplification;
        ctx.strokeStyle = mixingColors(i, dataArray);

        // radius = dataArray[i] * amplification;
        // inset = 2;

        // radius = i * 3 * amplification;
        // inset = 1 + dataArray[i]/255;

        radius = i/bufferLengthAfterCutoff * amplification * 120;
        inset = 1 + dataArray[i]/255;
        // insetLastOne = inset;
        ctx.lineWidth = widthMultiplier * amplification * (dataArray[i]/255) ; // widthMultiplier * (0-1)

        ctx.beginPath();
        ctx.save(); //creates snapshot of global settings
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.moveTo(0, 0 - radius); //center
        
        for (let j=0; j < polygonSymmetry; j++){
            ctx.rotate(Math.PI / polygonSymmetry);
            ctx.lineTo(0, 0 - (radius * inset));
            ctx.rotate(Math.PI / polygonSymmetry);
            ctx.lineTo(0, 0 - radius);
        }

        ctx.closePath(); 
        ctx.stroke();//display 
        // ctx.fill();
        ctx.restore(); //to the ctx.save
    }
}

// HORIZONTAL BARS VISUALIZER - LOGARITHMIC SCALE
function drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = Math.log(dataArray[i]) * amplification * 30;
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// RADIAL BARS VISUALIZER
function drawVisualizerRadialBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        frameTurn = animationSpeed * frameCounter / 100;
        // frameTurn = animationSpeed * frameCounter / bufferLengthAfterCutoff;
        barHeight = dataArray[i] * amplification;
        console.log();
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        ctx.rotate(initialTurn + frameTurn + (turns * i * Math.PI * 2 / bufferLength));
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        ctx.restore(); //to the ctx.save
    }
}

// RADIAL BARS VISUALIZER - LOGARITHMIC SCALE
function drawVisualizerRadialBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        barHeight = Math.log(dataArray[i]) * amplification * 30;
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        ctx.rotate(turns * i * Math.PI * 2 / bufferLength); //full circle with rotates = 1
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        ctx.restore(); //to the ctx.save
    }
}