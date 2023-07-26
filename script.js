const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const file = document.getElementById('fileupload');
const rangeInputs = document.querySelectorAll('.slider input[type="range"]');
const textInputs = document.querySelectorAll('.slider input[type="text"]');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const audioPlayer = document.getElementById('audioPlayer');
// audioPlayer.volume = 0.2;
// let audioContext = new AudioContext();
audioPlayer.addEventListener('play', reloadAnimation);
//COLORPARAMETERS INIT
let [alphaRGB, lowMultiplierRed, highMultiplierRed, respMultiplierRed, lowMultiplierGreen, highMultiplierGreen, respMultiplierGreen, lowMultiplierBlue, highMultiplierBlue, respMultiplierBlue] = [1, 0, 0, 1, 0, 1, 0, 1, 0, 0];
// VISUALISATION PARAMETERS INITIALIZATION
let turns = document.getElementById('turns').value; //how many turns of radial bars. Integers > 1 give overlapping bars.
let fftSize = document.getElementById('droplistFftSizes').value; //number of FFT samples - 2^n values,   bars amount = fftSize/2
let highCutoff = document.getElementById('highCutoff').value * (fftSize/2); //part of frequencies cut (0 - 0.99)
let bufferLength = fftSize/2;
let bufferLengthAfterCutoff = bufferLength - highCutoff;
let amplification = document.getElementById('amplification').value;
let widthMultiplier = document.getElementById('widthMultiplier').value;
let visualizerType = document.getElementById('droplistVisualizers').value;
let polygonSymmetry = document.getElementById('polygonSymmetry').value;
let barWidth = widthMultiplier * (canvas.width/fftSize*2);
// ________ROTATION________
let frameCounter = 1;
let rotationSpeed = document.getElementById('rotationSpeed').value;
let initialRotation = document.getElementById('initialRotation').value;
let frameTurn;
// ________POLYGONS________
let inset = Number(document.getElementById('inset').value);
let initialRadius = Number(document.getElementById('initialRadius').value);
let polygonsReactiveness = Number(document.getElementById('polygonsReactiveness').value);
let polygonsReactivenessFinal = Number((1 - polygonsReactiveness).toFixed(3));

// SOME DECLARATIONS ARE NEARBY THEIR MAIN FUNCTIONS

//FILE HANDLING
file.addEventListener('change', function(){
    const files = this.files;
    audioPlayer.src = URL.createObjectURL(files[0]);
    fileupload.style.boxShadow = 'none';
    fileupload.style.outline = 'none';
});

// ____________________SLIDERS____________________
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
    updateParameters();
    setBackground();
    setShadow();
    // console.log(e.target.id);
    // console.log(e.target.dataset.field);
}
// ____________________SLIDERS____________________

// UPDATE VALUES FUNCTION
function updateParameters() {
    [amplification, widthMultiplier, highCutoff, turns, polygonSymmetry, polygonsReactiveness, inset, initialRadius, initialRotation, rotationSpeed, alphaRGB, lowMultiplierRed, highMultiplierRed, respMultiplierRed, lowMultiplierGreen, highMultiplierGreen, respMultiplierGreen, lowMultiplierBlue, highMultiplierBlue, respMultiplierBlue] = [...rangeInputs].map((el) => el.value);
    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    barWidth = widthMultiplier * (canvas.width/fftSize*2);
    bufferLength = fftSize/2;
    highCutoff = fftSize/2 * highCutoff;
    bufferLengthAfterCutoff = bufferLength - highCutoff;
    polygonsReactivenessFinal = Number((1 - polygonsReactiveness).toFixed(3));
    // console.log(inset);
}

//FFT UPDATE
droplistFftSizes.addEventListener('input', updateFftSize);

function updateFftSize() {
    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    updateParameters();
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
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'none';
        document.getElementById('initialRotationSliderDiv').style.display = 'block';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'block';
        document.getElementById('initialRadiusSliderDiv').style.display = 'none';
        document.getElementById('insetSliderDiv').style.display = 'none';

        document.getElementById('widthMultiplier').min = 0.01;
        document.getElementById('widthMultiplier').max = 50;
        document.getElementById('widthMultiplier').value = 0.5;
        document.getElementById('widthMultiplierTextInput').value = 0.5;

        document.getElementById('amplification').max = 10;
        document.getElementById('amplification').value = 1;
        document.getElementById('amplificationTextInput').value = 1;

        //  add fft size options
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="block";
    }
    else if (visualizerType == 'polygons'){
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'block';
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'block';
        document.getElementById('initialRotationSliderDiv').style.display = 'block';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'block';
        document.getElementById('initialRadiusSliderDiv').style.display = 'block';
        document.getElementById('insetSliderDiv').style.display = 'block';

        document.getElementById('widthMultiplier').max = 20;
        document.getElementById('widthMultiplier').value = 10;
        document.getElementById('widthMultiplierTextInput').value = 10;

        document.getElementById('amplification').max = 100;
        document.getElementById('amplification').value = 1;
        document.getElementById('amplificationTextInput').value = 1;

        //  remove fft size options and change the value if it was too high
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="none";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="none";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="none";
        if (document.getElementById('droplistFftSizes').value >=1024) {
            document.getElementById('droplistFftSizes').value =1024;
        }
        
    }
    else { //horizontal bars//
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'none';
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'none';
        document.getElementById('initialRotationSliderDiv').style.display = 'none';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'none';
        document.getElementById('initialRadiusSliderDiv').style.display = 'none';
        document.getElementById('insetSliderDiv').style.display = 'none';

        document.getElementById('widthMultiplier').min = 0.1;
        document.getElementById('widthMultiplier').max = 10;
        document.getElementById('widthMultiplier').value = 1.333;
        document.getElementById('widthMultiplierTextInput').value = 1.333;

        document.getElementById('amplification').max = 10;
        document.getElementById('amplification').value = 1;
        document.getElementById('amplificationTextInput').value = 1;

        //  add fft size options
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="block";
    }
    updateParameters();
}
updateVisualizerType(); //to disable unnecessary elements at the start

let lastRequestId;

function reloadAnimation() {
    let audioContext = new AudioContext();
    window.cancelAnimationFrame(lastRequestId); //to cancel possible multiple animation request
    // console.log('reloadAnimation');
    if (typeof audioSource == 'undefined') { //without that condition there is an error on creating audioSource
        audioSource = audioContext.createMediaElementSource(audioPlayer);
        analyser = audioContext.createAnalyser(); // create node
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;    //data samples available - fftSize/2
    const dataArray = new Uint8Array(bufferLength);
    let x = 0;

    function animate() {
        // console.log(initialRadius);
        if (audioPlayer.paused) {
            // console.log('paused');
            return; //break the loop if paused
        }
        frameCounter += 1;
        frameTurn = rotationSpeed * frameCounter / 100;
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height); //clears previous frame
        canvas.width = window.innerWidth; //to restore possibly rotated canvas
        canvas.height = window.innerHeight; //to restore possibly rotated canvas
        setShadow(); //necessary to restore shadows after canvas resizing
        analyser.getByteFrequencyData(dataArray); //copies the current frequency data into a Uint8Array
        if (visualizerType == 'horizontal bars') {
            drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, dataArray);
        }
        else if (visualizerType == 'horizontal bars log') {
            drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, dataArray);
        }
        else if (visualizerType == 'radial bars') {
            drawVisualizerRadialBars(bufferLengthAfterCutoff, barWidth, dataArray);
        }
        else if (visualizerType == 'radial bars log') {
            drawVisualizerRadialBarsLog(bufferLengthAfterCutoff, barWidth, dataArray);
        }
        else if (visualizerType == 'polygons') {
            drawVisualizerPolygons(bufferLengthAfterCutoff, dataArray);
        }
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
function drawVisualizerHorizontalBars(bufferLengthAfterCutoff, x, barWidth, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = dataArray[i] * amplification * 4;
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
};

// HORIZONTAL BARS VISUALIZER - LOGARITHMIC SCALE
function drawVisualizerHorizontalBarsLog(bufferLengthAfterCutoff, x, barWidth, dataArray){
    for (let i = 0; i < bufferLengthAfterCutoff; i++){
        barHeight = Math.log(dataArray[i]) * amplification * 120;
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
    }
}

// RADIAL BARS VISUALIZER
function drawVisualizerRadialBars(bufferLengthAfterCutoff, barWidth, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        barHeight = dataArray[i] * amplification *2;
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        // console.log(initialRotation);
        ctx.rotate(Number(initialRotation * Math.PI * 2) + Number(frameTurn) + (turns * i * Math.PI * 2 / bufferLength));
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(0, 0, barWidth, barHeight);
        ctx.restore(); //to the ctx.save
    }
}

// RADIAL BARS VISUALIZER - LOGARITHMIC SCALE
function drawVisualizerRadialBarsLog(bufferLengthAfterCutoff, barWidth, dataArray){
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        barHeight = Math.log(dataArray[i]) * amplification * 60;
        ctx.save(); //canvas values to restore later
        ctx.translate(canvas.width/2, canvas.height/2); //move (0,0) to the center of canvas
        // ctx.rotate(turns * i * Math.PI * 2 / bufferLength); //full circle with rotates = 1
        ctx.rotate(Number(initialRotation * Math.PI * 2) + Number(frameTurn) + (turns * i * Math.PI * 2 / bufferLength));
        ctx.fillStyle = mixingColors(i, dataArray);
        ctx.fillRect(0, 0, barWidth, barHeight);
        ctx.restore(); //to the ctx.save
    }
}

// POLYGONS VISUALIZER
function drawVisualizerPolygons(bufferLengthAfterCutoff, dataArray){
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(Number(initialRotation * Math.PI * 2) + Number(frameTurn));
    
    ctx.translate(-canvas.width/2, -canvas.height/2);
    for (let i=0; i<(bufferLengthAfterCutoff); i++){
        ctx.strokeStyle = mixingColors(i, dataArray);
        radius = Number(initialRadius)* amplification + (i+1)/bufferLengthAfterCutoff * amplification * 500;
        // radius = Number(initialRadius)* amplification + (i+1)/bufferLengthAfterCutoff * amplification * 500 + 100*dataArray[i]/255;
        insetFinal = inset * (polygonsReactivenessFinal +  dataArray[i]/255);

        //THRESHOLD /255 - for glitchy lines when amplitude low
        if (dataArray[i] <= 1) {
            ctx.lineWidth = 0;
        }
        else {
        ctx.lineWidth = widthMultiplier/16 * amplification * (dataArray[i]/255) ;
        ctx.beginPath();
        ctx.save(); //creates snapshot of global settings
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.moveTo(0, 0 - radius); //center

        for (let j=0; j < polygonSymmetry; j++){
            ctx.rotate(Math.PI / polygonSymmetry);
            ctx.lineTo(0, 0 - (radius * insetFinal));
            ctx.rotate(Math.PI / polygonSymmetry);
            ctx.lineTo(0, 0 - radius);
        }

        ctx.closePath(); 
        ctx.stroke();//display 
        // ctx.fill();
        ctx.restore(); //to the ctx.save
        }
    }
}

// ______________________________SIDEBAR STUFF______________________________
let resizer = document.querySelector(".resizer");
let sidebar = document.querySelector(".sidebar");
let cwGlobal = 500; //has to be the same as sidebar width in css
let MaxSidebarX = window.innerWidth*0.9; //changes with refresh
let MinSidebarX = 250;
let resizerWidth = 7; //px as in CSS --resizerWidth

function initResizerFn( resizer, sidebar ) {
    // track current mouse position in x var
    let x, w;
    function rs_mousedownHandler( e ) {
        x = e.clientX;
        var sbWidth = window.getComputedStyle( sidebar ).width;
        w = parseInt( sbWidth, 10 );
        document.addEventListener("mousemove", rs_mousemoveHandler);
        document.addEventListener("mouseup", rs_mouseupHandler);
    }

    function rs_mousemoveHandler( e ) {
        let dx = e.clientX - x;
        let cw = w + dx; // complete width
        
        if ( cw >= MinSidebarX && cw <= MaxSidebarX ) {
            sidebar.style.width = `${ cw }px`;
            resizer.style.left = cw - resizerWidth + 'px';
            hideMenuButton.style.left = `${ cw }px`; //glue to bar
            audioContainer.style.left = `${ cw }px`; //glue to bar
            audioContainer.style.width = window.innerWidth - cw + 'px';
            openAudioButton.style.left = cw + 'px';
            cwGlobal = cw;
        }
        else if (cw < MinSidebarX) {
            cwGlobal = MinSidebarX;
        }
        else if (cw > MaxSidebarX) {
            cwGlobal = MaxSidebarX;

        }
    }

    function rs_mouseupHandler() {
    // remove event mousemove && mouseup
    document.removeEventListener("mouseup", rs_mouseupHandler);
    document.removeEventListener("mousemove", rs_mousemoveHandler);
    }

    resizer.addEventListener("mousedown", rs_mousedownHandler);
    // console.log('initResizerFn');
}
initResizerFn( resizer, sidebar );

let isSidebarHidden = false;
let isAudioHidden = false;

openMenuButton.addEventListener("click", openSidebarMenu);
function openSidebarMenu() {
    openMenuButton.style.display = 'none';
    audioContainer.style.left = cwGlobal + 'px';
    audioContainer.style.width = window.innerWidth - cwGlobal +'px'; //OK
    sidebar.style.width = cwGlobal + 'px';
    sidebar.style.display = 'block';
    resizer.style.left = cwGlobal - resizerWidth + 'px';
    resizer.style.display = 'block';
    hideMenuButton.style.left = cwGlobal + 'px';
    hideMenuButton.style.display = 'block';
    openAudioButton.style.left = cwGlobal + 'px';
    isSidebarHidden = false;
}

hideMenuButton.addEventListener("click", closeSidebarMenu);
function closeSidebarMenu () {
    sidebar.style.display = 'none';
    resizer.style.display = 'none';
    hideMenuButton.style.display = 'none';
    openAudioButton.style.left = `0rem`;
    //dont show the opening button if buttonsInvisible
    if (buttonsInvisible == true){
        openMenuButton.style.display = 'none';
    }
    else if (buttonsInvisible == false){
        openMenuButton.style.display = 'block';
    }
    audioContainer.style.left = '0rem';
    audioContainer.style.width = window.innerWidth + 'px';
    isSidebarHidden = true;
};

openAudioButton.addEventListener("click", openAudioContainer);
function openAudioContainer() {
    openAudioButton.style.display = 'none';
    audioContainer.style.display = 'block';
    isAudioHidden = false;
}

hideAudioButton.addEventListener("click", closeAudioContainer);
function closeAudioContainer () {
    audioContainer.style.display = 'none';
    openAudioButton.style.display = 'block';
    isAudioHidden = true;
    if (isSidebarHidden == false){
        openAudioButton.style.left = cwGlobal + 'px';
    }
    else if (isSidebarHidden == true){
        openAudioButton.style.left = 0 + 'px';
    }
    //dont show the opening button if buttonsInvisible
    if (buttonsInvisible == true){
        openAudioButton.style.display = 'none';
    }
    else if (buttonsInvisible == false){
        openAudioButton.style.display = 'block';
    }
};

//STARTING DISPLAY (CSS display : none WORKED BAD WITH THE hideShowCategoryElements)
document.getElementById('sidebarInsideCategoryElements2').style.display = 'none';
document.getElementById('sidebarInsideCategoryElements3').style.display = 'none';
document.getElementById('sidebarInsideCategoryElements4').style.display = 'none';

//CLICK ON CATEGORY NAME TO HIDE INSIDE ELEMENTS
let sidebarCategories = document.querySelectorAll(".sidebarCategory");
sidebarCategories.forEach(function(elem) {
    elem.addEventListener("click", hideShowCategoryElements);
});

function hideShowCategoryElements (event) {
    clickedElemId = event.target.id;
    if (clickedElemId.includes('sidebarCategory')){ //to disable hiding more inner elements
        targetsChildren = event.target.children;
        for (let i=0; i<(targetsChildren.length); i++){
            thisTarget = targetsChildren[i];
            if (thisTarget.id.includes('sidebarInsideCategoryElements')){
                // console.log(thisTarget.id);
                if (thisTarget.style.display != 'none') {
                    thisTarget.style.display = 'none';
                }
                else {
                    thisTarget.style.display = 'block';
                }
            }
        }
    }
};

//WINDOW RESIZING
window.addEventListener('resize', resizeWindow)
function resizeWindow (){
    // console.log('resizeWindow');
    MaxSidebarX = window.innerWidth*0.9;
    if (openMenuButton.style.display == 'block') {
        audioContainer.style.width = window.innerWidth + 'px';
    }
    else {
        audioContainer.style.left = cwGlobal + 'px';
        audioContainer.style.width = window.innerWidth - cwGlobal +'px';
    }
}
// ______________________________SIDEBAR STUFF______________________________

// ______________________________HOTKEYS______________________________
let buttonsInvisible = false;

document.onkeydown = function(e) {
    // console.log(e.which);

    // "ARROW UP" HOTKEY FOR SIDEBAR
    if (e.which == 38) { 
        e.preventDefault();
        if (isSidebarHidden == false) {
            closeSidebarMenu();
        }
        else {
            openSidebarMenu();
        }    
    } 

    // "ARROW DOWN" HOTKEY FOR AUDIO
    if (e.which == 40) { 
        e.preventDefault();
        if (isAudioHidden == false) {
            closeAudioContainer();
        }
        else {
            openAudioContainer();
        }    
    }

    // "SPACE" HOTKEY FOR PAUSING
    if (e.which == 32) {
        e.preventDefault(); //to prevent going to the end of the sidebar
        if (audioPlayer.paused) {
            audioPlayer.play();
        }
        else {
            audioPlayer.pause();
        }    
    }

    // "F11" HOTKEY FOR FULLSCREEN
    if (e.which == 122) { 
        e.preventDefault();
        document.documentElement.requestFullscreen();
    }

    // "SHIFT" HOTKEY FOR BUTTONS VISIBILITY 
    if (e.which == 16) {
        if (buttonsInvisible == false){
            if (isSidebarHidden == false){
                openMenuButton.style.display = 'none';
            }
            else if (isSidebarHidden == true){
                openMenuButton.style.display = 'none';
            }
            if (isAudioHidden == false){
                openAudioButton.style.display = 'none';
            }
            else if (isAudioHidden == true){
                openAudioButton.style.display = 'none';
            }
            buttonsInvisible = true;
        }

        else if (buttonsInvisible == true){
            if (isSidebarHidden == false){
                openMenuButton.style.display = 'none';
            }
            else if (isSidebarHidden == true){
                openMenuButton.style.display = 'block';
            }
            if (isAudioHidden == false){
                openAudioButton.style.display = 'none';
            }
            else if (isAudioHidden == true){
                openAudioButton.style.display = 'block';
            }
            buttonsInvisible = false;
        }
    }

    
};
// ______________________________HOTKEYS______________________________

// ______________________________BACKGROUND______________________________
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
// ______________________________BACKGROUND______________________________

//______________________________SHADOW______________________________
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
//______________________________SHADOW______________________________

//______________________________STARTING INFO DISPLAY______________________________
function setStartingInfo(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clears previous frame
    fontSizeWidth = Math.round(window.innerWidth/40);
    ctx.fillStyle = 'rgba(200,200,200,0.7)';
    ctx.textAlign = "center";
    ctx.shadowColor = 'rgba(250,250,250,0.1)';
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = fontSizeWidth/1.4;
    ctx.shadowBlur = 2;
    
    ctx.font = fontSizeWidth + 'px' + ' Audiowide';
    ctx.fillText('BROWSE AND PLAY A FILE TO RUN', canvas.width/2, canvas.height/4 - canvas.height/20);

    ctx.shadowOffsetY = fontSizeWidth/2;
    // ctx.font = "3rem Audiowide";
    fontSizeWidth = Math.round(window.innerWidth/70);
    ctx.font = fontSizeWidth + 'px' + ' Audiowide';
    const lineheight = window.innerHeight/14;
    const startingText = 'UP - sidebar \nDOWN - player\nF11 - fullscreen\nSPACE - play/pause\nSHIFT - opening buttons visibility\n Resize the sidebar by dragging its edge\nFocus the slider to change by the minimal value with side arrows';
    const lines = startingText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width/2, canvas.height/3 + canvas.height/20 + (i * lineheight));
    }
}
// ON LOAD, IN CASE THE API FONT DIDNT LOAD ALREADY
window.addEventListener('load', () => {
    setStartingInfo();
});
//______________________________STARTING INFO DISPLAY______________________________


//______________________________RELOAD SETTINGS DROLPIST______________________________
droplistLoad = document.getElementById('droplistLoad');
// console.log(droplistLoad);
//RETRIEVE ALL LOCAL STORAGE ITEMS
let localStorageItems = { ...localStorage };
//CHANGE RETRIEVED OBJECT TO ARRAY TO USE FOREACH
localStorageItemsNames = Object.keys(localStorageItems);
// console.log(localStorageItemsNames);

const reloadSettingsDroplist = (element, index) => {
    let option = document.createElement("option");
    option.text = element;
    droplistLoad.add(option, droplistLoad[index]);
};

localStorageItemsNames.forEach( reloadSettingsDroplist );
//______________________________RELOAD SETTINGS DROLPIST______________________________


//______________________________SAVE SETTINGS______________________________
const saveSettings = () => {
    let queryParameters = document.querySelectorAll(`[data-field]`);
    let settingsObject = {};
    const makePair = (element) => {
        if (element.type != 'text') { //EXCLUDE text input values
            // console.log(element.type);
            parameterName = element.dataset.field;
            parameterValue = element.value;
            //ASSIGN OBJECT'S KEY-VALUE PAIRS
            settingsObject[parameterName] = parameterValue;
        }
    }
    queryParameters.forEach(makePair);
    console.log(Object.keys(settingsObject).length); //object's length
    console.log(settingsObject);
    //SAVE TO LOCAL STORAGE
    settingsName = 'szet3';
    localStorage.setItem(settingsName, JSON.stringify(settingsObject));
}
// saveSettings();
//______________________________SAVE SETTINGS______________________________


//______________________________LOAD SETTINGS______________________________
const loadSettings = () => {
    //RETRIEVE ALL LOCAL STORAGE ITEMS
    let localStorageItems = { ...localStorage };

    // LOAD DROPLIST'S SELECTED SETTINGS AND PARSE TO JSON
    let loadTheseSettingsObject = JSON.parse(localStorageItems[droplistLoad.value]);
    loadTheseParamatersKeys = Object.keys(loadTheseSettingsObject);

    //QUERY DOM PARAMETERS
    let queryParameters = document.querySelectorAll(`[data-field]`);
    queryParameters.forEach( (queryElement) => {
        parameterFieldValue = queryElement.dataset.field;
        // console.log(parameterFieldValue);

        //AND FILL WITH LOADED VALUE
        loadTheseParamatersKeys.forEach( (loadElement) => {
            if (loadElement == parameterFieldValue){
                queryElement.value = loadTheseSettingsObject[loadElement];
                // console.log(queryElement.value);
            }
        });
    });
    updateParameters();
    updateFftSize();
    setBackground();
    setShadow();
    updateVisualizerType();
    reloadAnimation();

    console.log('LOADED');
};
loadButton = document.getElementById('loadButton');
loadButton.addEventListener('click', loadSettings);
//______________________________LOAD SETTINGS______________________________