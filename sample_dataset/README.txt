=== Dark vs Light Color Swatch Dataset ===
Binary Classification Experiment Dataset for Brain.js Neural Network Studio

Structure:
- Class_A_Dark/ : 20 dark color swatch images (charcoal, navy, deep brown, forest green, deep purple, etc.)
- Class_B_Light/: 20 light color swatch images (white, ivory, cream, pastel yellow, sky blue, etc.)
- Test_Samples/ : 6 holdout evaluation swatches (3 dark, 3 light) to test inference accuracy after training.

How to use in the Studio:
1. Extract this zip file on your computer.
2. In the "Interactive Trainer" panel:
   - Drag all images from Class_A_Dark into the "Class A (Dark Colours)" dropzone.
   - Drag all images from Class_B_Light into the "Class B (Light Colours)" dropzone.
3. Click "Start Training". The neural network will converge rapidly.
4. Drag any image from Test_Samples into "2. Test Custom Model" and click "Run Custom Network"!
