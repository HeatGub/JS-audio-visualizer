// GLOBAL DECLARATIONS 
const container = document.getElementById('container');
const button = document.getElementById('button1');
const canvas = document.getElementById('canvas1');
const audioFileInput = document.getElementById('audioFileInput');
const rangeInputs = document.querySelectorAll('.slider input[type="range"]');
const textInputs = document.querySelectorAll('.slider input[type="text"]');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const audioPlayer = document.getElementById('audioPlayer');
//COLORPARAMETERS INIT -hardcoded for now
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

//AUDIO FILE HANDLING
audioPlayer.addEventListener('play', reloadAnimation);

audioFileInput.addEventListener('change', function(){
    const files = this.files;
    audioPlayer.src = URL.createObjectURL(files[0]);
    audioFileInput.style.boxShadow = 'none';
    audioFileInput.style.outline = 'none';
});

// ____________________SLIDER-INPUT PAIRS____________________
rangeInputs.forEach((el) => {
    el.addEventListener("input", updateField);
});

textInputs.forEach((el) => {
    el.addEventListener("change", updateField);
});

//UPDATE NUMBER INPUT BY SLIDER AND VICE-VERSA
function updateField(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    document
      .querySelectorAll(`[data-field="${field}"]`)
      .forEach((el) => (el.value = value));
    updateParameters();
    setBackground();
    setShadow();
}
// ____________________SLIDER-INPUT PAIRS____________________

// UPDATE VALUES FUNCTION
function updateParameters() {
    [amplification, widthMultiplier, highCutoff, turns, polygonSymmetry, polygonsReactiveness, inset, initialRadius, initialRotation, rotationSpeed, alphaRGB, lowMultiplierRed, highMultiplierRed, respMultiplierRed, lowMultiplierGreen, highMultiplierGreen, respMultiplierGreen, lowMultiplierBlue, highMultiplierBlue, respMultiplierBlue] 
    = [...rangeInputs].map((el) => el.value);
    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    barWidth = widthMultiplier * (canvas.width/fftSize*2);
    bufferLength = fftSize/2;
    highCutoff = fftSize/2 * highCutoff;
    bufferLengthAfterCutoff = bufferLength - highCutoff;
    polygonsReactivenessFinal = Number((1 - polygonsReactiveness).toFixed(3));
    // console.log('updateParameters');
}

//FFT UPDATE
droplistFftSizes.addEventListener('input', updateFftSize);
function updateFftSize() {
    fftSize = Math.floor(document.getElementById('droplistFftSizes').value);
    updateParameters();
    reloadAnimation();
}

//______________________________VISUALIZER TYPE______________________________
let resetSelectedParameters = true;

//EVENT LISTENER ON VISUALIZER TYPE - CHANGES BOOLEAN resetSelectedParameters to true
droplistVisualizers.addEventListener('input', () => {
    // change boolean value to reset widthMultiplier and amplification
    resetSelectedParameters = true;
    updateVisualizerType(resetSelectedParameters);
});

// update type and disable unnecessary sliders
function updateVisualizerType() {
    visualizerType = document.getElementById('droplistVisualizers').value;
    emptyDivForEvenNumberOfDivs = document.getElementById('emptyDivForEvenNumberOfDivs');

    // RADIALS _____________________
    if (visualizerType == 'radial bars' || visualizerType == 'radial bars log'){
        // PARAMETERS DISLPAY
        document.getElementById('turnsSliderDiv').style.display = 'block';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'none';
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'none';
        document.getElementById('initialRotationSliderDiv').style.display = 'block';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'block';
        document.getElementById('initialRadiusSliderDiv').style.display = 'none';
        document.getElementById('insetSliderDiv').style.display = 'none';

        //remove empty div if it exists already
        if (typeof(emptyDivForEvenNumberOfDivs) != 'undefined' && emptyDivForEvenNumberOfDivs != null)
        {
            emptyDivForEvenNumberOfDivs.remove();
        }

        // SET MAX/MIN
        document.getElementById('widthMultiplier').min = 0.01;
        document.getElementById('widthMultiplier').max = 50;
        document.getElementById('amplification').max = 10;

        // RESET PARAMS?
        if (resetSelectedParameters == true){
            document.getElementById('widthMultiplier').value = 0.5;
            document.getElementById('widthMultiplierTextInput').value = 0.5;
            document.getElementById('amplification').value = 1;
            document.getElementById('amplificationTextInput').value = 1;
        }

        //  add fft size options
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="block";
    }
    // POLYGONS _____________________
    else if (visualizerType == 'polygons'){
        // PARAMETERS DISLPAY
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'block';
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'block';
        document.getElementById('initialRotationSliderDiv').style.display = 'block';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'block';
        document.getElementById('initialRadiusSliderDiv').style.display = 'block';
        document.getElementById('insetSliderDiv').style.display = 'block';

        // SET MAX/MIN
        document.getElementById('widthMultiplier').min = 0.01;
        document.getElementById('widthMultiplier').max = 20;
        document.getElementById('amplification').max = 100;
        
        // RESET PARAMS?
        if (resetSelectedParameters == true){
            document.getElementById('amplification').value = 1;
            document.getElementById('amplificationTextInput').value = 1;
            document.getElementById('widthMultiplier').value = 10;
            document.getElementById('widthMultiplierTextInput').value = 10;
        }

        //  remove fft size options and change the value if it was too high
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="none";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="none";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="none";
        if (document.getElementById('droplistFftSizes').value >=1024) {
            document.getElementById('droplistFftSizes').value =1024;
        }

        // make empty div for even number of parameters - if it doesnt exist already
        if (typeof(emptyDivForEvenNumberOfDivs) == 'undefined' || emptyDivForEvenNumberOfDivs == null){
            const newDiv = document.createElement("div");
            const newContent = document.createTextNode("Hi there and greetings!");
            // newDiv.appendChild(newContent);
            newDiv.setAttribute("id", "emptyDivForEvenNumberOfDivs");
            newDiv.setAttribute("class", "sidebarElement");
            sidebarInsideCategoryElements1 = document.getElementById("sidebarInsideCategoryElements1");
            sidebarInsideCategoryElements1.insertBefore(newDiv, polygonSymmetrySliderDiv);
        }
    }
    // HORIZONTAL _____________________
    else { //horizontal bars//
        // PARAMETERS DISLPAY
        document.getElementById('turnsSliderDiv').style.display = 'none';
        document.getElementById('polygonSymmetrySliderDiv').style.display = 'none';
        document.getElementById('polygonsReactivenessSliderDiv').style.display = 'none';
        document.getElementById('initialRotationSliderDiv').style.display = 'none';
        document.getElementById('rotationSpeedSliderDiv').style.display = 'none';
        document.getElementById('initialRadiusSliderDiv').style.display = 'none';
        document.getElementById('insetSliderDiv').style.display = 'none';

        //remove empty div if it exists already
        if (typeof(emptyDivForEvenNumberOfDivs) != 'undefined' && emptyDivForEvenNumberOfDivs != null)
        {
            emptyDivForEvenNumberOfDivs.remove();
        }

        // SET MAX/MIN
        document.getElementById('widthMultiplier').min = 0.1;
        document.getElementById('widthMultiplier').max = 10;
        document.getElementById('amplification').max = 10;

        // RESET PARAMS?
        if (resetSelectedParameters == true){
            document.getElementById('widthMultiplier').value = 1.333;
            document.getElementById('widthMultiplierTextInput').value = 1.333;
            document.getElementById('amplification').value = 1;
            document.getElementById('amplificationTextInput').value = 1;
        }

        //  add fft size options
        document.getElementById('droplistFftSizes').querySelector("option[value='2048'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='4096'").style.display ="block";
        document.getElementById('droplistFftSizes').querySelector("option[value='8192'").style.display ="block";
    }
    updateParameters();
    // console.log('updateVisualizerType');
}
updateVisualizerType(); //to disable unnecessary elements at the start
//______________________________VISUALIZER TYPE______________________________

//______________________________RELOAD ANIMATION______________________________
let lastRequestId;

function reloadAnimation() {
    if (audioPlayer.src != '') {

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

        // RUN OR PAUSE FPS METER
        runOrPauseFpsChecks();

        function animate() {
            if (audioPlayer.paused) {
                // console.log('paused');
                // PAUSE FPS COUNTING
                pauseFpsChecks();
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

            // REQUEST ANIMATION FRAME AND SAVE ITS ID
            lastRequestId = window.requestAnimationFrame(animate);
            
        }
        // CALL ANIMATE ON ANIMATION RELOAD AND REQUEST ANIMATION FRAME FROM THE INSIDE
        animate();
    }; //if audioPlayer.src is not empty
};
//______________________________RELOAD ANIMATION______________________________

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
let cwGlobal = 500; //has to be the same as initialSidebarWidth in css
let maxSidebarX = window.innerWidth * 0.95; //changes with refresh
let minSidebarX = window.innerWidth * 0.10; //changes with refresh
let resizerWidth = 7; //px as in CSS --resizerWidth

// RESIZER
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
        
        if ( cw >= minSidebarX && cw <= maxSidebarX ) {
            sidebar.style.width = `${ cw }px`;
            resizer.style.left = cw - resizerWidth + 'px';
            hideSidebarButton.style.left = `${ cw }px`; //glue to bar
            audioContainer.style.left = `${ cw }px`; //glue to bar
            audioContainer.style.width = window.innerWidth - cw + 'px';
            openAudioButton.style.left = cw + 'px';
            cwGlobal = cw;
        }
        else if (cw < minSidebarX) {
            cwGlobal = minSidebarX;
        }
        else if (cw > maxSidebarX) {
            cwGlobal = maxSidebarX;
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

// OPEN SIDEBAR
openSidebarButton.addEventListener("click", openSidebarMenu);
function openSidebarMenu() {
    openSidebarButton.style.display = 'none';
    audioContainer.style.left = cwGlobal + 'px';
    audioContainer.style.width = window.innerWidth - cwGlobal +'px'; //OK
    sidebar.style.width = cwGlobal + 'px';
    sidebar.style.display = 'block';
    resizer.style.left = cwGlobal - resizerWidth + 'px';
    resizer.style.display = 'block';
    hideSidebarButton.style.left = cwGlobal + 'px';
    hideSidebarButton.style.display = 'block';
    openAudioButton.style.left = cwGlobal + 'px';
    isSidebarHidden = false;
}

// HIDE SIDEBAR
hideSidebarButton.addEventListener("click", closeSidebarMenu);
function closeSidebarMenu () {
    sidebar.style.display = 'none';
    resizer.style.display = 'none';
    hideSidebarButton.style.display = 'none';
    openAudioButton.style.left = `0rem`;
    //dont show the opening button if buttonsInvisible
    if (buttonsInvisible == true){
        openSidebarButton.style.display = 'none';
    }
    else if (buttonsInvisible == false){
        openSidebarButton.style.display = 'block';
    }
    audioContainer.style.left = '0rem';
    audioContainer.style.width = window.innerWidth + 'px';
    isSidebarHidden = true;
};

// OPEN AUDIO
openAudioButton.addEventListener("click", openAudioContainer);
function openAudioContainer() {
    openAudioButton.style.display = 'none';
    audioContainer.style.display = 'block';
    isAudioHidden = false;
}

// HIDE AUDIO
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
document.getElementById('sidebarInsideCategoryElements0').style.display = 'none';
// document.getElementById('sidebarInsideCategoryElements1').style.display = 'none';
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
    // maxSidebarX = window.innerWidth*0.95;
    maxSidebarX = window.innerWidth * 0.95; //changes with resize
    minSidebarX = window.innerWidth * 0.10; //changes with resize

    // IF SIDEBAR HIDDEN
    if (openSidebarButton.style.display == 'block') {
        audioContainer.style.width = window.innerWidth + 'px';
    }
    // IF SIDEBAR VISIBLE
    else {
        // WHEN SIDEBAR IS WIDER THAN WINDOW SHRINK IT TO 99% WINDOW'S WIDTH
        if (cwGlobal > maxSidebarX) {
            // sidebarShrinkedWidth = window.innerWidth*0.99;
            sidebar.style.width = `${ maxSidebarX }px`;
            resizer.style.left = maxSidebarX - resizerWidth + 'px';
            hideSidebarButton.style.left = `${ maxSidebarX }px`; //glue to bar
            audioContainer.style.left = `${ maxSidebarX }px`; //glue to bar
            audioContainer.style.width = window.innerWidth - maxSidebarX + 'px';
            openAudioButton.style.left = maxSidebarX + 'px';
            cwGlobal = maxSidebarX;

        }
        //SIDEBAR TOO NARROW
        else if (cwGlobal < minSidebarX) {
            sidebar.style.width = `${ minSidebarX }px`;
            resizer.style.left = minSidebarX - resizerWidth + 'px';
            hideSidebarButton.style.left = `${ minSidebarX }px`; //glue to bar
            audioContainer.style.left = `${ minSidebarX }px`; //glue to bar
            audioContainer.style.width = window.innerWidth - minSidebarX + 'px';
            openAudioButton.style.left = minSidebarX + 'px';
            cwGlobal = minSidebarX;
        }
        // SIDEBAR VISIBLE BUT IN GOOD WIDTH RANGE
        else {
            audioContainer.style.left = cwGlobal + 'px';
            audioContainer.style.width = window.innerWidth - cwGlobal +'px';
        }
    }
};
// ______________________________SIDEBAR STUFF______________________________

// ______________________________HOTKEYS______________________________
let buttonsInvisible = false;
let hotkeysDisabled = false;

document.onkeydown = function keyPressed (e) {
    if (hotkeysDisabled == false) {
        // KEY CODE
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
            // CHECK IF THERE IS A SOURCE TO PLAY AND PREVENT INIT INFO DISAPPEARANCE IF THERE IS NOT
            // THERE IS AN ERROR ON PAUSE REQUEST WITHOUT AUDIO SOURCE
            if (audioPlayer.src != '') {
                e.preventDefault(); //to prevent going to the end of the sidebar
                if (audioPlayer.paused) {
                    audioPlayer.play();
                }
                else {
                    audioPlayer.pause();
                }
            }
            else {
                alert('Upload a sound file to play it.\nGENERAL -> Sound File -> Choose File -> Play');
            };
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
                    openSidebarButton.style.display = 'none';
                }
                else if (isSidebarHidden == true){
                    openSidebarButton.style.display = 'none';
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
                    openSidebarButton.style.display = 'none';
                }
                else if (isSidebarHidden == true){
                    openSidebarButton.style.display = 'block';
                }
                if (isAudioHidden == false){
                    openAudioButton.style.display = 'none';
                }
                else if (isAudioHidden == true){
                    openAudioButton.style.display = 'block';
                }
                buttonsInvisible = false;
            }
        };

        // "CTRL" FOR FPS METER
        if (e.which == 17) { 
            if (isFpsHidden == false) {
                fpsContainer.style.display = 'none'
                isFpsHidden = true;
            }
            else {
                fpsContainer.style.display = 'block'
                isFpsHidden = false;
            }    
        };
    }  
};

//FOCUS AND UNFOCUS EVENTS FOR  saveTextInput - DISABLING HOTKEYS
document.getElementById('saveTextInput').addEventListener('focus', function() {
    hotkeysDisabled = true;
});
document.getElementById('saveTextInput').addEventListener('focusout', function() {
    // console.log('input outfocused.');
    hotkeysDisabled = false;
});
// ______________________________HOTKEYS______________________________

// ______________________________BACKGROUND______________________________
colorInput1.addEventListener('input', setBackground);
colorInput2.addEventListener('input', setBackground);
droplistBackgrounds.addEventListener('input', setBackground);

function setBackground() {
    // LINEAR
    if (document.getElementById('droplistBackgrounds').value == 'linear'){
        document.getElementById('gradAngleSliderDiv').style.display = 'block';
        container.style.background = 'linear-gradient(' + document.getElementById('gradAngle').value +'deg, ' + colorInput2.value + ' ' + gradPosition1.value + '%, ' + colorInput1.value + ' ' + gradPosition2.value + '%)';
    }
    // RADIAL
    else {
        document.getElementById('gradAngleSliderDiv').style.display = 'none';
        container.style.background = 'radial-gradient(circle, ' + colorInput1.value + ' ' + gradPosition1.value + '%, ' + colorInput2.value + ' ' + gradPosition2.value + '%)';
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
    ctx.fillText('BROWSE AND PLAY A FILE TO RUN', canvas.width/2, canvas.height/5);

    ctx.shadowOffsetY = fontSizeWidth/2;
    // ctx.font = "3rem Audiowide";
    fontSizeWidth = Math.round(window.innerWidth/70);
    ctx.font = fontSizeWidth + 'px' + ' Audiowide';
    const lineheight = window.innerHeight/14;
    const startingText = 'UP - sidebar \nDOWN - player\nF11 - fullscreen\nCTRL - FPS visibility\nSPACE - play/pause\nSHIFT - opening buttons visibility\n Resize the sidebar by dragging its edge\nFocus the slider to change by the minimal value with side arrows';
    const lines = startingText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width/2, canvas.height/5 + canvas.height/8 + (i * lineheight));
    }
}
// ON LOAD, IN CASE THE API FONT DIDNT LOAD ALREADY
window.addEventListener('load', () => {
    setStartingInfo();
});
//______________________________STARTING INFO DISPLAY______________________________

//arrow functions from here
//______________________________RELOAD SETTINGS DROLPIST______________________________
droplistLoad = document.getElementById('droplistLoad');
// console.log(droplistLoad);

const reloadLoadDroplist = () => {
    //RETRIEVE ALL LOCAL STORAGE ITEMS
    let localStorageItems = { ...localStorage };
    //CHANGE RETRIEVED OBJECT TO ARRAY TO USE FOREACH
    localStorageItemsNames = Object.keys(localStorageItems);
    // console.log(localStorageItemsNames);
    //CLEAR THE LIST FIRST
    droplistLoad.innerHTML = "";
    const addLoadDroplistElement = (element, index) => {
        let option = document.createElement("option");
        option.text = element;
        droplistLoad.add(option, droplistLoad[index]);
    };

    localStorageItemsNames.forEach( addLoadDroplistElement );
};
reloadLoadDroplist();
//______________________________RELOAD SETTINGS DROLPIST______________________________

// DISAPPEARING MESSAGE FUNCTION
const showDisappearingMessage = (elementsId, settings, message, timer) => {
    // elementsId.innerHTML = message + ' ' + settings + '.';
    elementsId.innerHTML = message + settings + '.';
    setTimeout(() => {
        // check if it's not the next message about to be deleted
        if (elementsId.innerHTML.includes(message) ) {
            elementsId.innerHTML = '';
        }
    }, timer);
};

//______________________________SAVE SETTINGS______________________________
saveTextInput = document.getElementById(`saveTextInput`);
saveButton = document.getElementById(`saveButton`);

const saveSettingsInitiation = () => {
    let queryParameters = document.querySelectorAll(`[data-field]`);
    let settingsObject = {};
    const makeKeyValuePair = (element) => {
        if (element.type != 'text') { //EXCLUDE text input values
            parameterName = element.dataset.field;
            parameterValue = element.value;
            //ASSIGN OBJECT'S KEY-VALUE PAIRS
            settingsObject[parameterName] = parameterValue;
        }
    }
    // queryParameters.forEach(makeKeyValuePair);
    settingsName = saveTextInput.value;
    // NAME MUST NOT BE EMPTY
    if (settingsName.length <=0) {
        overwriteMessage.innerHTML = 'Enter a name to save';
    }
    else {
        //CHECK IF NAME IS TAKEN (nameTaken)
        let nameTaken = '';
        overwriteMessage.innerHTML = '';
        for (i=0; i<droplistLoad.length; i++) {
            // console.log(droplistLoad[i].value);
            if (droplistLoad[i].value == settingsName) {
                //NAME TAKEN
                nameTaken = droplistLoad[i].value
            };
        };

        // IF NAME TAKEN
        if (nameTaken.length > 0) {
            overwriteMessage.innerHTML = 'Overwrite ' + nameTaken + '?';
            // DISPLAY YES OR NO CONTAINER
            saveContainer.style.display = 'none';
            saveYesNoContainer.style.display = 'flex';
            // DISABLE INPUT
            saveTextInput.disabled = true;

            // NO BUTTON - CANCEL SAVING
            saveNoButton.onclick = () => {
                saveContainer.style.display = 'flex';
                saveYesNoContainer.style.display = 'none';
                overwriteMessage.innerHTML = '';
                // ENBLE INPUT
                saveTextInput.disabled = false;
                // console.log('saveNoButton');
            };

            // YES BUTTON - SAVE AFTER CONFIRMATION - OVERWRITE
            saveYesButton.onclick = () => {
                queryParameters.forEach(makeKeyValuePair);
                localStorage.setItem(settingsName, JSON.stringify(settingsObject));
                saveContainer.style.display = 'flex';
                saveYesNoContainer.style.display = 'none';
                // overwriteMessage.innerHTML = '';
                // ENBLE INPUT
                saveTextInput.disabled = false;
                reloadLoadDroplist();
                showDisappearingMessage(overwriteMessage, settingsName, 'Saved as ', 1000);
                droplistLoad.value = settingsName;
            };
        }

        //IF NAME AVAILABLE - SAVE TO LOCAL STORAGE
        else {
            queryParameters.forEach(makeKeyValuePair);
            localStorage.setItem(settingsName, JSON.stringify(settingsObject));
            // console.log('SAVE TO LOCAL STORAGE - ' + settingsName);
            saveContainer.style.display = 'flex';
            // overwriteMessage.innerHTML = '';
            reloadLoadDroplist();
            showDisappearingMessage(overwriteMessage, settingsName, 'Saved as ', 1000);
            droplistLoad.value = settingsName;
        }
    }
}
saveButton.addEventListener('click', saveSettingsInitiation);
//______________________________SAVE SETTINGS______________________________

//______________________________LOAD SETTINGS______________________________
const loadSettings = () => {
    //RETRIEVE ALL LOCAL STORAGE ITEMS
    let localStorageItems = { ...localStorage };

    // LOAD DROPLIST'S SELECTED SETTINGS AND PARSE TO JSON
    let theseSettings = droplistLoad.value;
    // check if there is anything on the list to load
    if (theseSettings) {
        try {
            let loadTheseSettingsObject = JSON.parse(localStorageItems[theseSettings]);
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

            // updateParameters();
            resetSelectedParameters = false;
            updateVisualizerType(resetSelectedParameters);
            updateFftSize();
            setBackground();
            setShadow();
            reloadAnimation();

            //show msg and fill saveTextInput with a loaded value
            showDisappearingMessage(loadDeleteMessage, droplistLoad.value, 'Loaded ', 1000);
            saveTextInput.value = [theseSettings];
            // console.log('LOADED');
            loadButton.style.boxShadow = 'none';
            loadButton.style.outline = '1px solid var(--textColorCategory)';
        }
        catch (error) {
            showDisappearingMessage(loadDeleteMessage, error, 'Error: ', 4000);
        };
    }
    else {
        showDisappearingMessage(loadDeleteMessage, '', 'Settings list is empty', 2000);
    };
};
loadButton = document.getElementById('loadButton');
loadButton.addEventListener('click', loadSettings);
//______________________________LOAD SETTINGS______________________________

//______________________________DELETE SETTINGS______________________________
const deleteSettingsInitiation = () => {

    selectedSettings = droplistLoad.value;
    // check if there is anything on the list to delete
    if (selectedSettings) {
        loadDeleteContainer.style.display = 'none';
        loadDeleteMessage.innerHTML = 'Delete ' + selectedSettings + '?';
        deleteYesNoContainer.style.display = 'flex';

        //event handler onclick here, adding many EventListeners would fire yes/no functions many times
        deleteYesButton.onclick = () => {
            //DELETE
            localStorage.removeItem(selectedSettings);
            reloadLoadDroplist();

            showDisappearingMessage(loadDeleteMessage, selectedSettings, 'Deleted ', 1000);

            loadDeleteContainer.style.display = 'flex';
            // loadDeleteMessage.innerHTML = '';
            deleteYesNoContainer.style.display = 'none';

        };

        //event handler
        deleteNoButton.onclick = () => {
            loadDeleteContainer.style.display = 'flex';
            loadDeleteMessage.innerHTML = '';
            deleteYesNoContainer.style.display = 'none';
        };
    }
    else {
        showDisappearingMessage(loadDeleteMessage, '', 'Settings list is empty', 2000);
    };
};

deleteButton = document.getElementById('deleteButton');
deleteButton.addEventListener('click', deleteSettingsInitiation);
//______________________________DELETE SETTINGS______________________________

//______________________________ EXPORT JSON ______________________________
// EXPORT ALL THE SAVED SETTINGS
const ExportSettingsInitiation = () => {
    //RETRIEVE ALL LOCAL STORAGE ITEMS
    let localStorageItems = { ...localStorage };
    let localStorageKeys = Object.keys(localStorageItems);

    // IF LOCAL STORAGE IS EMPTY CANCEL EXPORTING
    if (localStorageKeys.length === 0) {
        showDisappearingMessage(exportMessage, '', 'No settings to export', 2000);
    }
    else{
        const saveTemplateAsFile = (fileName, dataObjToWrite) => {
            const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
            const link = document.createElement("a");
        
            link.download = fileName;
            link.href = window.URL.createObjectURL(blob);
            link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
        
            const evt = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            // remove link
            link.dispatchEvent(evt);
            link.remove()
            };
            //Append date to a file name
            let date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let fileToSaveName = "Visualizer " + `${year}-${month}-${day}` + ".json";
        
        saveTemplateAsFile(fileToSaveName, localStorageItems);
    };
};
document.getElementById('exportButton').addEventListener('click', ExportSettingsInitiation);
//______________________________ EXPORT JSON ______________________________

//______________________________ IMPORT JSON ______________________________
document.getElementById('jsonFileInput').addEventListener("change", function() {
    let fileToRead = document.getElementById("jsonFileInput").files[0];
    let fileReader = new FileReader();
    let importNoButton = document.getElementById("importNoButton");
    let importYesButton = document.getElementById("importYesButton");
    
    // ON FILE LOAD FUNCTION
        fileReader.onload = function(e) {
            // IF FILE IS ALL GOOD
            try {
                let content = e.target.result;
                let parsedImportJSON = JSON.parse(content); // parse json
                let importedKeys = Object.keys(parsedImportJSON);
                let localStorageItems = { ...localStorage };
                let localStorageKeys = Object.keys(localStorageItems);
                let keysAlreadyTakenList = []; 

                // A. IF LOCAL STORAGE IS EMPTY
                if (localStorageKeys.length === 0) {
                    importedKeys.forEach ( (importedElement) => {
                        localStorage.setItem(importedElement, parsedImportJSON[importedElement]);
                    } );
                    reloadLoadDroplist();
                    showDisappearingMessage(importMessage, fileToRead.name, 'Imported: ', 3000);
                }

                // B. IF LOCAL STORAGE HAS SOME SETTINGS
                else {
                    // CHECK WHICH KEYS ARE ALREADY TAKEN
                    importedKeys.forEach ( (importedElement) => {
                        localStorageKeys.forEach ( (localElement) => {
                            if (importedElement === localElement) {
                                keysAlreadyTakenList.push(localElement);
                            };
                        });
                    });

                    // IF SOME KEYS ARE TAKEN
                    if (keysAlreadyTakenList.length >= 1) {
                        importMessage.innerHTML = 'Overwrite (' + keysAlreadyTakenList + ')?';
                        importYesNoContainer.style.display = 'flex';

                        // B1. DONT IMPORT DOUBLED KEYS
                        importNoButton.onclick = () => {
                            importedKeys.forEach ( (importedElement) => {
                                keyDoubled = false;
                                keysAlreadyTakenList.forEach ( (keyTakenElement) => {
                                    if (importedElement === keyTakenElement) {
                                        keyDoubled = true;
                                    };
                                });
                                if (keyDoubled === false) {
                                    localStorage.setItem(importedElement, parsedImportJSON[importedElement]);
                                };
                            });
                            reloadLoadDroplist();
                            showDisappearingMessage(importMessage, fileToRead.name, 'Imported (non-overwrite): ', 3000);
                            importYesNoContainer.style.display = 'none';
                        };

                        // B2. OVERWRITE DOUBLED KEYS
                        importYesButton.onclick = () => {
                            importedKeys.forEach ( (importedElement) => {
                                localStorage.setItem(importedElement, parsedImportJSON[importedElement]);
                            } );
                            reloadLoadDroplist();
                            showDisappearingMessage(importMessage, fileToRead.name, 'Imported (overwrite): ', 3000);
                            importYesNoContainer.style.display = 'none';
                        };
                    } // IF SOME KEYS ARE TAKEN - end
                    
                    // KEYS ARE NOT TAKEN AND STORAGE IS NOT EMPTY
                    else {
                        importedKeys.forEach ( (importedElement) => {
                            localStorage.setItem(importedElement, parsedImportJSON[importedElement]);
                        } );
                        reloadLoadDroplist();
                        showDisappearingMessage(importMessage, fileToRead.name, 'Imported: ', 3000);
                    };
                }; // B. IF LOCAL STORAGE HAS SOME SETTINGS - end
            }
            // IF FILE IS WRONG
            catch (error) {
            showDisappearingMessage(importMessage, error, 'Error: ', 4000);
            };
        };
    fileReader.readAsText(fileToRead);
});
//______________________________ IMPORT JSON ______________________________

//______________________________ SAMPLE PRESETS ______________________________
addSamplePresetsButton = document.getElementById('addSamplePresetsButton');
removeSamplePresetsButton = document.getElementById('removeSamplePresetsButton');
samplePresetsMessage = document.getElementById('samplePresetsMessage');
let sampleKeysList = [];

// INITIALIZE KEYS TO POSSIBLY REMOVE THEM IF ALREADY IN STORAGE
const initializeSampleSettingsKeys = () => {
fetch('./sampleSettings.json')
    .then((response) => response.json())
    .then((sampleSettingsObject) => {
        sampleSettingsKeys = Object.keys(sampleSettingsObject);
        sampleSettingsKeys.forEach( (sampleKey) => {
            sampleKeysList.push(sampleKey);
        } );
    });
};
initializeSampleSettingsKeys();

//FETCH THE FILE AND IMPORT SAMPLE PRESETS
const importSampleSettings = () => {
fetch('./sampleSettings.json')
    .then((response) => response.json())
    .then((sampleSettingsObject) => {
        sampleSettingsKeys = Object.keys(sampleSettingsObject);
        sampleSettingsKeys.forEach( (sampleKey) => {
            localStorage.setItem(sampleKey, sampleSettingsObject[sampleKey]);
        } );
        reloadLoadDroplist();
        showDisappearingMessage(samplePresetsMessage, '', 'Added sample settings', 2000);
    });
    //REMOVE HIGHLIGHT ON ADD SAMPLE PRESETS BUTTON
    addSamplePresetsButton.style.boxShadow = 'none';
    addSamplePresetsButton.style.outline = '1px solid var(--textColorCategory)';
    //ADD HIGHLIGHT ON LOAD BUTTON
    loadButton.style.boxShadow = '0 0 15px var(--shadowColorCategory)';
    loadButton.style.outline = '2px solid var(--shadowColorCategory)';
};
addSamplePresetsButton.addEventListener('click', importSampleSettings);

//DELETE SAMPLE PRESETS FROM THE LIST
const deleteSampleSettings = () => {
    sampleKeysList.forEach ( (sampleKey) => {
        // console.log(sampleKey);
        localStorage.removeItem(sampleKey);
    });
    reloadLoadDroplist();
    showDisappearingMessage(samplePresetsMessage, '', 'Removed sample settings', 2000);
};
removeSamplePresetsButton.addEventListener('click', deleteSampleSettings);
//______________________________ SAMPLE PRESETS ______________________________

//______________________________ FPS METER ______________________________
// CALL FUNCTION EVERY timeInterval  AND CALCULATE FramesPerSecond
fpsValue =document.getElementById('fpsValue');
let lastframeCounter = frameCounter;
const timeInterval = 250;
let isFpsHidden = false;

//function for SetInterval calling
const calculateCurrentFps = () => {
    framesDifference = frameCounter - lastframeCounter;
    lastframeCounter = frameCounter;
    fps = framesDifference * (1000/timeInterval);
    fpsValue.innerHTML = fps;
    // target color for 60FPS is rgb(16, 236, 148). Target for 0FPS is red:
    color = 'rgb(' + (256-fps*4) + ', ' + (56 + fps*3) + ', ' + (28+fps*2);
    fpsValue.style.color = color;
    // console.log('calculateCurrentFps');
};

const pauseFpsChecks = () => {
    clearInterval(runFpsChecks);
    fpsValue.innerHTML = '-';
    fpsValue.style.color = 'var(--textColorVariable)';
    // console.log('pauseFpsChecks');
};

//  FPS SETITNG AND PAUSING FUNCTION - IT'S CALLED INSIDE reloadAnimation()
const runOrPauseFpsChecks = () => {
    // CHECK IF INTERVAL IS ALREADY SET. IF IT IS - PAUSE IT
    if (typeof runFpsChecks !== 'undefined'){
        // FIRST CANCEL OLD INTERVAL
        pauseFpsChecks();
        //THEN EVERY timeInterval (250ms) call calculateCurrentFps
        runFpsChecks = setInterval(calculateCurrentFps, timeInterval);
    }

    // IF THE INTERVAL IS NOT SET - RUN IT:
    else {
        //EVERY timeInterval (250ms) call calculateCurrentFps
        runFpsChecks = setInterval(calculateCurrentFps, timeInterval);
    }
};

//______________________________ FPS METER ______________________________