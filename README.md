# Audio Visualizer (vanilla JS, CSS, HTML)
## Overview
- **Choose** your audio file and **play** it to create frequencies visualization
- Contol elements' display with **keyboard hotkeys**
- You can find this project hosted at **https://heatgub.github.io/JS-audio-visualizer/** (quick instruction included)

## 5 types of visualizers:
- **Polygons**
- **Radial bars**
- **Radial bars** (logarithmic amplitude scale)
- **Horizontal bars**
- **Horizontal bars** (logarithmic amplitude scale)

Depending on which you choose, there are different parameters to control. Polygons and radial bars may have rotation speed.

## Sidebar categories

## Performance
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