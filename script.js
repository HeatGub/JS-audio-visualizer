const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;
// VISUALISATION PARAMETERS
// ctx.lineWidth = 0; //no bar borders?
const turns = 3.7; //how many turns of radial bars. Integers = overlapping bars.
fftSize = 256; //number of FFT samples - 2^n values,   bars amount = fftSize/2
let amplify = document.getElementById('slider').value;
let rangeValue;

function updateValue(val) {
    document.getElementById("rangeValue").innerHTML = val;
    amplify = val;
}


// BLOCK FOR INSTANT TESTING - change html also
button.addEventListener('click', function() {
    console.log('click play');
    try{console.log(rangeValue)}
    finally{
    const audio1 = document.getElementById('audio1');
    const audioContext = new AudioContext();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser(); // create node
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;    //data samples available - fftSize/2
    const dataArray = new Uint8Array(bufferLength);

    const barWidth = canvas.width/bufferLength;
    let barHeight;
    let x = 0;

    function animate() {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray); //copies the current frequency data into a Uint8Array
        drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
}});

// RADIAL BAR VISUALIZER
function drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i=0; i<bufferLength; i++){
        // barHeight = amplify * Math.log10(dataArray[i]); // equalized bar heights
        barHeight = amplify * dataArray[i];
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        ctx.rotate(turns * i * Math.PI * 2 / bufferLength); //full circle with rotates = 1
        const red =  60*barHeight/amplify;
        const green =  256*(i)/(bufferLength);
        const blue =  256*(bufferLength-(i))/(bufferLength);
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(0, 0, barWidth, barHeight);
        x += barWidth;
        // console.log('red=' + red + ' green=' + green + ' blue=' + blue);
        ctx.restore(); //to the ctx.save
    }
}

// // HORIZONTAL BAR VISUALIZER
// function drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray){
//     for (let i=0; i<bufferLength; i++){
//         barHeight = dataArray[i] * amplify;
//         const red =  barHeight/2;
//         const green =  256*(i+1)/(bufferLength+1);
//         const blue =  256*(bufferLength-(i-1))/(bufferLength-1);
//         ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
//         ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
//         x += barWidth;
//         // console.log('red=' + red + ' green=' + green + ' blue=' + blue);
//     }
// }


// ON FILE CHANGE
file.addEventListener('change', function(){
    const audioContext = new AudioContext();
    const files = this.files;
    const audio1 = document.getElementById('audio1');
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser(); // create node
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 32; //number of FFT samples -    2^n.   bars = fftSize/2
    const bufferLength = analyser.frequencyBinCount;    //data samples available
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = canvas.width/bufferLength;
    let barHeight;
    let x = 0;

    function animate() {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
});