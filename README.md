# CPSC 314 Assignment 4

This project was created for my CPSC 314 (Computer Graphics) course at UBC. It explores advanced real-time rendering techniques using Three.js and WebGL ES 3.0, showcasing my understanding of scene management, shading, procedural animation, and multipass rendering.

🔧 Environment

Three.js – JavaScript library for 3D rendering

WebGL ES 3.0

GLSL – Custom vertex and fragment shaders

🧪 Features & Scenes

1. **Main Scene: Shadow Mapping & Procedrual Noise**

Skybox: A dynamic cube-mapped environment simulating a panoramic sky.

Procedural Noise Terrain: I used perlin noise to generate the patches on the cow.

Multipass Rendering:

Implemented a custom shadow mapping pipeline using depth rendering from a light's perspective.

Combined with soft shadows via percentage-closer filtering techniques.

Real-time Lighting: Custom shader includes Blinn-Phong lighting integrated with shadow lookups.

2. Scene: Environment Mapping

Reflective Sphere: Demonstrates real-time environment reflections using cube mapping techniques.

Dynamic Camera & Light: The object reflects its surroundings in real time as you orbit the scene.

3. Feature Extension: Procedural Animation

A floating reflective object (or animated mesh) moves in a looping motion using sine functions.

Highlights time-based transformations and dynamic material updates.

These elements combine core topics from graphics theory with modern shader techniques to simulate rich, interactive environments.

🕹️ Instructions

Open A4.html in a browser using a local server (e.g., VSCode Live Server).

Use number keys 1, 2, 3 to switch between the scenes.

Explore shadows, reflections, and animated effects!

🎥 Demo

Watch the video walkthrough (Click the picture):
[![CPSC 314 A4 Demo-封面](https://youtu.be/taLj9u7U3R0)
