const container = document.getElementById('container');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
let audioSource;
let analyser;
// VISUALISATION PARAMETERS
// ctx.lineWidth = 0; //no bar borders?
const amplify = 4;

// BLOCK FOR INSTANT TESTING - change html also
container.addEventListener('click', function() {
    const audio1 = document.getElementById('audio1');
    const audioContext = new AudioContext();
    audio1.play();
    audioSource = audioContext.createMediaElementSource(audio1);
    analyser = audioContext.createAnalyser(); // create node
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 32; //number of FFT samples - 2^n values,   bars amount = fftSize/2
    const bufferLength = analyser.frequencyBinCount;    //data samples available
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
});

function drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray){
    for (let i=0; i<bufferLength; i++){
        barHeight = dataArray[i] * amplify;
        const red =  barHeight/2;
        const green =  256*(i+1)/(bufferLength+1);
        const blue =  256*(bufferLength-(i-1))/(bufferLength-1); //0-100
        ctx.fillStyle = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
        // console.log('red=' + red + ' green=' + green + ' blue=' + blue);
    }
}

// // ON FILE CHANGE
// file.addEventListener('change', function(){
//     const audioContext = new AudioContext();
//     const files = this.files;
//     const audio1 = document.getElementById('audio1');
//     audio1.src = URL.createObjectURL(files[0]);
//     audio1.load();
//     audio1.play();
//     audioSource = audioContext.createMediaElementSource(audio1);
//     analyser = audioContext.createAnalyser(); // create node
//     audioSource.connect(analyser);
//     analyser.connect(audioContext.destination);
//     analyser.fftSize = 32; //number of FFT samples -    2^n.   bars = fftSize/2
//     const bufferLength = analyser.frequencyBinCount;    //data samples available
//     const dataArray = new Uint8Array(bufferLength);
//     const barWidth = canvas.width/bufferLength;
//     let barHeight;
//     let x = 0;

//     function animate() {
//         x = 0;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         analyser.getByteFrequencyData(dataArray);
//         drawVisualizer(bufferLength, x, barWidth, barHeight, dataArray);
//         requestAnimationFrame(animate);
//     }
//     animate();
// });