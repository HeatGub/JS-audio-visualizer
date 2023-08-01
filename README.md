# Audio Visualizer (vanilla JS, CSS, HTML)
### You can find this project hosted at **https://heatgub.github.io/JS-audio-visualizer/**
## Overview
- **Choose** your audio file and **play** it to create frequencies visualization
- Set parameters and **save** them as setting
- **Export/Import** all of your settings to **.json** file
- Import **sample settings** with one click
- Contol elements' display with **keyboard hotkeys**

## Quick start
1. **Open** https://heatgub.github.io/JS-audio-visualizer/
2. **Load** your audio (GENERAL &rarr; Sound file &rarr; Browse)
3. **Play** (SPACE or click on the player)
4. **Import Sample Settings** (LOAD/SAVE &rarr; Sample Settings &rarr; ADD)
5. **Load** one of the added **settings** (LOAD/SAVE &rarr; Settings &rarr; LOAD)

## 3 main types of visualizers:
- **Polygons**
- **Radial bars** (with logarithmic amplitude scale option)
- **Horizontal bars** (with logarithmic amplitude scale option)

<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/899be414-d1bc-4f1a-b296-9884fbe033d4" width=90%
</p>

## Settings management:
- **LOAD/SAVE** sidebar category
- Set parameters and **save** them as **setting**
- **Export/Import** all of your settings to **.json** file
- Import or remove **sample settings** with one click

<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/54408e3d-1566-4ef5-82a7-4a110360b0a2" width=90%
</p>

## Controls
- **Browse** and **play** a file to run (GENERAL &rarr; Sound file &rarr; Browse)
- **Resize** the **sidebar** by dragging its edge
- Set slider value with **number input**
- *Focus the slider to change by the minimal value with side arrows*
- *mouse over a parameter to display its description*

#### Hotkeys
- **UP** - show/hide sidebar 
- **DOWN** - show/hide player
- **F11** - fullscreen on/off
- **SPACE** - play/pause audio
- **CTRL** - FPS visibility
- **SHIFT** - opening buttons visibility

<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/5554eab8-2125-4ca0-b568-66a38609ccfa" width=90%
</p>

Depending on which you choose, there are different parameters to control. Polygons and radial bars may have rotation speed.

## Performance
- Use **FPS meter** (CTRL) to check the performance.
- Most **demanding** is **polygons** mode, the rest should go fast even on mobile devices
- Since JS is executed at **user's device**, it depends on its capabilities
- Especially complex shapes with many lines (large FFT size) and high area of drawing are computationally expensive
- ***Lower down the slider value if you experience lags***

#### Highest computation cost parameters:
- **FFT size** - Since FFT size/2 = bars(lines) amount
- **Width Multiplier** - Lower this first (polygons)
- **Polygon Symmetry**
- **Inset Modifier** - Negative inset with high amplification gives incredible shapes (along with incredible FPS drops ocasionally ;))
- **Amplification** - If lines are especially dense in the middle
- **Shadow** - Initially shadow's alpha=0 so it's not visible, therefore it's not taking resources. Shadow's blur is expensive.

## Thanks
To [Frankslaboratory](https://www.youtube.com/@Frankslaboratory) for inspiring and teaching me to do this project.

## Screenshots
<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/7227f3d5-c847-41f5-9d29-6af1e42b445b" width=100%
</p>

<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/9d168aa6-88c0-45da-8034-dab1cc665431" width=100%
</p>

<p align="center">
<img src="https://github.com/HeatGub/JS-audio-visualizer/assets/115884941/3935a5f7-9c9c-400c-b75d-d23be7c8fded" width=100%
</p>


## GL & HF