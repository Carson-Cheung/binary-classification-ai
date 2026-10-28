class ImageProcessor {
    static trainingImgDimensions = 48;
    static displayImgDimensions = 512;
    processingCanvas = document.getElementById("trainingCanvas");
    displayCanvas = document.getElementById("displayCanvas");
    processingCtx;
    displayCtx;
    constructor() {
        this.processingCtx = this.processingCanvas.getContext("2d", {
            willReadFrequently: true,
        });
        this.displayCtx = this.displayCanvas.getContext("2d", {
            willReadFrequently: true,
        });
        this.processingCanvas.width = ImageProcessor.trainingImgDimensions;
        this.processingCanvas.height = ImageProcessor.trainingImgDimensions;
        this.displayCanvas.width = ImageProcessor.displayImgDimensions;
        this.displayCanvas.height = ImageProcessor.displayImgDimensions;
    }
    applyGrayScale(CanvasImgData) {
        const AIdata = [];
        for (let i = 0; i < CanvasImgData.data.length; i += 4) {
            // average RGB values
            const count = CanvasImgData.data[i] +
                CanvasImgData.data[i + 1] +
                CanvasImgData.data[i + 2];
            const colour = Math.floor(count / 3);
            CanvasImgData.data[i] = colour; // r
            CanvasImgData.data[i + 1] = colour; // g
            CanvasImgData.data[i + 2] = colour; // b
            CanvasImgData.data[i + 3] = 255; // alpha
            // normalized 0..1 float for neural network input
            AIdata.push(colour / 255.0);
        }
        this.processingCtx.putImageData(CanvasImgData, 0, 0);
        // update the display
        this.displayCtx.drawImage(this.processingCanvas, 0, 0, this.displayCanvas.width, this.displayCanvas.height);
        return AIdata;
    }
    resizeImage(img) {
        this.processingCtx.drawImage(img, 0, 0, this.processingCanvas.width, this.processingCanvas.height);
        return this.processingCtx.getImageData(0, 0, this.processingCanvas.width, this.processingCanvas.height);
    }
    processImage(img) {
        return this.applyGrayScale(this.resizeImage(img));
    }
}
