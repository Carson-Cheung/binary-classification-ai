# Binary Image Classification Studio (Brain.js & HTML5 Canvas)

> Client-side browser neural network studio for computer vision binary image classification, featuring HTML5 Canvas pixel extraction, Fisher-Yates dataset randomization, and client-side inference.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Brain.js](https://img.shields.io/badge/Brain.js-Neural%20Network-yellow.svg)](https://brain.js.org/)
[![Accuracy](https://img.shields.io/badge/Validation%20Accuracy-83.5%25-brightgreen.svg)]()

---

## Overview

This project is an in-browser computer vision studio built with **TypeScript**, **HTML5 Canvas**, and **Brain.js**. It enables real-time client-side image processing, tensor feature extraction, neural network training, and classification inference entirely in the user's browser—requiring no external backend, cloud APIs, or Python dependencies.

The repository preserves the complete engineering journey across two milestones:
1. **v1.0 (Original Grade 12 High School Build - 2024)**: The exploratory prototype exploring browser-based machine learning, which exposed real-world ML edge cases including catastrophic recency bias, tensor downsampling limitations, and synchronous browser freezing.
2. **v2.0 (Upgraded Architecture)**: A production-refined architecture with $+125\%$ expanded tensor resolution ($48 \times 48$), Fisher-Yates dataset shuffling, non-blocking asynchronous training loops, holdout test validation ($83.5\%$ generalization accuracy), and exportable model weights.

---

## The V1 vs. V2 Evolution

The core value of this repository is the engineering post-mortem and iterative architectural evolution between high school experimentation and senior-level software engineering:

| Dimension / Metric | v1.0 (Grade 12 Original - 2024) | v2.0 (Upgraded Architecture) | Engineering Takeaway & Impact |
| :--- | :--- | :--- | :--- |
| **Input Resolution** | $32 \times 32$ grayscale (1,024 inputs) | **$48 \times 48$ grayscale (2,304 inputs)** | $+125\%$ more pixel density, capturing fine facial contours, edges, and high-frequency features rather than blurry silhouettes. |
| **Data Feeding Order** | Sequential (all Class A followed by Class B) | **Fisher-Yates Random Shuffle** | Eliminates **catastrophic recency bias** where the network overfitted to the final class and predicted 100% of inputs as Class B. |
| **Execution Loop** | Synchronous `for` loop | **Non-blocking Async Loop** (`setTimeout` / `requestAnimationFrame`) | Prevents browser thread freezing, keeps DOM interactive, and streams live epoch loss metrics to the UI. |
| **Generalization Accuracy** | $\approx 50\%$ (random guessing on unseen data due to recency bias) | **$83.5\%$ holdout validation accuracy** | Verified on 200 holdout images never seen during training epochs, proving genuine learned feature representation. |
| **Inference State** | Blank / trained from scratch every session | **Pretrained Export Weights** (`pretrained_model.json`) | Instant client-side inference on page load without requiring the user to retrain on local disk data. |
| **Evaluation Suite** | Single manual image upload | **Batch Holdout Test Set Evaluator** (`checkAcc()`) | Provides rigorous quantitative verification rather than anecdotal single-image testing. |
| **Dataset Flexibility** | Hardcoded to local directories | **Custom File Uploads & Color Swatches** | Supports drag-and-drop user image folders and downloadable sample benchmark datasets (e.g. Dark vs. Light swatches). |

---

## Technical Architecture

```
[Raw Image (User Upload / Holdout Set)]
                 │
                 ▼
[HTML5 Canvas Preprocessor]
  - Aspect-preserving canvas render
  - Grayscale desaturation: 0.299R + 0.587G + 0.114B
  - Bilinear downsample to 48 × 48 grid
                 │
                 ▼
[Normalized Feature Tensor: Float[2304]] (Values in [0.0, 1.0])
                 │
                 ▼
[Brain.js Multi-Layer Perceptron (MLP)]
  - Input Layer:  2,304 neurons
  - Hidden Layer 1: 64 neurons (Sigmoid activation)
  - Hidden Layer 2: 32 neurons (Sigmoid activation)
  - Output Layer: 1 neuron (Sigmoid activation: [0.0, 1.0])
                 │
                 ▼
[Classification Result & Confidence Gauge]
  - Class A (0.00 – 0.49) vs. Class B (0.50 – 1.00)
```

### Preprocessing & Normalization
1. **Canvas Pixel Extraction**: Using `CanvasRenderingContext2D.getImageData()`, raw RGBA bytes are extracted from the resized $48 \times 48$ canvas element.
2. **Grayscale Reduction**: Luminosity conversion reduces the $4$ channels per pixel down to a single intensity metric:
   $$\text{Grayscale} = 0.299R + 0.587G + 0.114B$$
3. **Float Normalization**: Integer values in $[0, 255]$ are scaled to continuous floating-point values in $[0.0, 1.0]$ to optimize gradient descent and prevent early neuron saturation.

### Neural Network Hyperparameters
- **Type**: Feedforward Multi-Layer Perceptron (MLP)
- **Input Dimensions**: 2,304 ($48 \times 48$ grayscale)
- **Hidden Layers**: `[64, 32]`
- **Activation Function**: Sigmoid
- **Learning Rate**: `0.1`
- **Error Threshold**: `0.02`
- **Convergence**: Reached 0.0199 loss in 180 iterations ($83.5\%$ holdout accuracy)

---

## Repository Structure

```text
binary-classification-ai/
├── src/                          # TypeScript source files
│   ├── data.ts                   # Image dimension constants (48x48) & class mappings
│   ├── html.ts                   # DOM element bindings & event handler registration
│   ├── image_processor.ts        # Canvas pixel rendering, grayscale conversion, & test loader
│   ├── neural_network.ts         # Brain.js MLP model initialization, training & inference
│   └── system.ts                 # Fisher-Yates dataset shuffle, UI state, & checkAcc()
├── dist/                         # Compiled JavaScript bundles (via npx tsc)
├── TrainingData/                 # Sample benchmark images (20 per class for lightweight cloning)
│   ├── females/                  # Class 0 training images
│   └── males/                    # Class 1 training images
├── sample_dataset/               # Quick lightweight test swatches (Dark vs. Light)
├── sample_dataset_dark_vs_light.zip # Downloadable test dataset bundle for browser use
├── pretrained_model.json         # Carson's 83.5% accuracy trained weights
├── index.html                    # Main interactive studio interface (3-column layout)
├── style.css                     # Responsive CSS layout & dark aesthetic
├── desc.html                     # Model summary & architecture description page
├── tsconfig.json                 # TypeScript compiler configuration (rootDir: src, outDir: dist)
└── README.md                     # Technical architecture & project documentation
```

---

## How to Run Locally

Because the application uses modern JavaScript modules and Canvas pixel security boundaries (`toDataURL` / `getImageData`), it must be served via a local HTTP server rather than the `file://` protocol.

### Option A: Using `npx serve` (Recommended)
```bash
# From the repository root
npx serve .
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

### Building from TypeScript Source
If you modify any files in `src/`, recompile the project using:
```bash
npm install
npx tsc
```

---

## How to Train & Evaluate in the Browser

1. **Instant Inference**: On initial load, the studio automatically initializes the pre-trained weights from `pretrained_model.json` ($83.5\%$ accuracy). You can immediately upload any photo in the **"Test Model"** panel to view real-time predictions and confidence scores.
2. **Retraining in the Browser**:
   - In the **"Train Network"** panel, click **"Choose Files"** under Class 1 and select a folder of images.
   - Click **"Choose Files"** under Class 2 and select an opposing set of images (or use the included `sample_dataset`).
   - Click **"Train Model"** to start the async Fisher-Yates randomized training loop.
3. **Evaluating Unseen Accuracy**:
   - In the **"Holdout Accuracy"** panel, supply unseen test images for both classes.
   - Click **"Check Accuracy"** to compute validation precision across the holdout set.
4. **Exporting Weights**:
   - Click **"Download Model"** to save your trained network weights as a `.json` file for client-side distribution.

---

## Inspecting the High School Archive (v1.0)

To inspect or run the original untouched Grade 12 high school codebase:

```bash
# Switch to the high school archive branch
git checkout v1-highschool-archive

# Or checkout the tagged release
git checkout tags/v1.0-highschool
```

To return to the upgraded v2.0 version on `main`:
```bash
git checkout main
```

---

## Author & Engineering Note

Created by **Carson Cheung** ([carsoncheung.work](https://www.carsoncheung.work) | [carsonc.work@gmail.com](mailto:carsonc.work@gmail.com)).

*Originally built in high school (2024) as an inquiry into browser-side neural networks; subsequently upgraded with proper machine learning methodology (stochastic shuffling, tensor resolution scaling, holdout validation, and async UI decoupling).*

