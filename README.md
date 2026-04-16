Portfolio

# Kareem Muftee — Portfolio

A single-page portfolio focused on building immersive, interactive UI using HTML Canvas and experimental rendering techniques.

👉 Live: https://www.kareemmuftee.com/

---


## About

This portfolio is an exploration of moving beyond traditional DOM + CSS-driven UI.

Instead of relying entirely on standard layout and rendering patterns, parts of this project experiment with more direct control over visuals, motion, and interaction — inspired by tools like Pretext by Cheng Lou.

The goal was to build something that feels less like a static website and more like a dynamic system.

---

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** v3
- **Framer Motion** v11
- **HTML Canvas** (all physics + creative rendering)
- **Pretext (inspiration / experimental patterns)**

---

## Sections & Effects

| Section | Interaction |
|--------|------------|
| **Hero** | 3D Fibonacci sphere generated from name characters, with mouse drag + inertia |
| **About** | Text ripple field — cursor creates wave distortions across characters |
| **Skills** | Verlet rope physics — keywords behave like hanging objects with gravity + mouse interaction |
| **Work** | Project cards layered over obstacle-flow text background |
| **Contact** | Galaxy-style text vortex with trailing particles and dynamic center shift |

---

## Key Concepts

- Physics-based UI using Canvas (instead of DOM layout)
- Interactive systems driven by user input (mouse, motion)
- Moving beyond static components into dynamic rendering
- Experimenting with precomputed / controlled layout patterns

---

## Run Locally

```bash
npm install
npm run dev

Then open: http://localhost:5173

Build
npm run build
npm run preview

