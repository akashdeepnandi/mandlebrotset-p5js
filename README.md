# Mandelbrot Set Visualization

**Interactive, GPU-accelerated Mandelbrot fractal explorer built with p5.js and custom shaders.**
Responsive, mobile-friendly, and optimized for smooth zooming and panning.

---

## 🚀 Features

- **WebGL-powered fractal rendering** (GLSL shaders)
- **Dynamic iteration scaling** for crisp detail at all zoom levels
- **Smooth color gradients** (no banding)
- **Scroll/pinch to zoom** and **drag to pan** (desktop & mobile)
- **Modern control panel** with icon buttons
- **Responsive design**: works on desktop, tablet, and mobile
- **Max zoom: 500,000x** (with visual warnings)
- **Save high-res PNG snapshots**

---

## 📱 Controls

| Action            | Desktop                | Mobile        |
| ----------------- | ---------------------- | ------------- |
| Zoom              | Mouse wheel            | Pinch gesture |
| Pan               | Click & drag           | Touch & drag  |
| Iteration control | `+` / `-` keys         | —             |
| Save image        | `S` key or Save button | Save button   |
| Reset view        | Reset button           | Reset button  |

---

## 🖥️ UI Overview

- **Zoom Display**: Shows current zoom, iterations, and warnings
- **Control Info**: Quick reference for controls
- **Control Panel**: Icon buttons for Reset, Zoom In, Zoom Out, Save

---

## 🛠️ Project Structure

```
index.html         # Main HTML file (includes p5.js & CSS)
style.css          # Modern, responsive styles
sketch.js          # Main app logic (UI, controls, rendering)
mandlebrot.frag    # Fragment shader (fractal computation)
vert.vs            # Vertex shader (fullscreen quad)
README.md          # This documentation
```

---

## ⚡ Technical Highlights

- **GLSL Fragment Shader**: Fast, anti-aliased Mandelbrot computation
- **Dynamic Iteration Scaling**: 5-tier system (1K–20K iterations) for sharp zooms
- **Precision Management**: Prevents blur and artifacts at high zoom
- **Color Algorithm**: Linear mapping, 4.0x hue scale, 0.7 saturation
- **Mobile Touch Support**: Pinch-to-zoom, drag-to-pan, large touch targets
- **Responsive Layout**: 3:2 aspect ratio canvas, stacked UI, full-width controls

---

## ⚙️ How It Works

- **Canvas**: Responsive, fills screen width, maintains 3:2 aspect ratio
- **Zoom**: Scroll or pinch to zoom in/out, centered on cursor/fingers
- **Pan**: Drag to move the viewport
- **Max Zoom**: 500K limit, with warning and block if exceeded
- **Save**: Export current view as PNG

---

## 🧑‍💻 Customization

- **Iteration scaling**: Edit `baseIterations` and scaling logic in `sketch.js`
- **Color scheme**: Tweak hue/saturation in `mandlebrot.frag`
- **UI styling**: Update gradients, spacing, and breakpoints in `style.css`
- **Max zoom**: Change the 500K limit in `sketch.js` if needed

---

## 📦 Installation & Usage

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/mandelbrot-visualization.git
   cd mandelbrot-visualization
   ```
2. **Start a local server:**

   ```bash
   python3 -m http.server 8000
   ```

   or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code.

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

---

## 📝 License

MIT License.  
Feel free to use, modify, and share!

---

## 🙏 Credits

- [p5.js](https://p5js.org/)
- [GLSL](<https://www.khronos.org/opengl/wiki/Core_Language_(GLSL)>)
- Inspired by classic Mandelbrot visualizations

---

## 📷 Screenshots

_(Add screenshots of desktop and mobile views here)_

---

Enjoy exploring the infinite beauty of the Mandelbrot set!
