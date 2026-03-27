# Terminal Special Simulations

This document explains the special simulation words supported by the terminal `simulate` command.

## How To Run

Use the terminal command below:

```bash
simulate <word>
```

Examples:

```bash
simulate donut
simulate cnn
simulate linreg
```

Behavior:

- Simulation opens in full simulation mode (replaces normal terminal output).
- Move your mouse to interact with the active simulation.
- Press `Esc` to exit simulation mode.

## Supported Special Words

## `donut`

A rotating ASCII torus (donut) rendered with a 3D point cloud projection.

What it shows:

- Full 3D rotation and depth projection
- ASCII-based surface shading
- Mouse-guided camera steering

Why it exists:

- Fun reference simulation
- Demonstrates high-motion 3D ASCII rendering

## `cnn`

A compact convolutional neural network pipeline visualization.

What it shows:

- Layered network columns (input, conv, pool, dense, output)
- Activation stages (for example ReLU and Softmax)
- Animated packet flow between layers to represent forward propagation
- Connection mesh between neighboring layers

Why it exists:

- Makes model inference flow visible in real time
- Demonstrates space-conscious architecture rendering

## `linreg`

A 3D-inspired linear regression scene with scatter data and fitted plane.

What it shows:

- Scatter points as observed samples
- Fitted regression plane as the model surface
- Residual paths from measured points to predicted points
- Axis labels (`Horsepower`, `Weight`, `MPG`) and model hint text

Why it exists:

- Visually explains prediction vs error
- Demonstrates interactive model interpretation

## Non-Special Words

Any word not in the special list falls back to the generic word simulation mode.

Example:

```bash
simulate zigla
```

The typed word is rendered as large ASCII-styled text with subtle 3D motion and mouse-reactive depth.

## Extending Special Words

To add a new special simulation:

1. Add the special word key to the `SPECIAL_WORDS` map in `src/components/terminal/simulations/AsciiSimulation.tsx`.
2. Implement a dedicated drawing routine for the new simulation profile.
3. Route the new profile inside the simulation draw loop.
4. Update command guidance text in `src/components/terminal/useTerminal.tsx`.
