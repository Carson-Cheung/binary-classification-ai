=== Dark vs Light Color Swatch Dataset ===
Binary Classification Experiment Dataset for Brain.js Neural Network Studio

Structure:
- Class_A_Dark/ : 20 dark color swatch images (charcoal, navy, deep brown, forest green, deep purple, etc.)
- Class_B_Light/: 20 light color swatch images (white, ivory, cream, pastel yellow, sky blue, etc.)
- Test_Samples/ : 6 holdout evaluation swatches (3 dark, 3 light) to test inference accuracy after training.

How to use in the Studio:
1. Extract this zip file on your computer.
2. In the "Training" panel:
   - Under "Upload Class A (Dark)", select all images from Class_A_Dark.
   - Under "Upload Class B (Light)", select all images from Class_B_Light.
   (Or click "Auto-Load Sample Dataset" to load the same images automatically.)
3. Click "Start Training". The neural network will converge rapidly.
4. Under "Test Custom Model", upload any image from Test_Samples (or click "Test Dark" / "Test Light") and click "Run Neural Network"!
