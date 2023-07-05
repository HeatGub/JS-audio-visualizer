const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.height = window.innerWidth; //to make widt/heig 1:1
const ctx = canvas.getContext('2d');
// ctx.shadowColor = 'white';
// ctx.shadowOffsetX = 2;
// ctx.shadowOffsetY = -2;
// ctx.lineWidth = 2; //no bar borders?
const audio1 = document.getElementById('audio1');
audio1.volume = 0.2;
let audioContext = new AudioContext();

// VISUALISATION PARAMETERS
let turns = document.getElementById('sliderTurns').value; //how many turns of radial bars. Integers > 1 give overlapping bars.
let fftSize = document.getElementById('droplistFftSizes').value; //number of FFT samples - 2^n values,   bars amount = fftSize/2
let highCutoff = document.getElementById('sliderHighCut').value; //part of frequencies cut (0 - 0.99) 
let bufferLength = fftSize/2;
let bufferLengthAfterCutoff = bufferLength -highCutoff;
let amplification = document.getElementById('sliderAmplification').value;
let widthMultiplier = document.getElementById('sliderWidthMultiplier').value;
let barWidth = widthMultiplier * 2 * (canvas.width/fftSize);
let VisualizerType = document.getElementById('droplistVisualizers').value;
let polygonSymmetry= document.getElementById('sliderPolygonSymmetry').value;

// ON FILE CHANGE   -   click the button to reset after fftSize changes
file.addEventListener('change', function(){
    const files = this.files;
    audio1.src = URL.createObjectURL(files[0]);
});

function updateValueAmplification(sliderValue, sliderValueID) {
    document.getElementById(sliderValueID).innerHTML = sliderValue; //show the number
    amplification = sliderValue;
}

function updateValueWidthMultiplier(sliderValue, sliderValueID) {
    document.getElementById(sliderValueID).innerHTML = sliderValue; //show the number
    widthMultiplier = sliderValue;
    barWidth = widthMultiplier * 2 * (canvas.width/fftSize);
}

function updateValueHighCut(sliderValue, sliderValueID) {
    document.getElementById(sliderValueID).innerHTML = sliderValue; //show the number
    highCutoff = fftSize/2 * sliderValue;
    bufferLengthAfterCutoff = bufferLength -highCutoff;
}

function updateValueFftSize(thisValue) {
    fftSize = Math.floor(thisValue);
    bufferLength = fftSize/2;
    barWidth = widthMultiplier * 2 * (canvas.width/fftSize);
    bufferLengthAfterCutoff = bufferLength -highCutoff;
}

function updateValueVisualizerType(thisValue) {
    VisualizerType = thisValue;
}

function updateValueTurns(sliderValue, sliderValueID) {
    turns = sliderValue;
    document.getElementById(sliderValueID).innerHTML = sliderValue;
}

function updateValuePolygonSymmetry(sliderValue, sliderValueID) {
    polygonSymmetry = sliderValue;
    document.getElementById(sliderValueID).innerHTML = sliderValue;
}


button.addEventListener('click', function () {
    console.log('click play');
    audio1.play();
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
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height); //clears previous frame
        analyser.getByteFrequencyData(dataArray); //copies the current frequency data into a Uint8Array
        if (VisualizerType == 'horizontal bars') {
            drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (VisualizerType == 'horizontal bars log') {
            drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (VisualizerType == 'radial bars') {
            drawVisualizerRadialBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (VisualizerType == 'radial bars log') {
            drawVisualizerRadialBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray);
        }
        else if (VisualizerType == 'polygons') {
            drawVisualizerPolygons(bufferLengthAfterCutoff, barHeight, dataArray);
        }
        requestAnimationFrame(animate);
    }
    animate();
});

// let h = [0, 120, 0];
// let h = [120, 0.01, 1];
// let h = [240, 120, 1];
let h = [240, 120, 360];
let s = [0, 50, 100];
let l = [0, 50, 100];
let a = [1, 1, 1];
// h musi rosnac od h0 do h1 liniowo w 1szym kroku. pozniej tak samo z h3
// czerwony hue = 0
// zielony hue = 100

// HORIZONTAL BARS VISUALIZER
function drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = dataArray[i] * amplification;
        let hHorizontalDistribution = h[0] - (h[1]-h[0])*(-i/bufferLengthAfterCutoff); //BOTH WAYS
        // let h_final = hHorizontalDistribution - (h[2]-hHorizontalDistribution)*(-dataArray[i]/256);
        // console.log(h_final);
        let aHorizontalDistribution = a[0] - (a[1]-a[0])*(-i/bufferLengthAfterCutoff);
        let h_final = hHorizontalDistribution;
        // let s_final = 50 + (dataArray[i]/256) * 50;
        // let l_final = (dataArray[i]/256) * 50;
        let s_final = 80;
        let l_final = 50;
        // let a_final = 1;
        let a_final = aHorizontalDistribution;
        finalColor = 'hsla(' + h_final + ', ' + s_final + '%, ' + l_final + '%, ' + a_final +')';
        ctx.fillStyle = 'hsla(' + h_final + ', ' + s_final + '%, ' + l_final + '%, ' + a_final +')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// POLYGONS VISUALIZER
function drawVisualizerPolygons(bufferLengthAfterCutoff, barHeight, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){

        barHeight = dataArray[i] * amplification;
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.strokeStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';

        // radius = dataArray[i] * amplification;
        // inset = 2;

        // radius = i * 3 * amplification;
        // inset = 1 + dataArray[i]/256;

        radius = i/bufferLengthAfterCutoff * amplification * 100;
        inset = 1 + dataArray[i]/256;
        ctx.lineWidth = widthMultiplier * amplification * (dataArray[i]/256) ; // widthMultiplier * (0-1)

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

// // HORIZONTAL BARS VISUALIZER
// function drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
//     for (let i = 0; i < bufferLengthAfterCutoff; i++){
//         barHeight = dataArray[i] * amplification;
//         const red =  2*barHeight/amplification;
//         const green =  256*i / (bufferLengthAfterCutoff);
//         const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
//         ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//         ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
//         x += barWidth;
//     }
// }

// HORIZONTAL BARS VISUALIZER - LOGARITHMIC SCALE
function drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = Math.log(dataArray[i]) * amplification * 30;
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// RADIAL BARS VISUALIZER
function drawVisualizerRadialBars(bufferLengthAfterCutoff, x, barWidth, barHeight, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        barHeight = dataArray[i] * amplification;
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        ctx.rotate(turns * i * Math.PI * 2 / bufferLength); //full circle with rotates = 1
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
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
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        ctx.restore(); //to the ctx.save
    }
}