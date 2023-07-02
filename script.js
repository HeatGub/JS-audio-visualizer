const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// canvas.height = window.innerWidth; //to make widt/heig 1:1
const ctx = canvas.getContext('2d');
const audio1 = document.getElementById('audio1');
audio1.volume = 0.2;
let audioContext = new AudioContext();
// let audioSource;
// let analyser;
// let audio1 = document.getElementById('audio1');
// VISUALISATION PARAMETERS
// ctx.lineWidth = 0; //no bar borders?
let turns = document.getElementById('sliderTurns').value; //how many turns of radial bars. Integers > 1 give overlapping bars.
let fftSize = document.getElementById('droplistFftSizes').value; //number of FFT samples - 2^n values,   bars amount = fftSize/2
let amplification = document.getElementById('sliderAmplification').value;
let highCutoff = document.getElementById('sliderHighCut').value; //part of frequencies cut (0 - 0.99) 
let bufferLength = fftSize/2;
let bufferLengthAfterCutoff = bufferLength -highCutoff;

let widthMultiplier = document.getElementById('sliderWidthMultiplier').value;
let barWidth = widthMultiplier * 2 * (canvas.width/fftSize);
let VisualizerType = document.getElementById('droplistVisualizers').value;


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
    // console.log(barWidth);
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
    // console.log(barWidth);
}

function updateValueVisualizerType(thisValue) {
    VisualizerType = thisValue;
    console.log(VisualizerType);
}

function updateValueTurns(sliderValue, sliderValueID) {
    turns = sliderValue;
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
        // drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
        if (VisualizerType == 'horizontal bars') {
            drawVisualizerHorizontalBars(bufferLength, x, barWidth, barHeight, dataArray);
        // drawVisualizerRadialBars(bufferLength, x, barWidth, barHeight, dataArray);
        }
        else if (VisualizerType == 'radial bars') {
            drawVisualizerRadialBars(bufferLength, x, barWidth, barHeight, dataArray);
        // drawVisualizerRadialBars(bufferLength, x, barWidth, barHeight, dataArray);
        }
        requestAnimationFrame(animate);
    }
    animate();
});

// HORIZONTAL BARS VISUALIZER
function drawVisualizerHorizontalBars(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = dataArray[i] * amplification;
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// RADIAL BARS VISUALIZER
function drawVisualizerRadialBars(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        // barHeight = amplification * Math.log10(dataArray[i]); // equalized bar heights
        barHeight = amplification * dataArray[i];
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        ctx.rotate(turns * i * Math.PI * 2 / bufferLength); //full circle with rotates = 1
        const red =  2*barHeight/amplification;
        const green =  256*i / (bufferLengthAfterCutoff);
        const blue =  256*((bufferLengthAfterCutoff-i) / (bufferLengthAfterCutoff));
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        // console.log('red=' + red + ' green=' + green + ' blue=' + blue);
        ctx.restore(); //to the ctx.save
    }
}