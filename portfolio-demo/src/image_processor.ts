class ImageProcessor {
  static readonly trainingImgDimensions = 48;
  static readonly displayImgDimensions = 512;
  private processingCanvas = document.getElementById(
    "trainingCanvas"
  ) as HTMLCanvasElement;
  private displayCanvas = document.getElementById(
    "displayCanvas"
  ) as HTMLCanvasElement;
  private processingCtx: CanvasRenderingContext2D;
  private displayCtx: CanvasRenderingContext2D;

  constructor() {
    this.processingCtx = this.processingCanvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    this.displayCtx = this.displayCanvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;

    this.processingCanvas.width = ImageProcessor.trainingImgDimensions;
    this.processingCanvas.height = ImageProcessor.trainingImgDimensions;
    this.displayCanvas.width = ImageProcessor.displayImgDimensions;
    this.displayCanvas.height = ImageProcessor.displayImgDimensions;
  }

  private applyGrayScale(CanvasImgData: ImageData): number[] {
    const AIdata: number[] = [];

    for (let i = 0; i < CanvasImgData.data.length; i += 4) {
      // average RGB values
      const count =
        CanvasImgData.data[i] +
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
    this.displayCtx.drawImage(
      this.processingCanvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );
    return AIdata;
  }

  private resizeImage(img: any) {
    this.processingCtx.drawImage(
      img,
      0,
      0,
      this.processingCanvas.width,
      this.processingCanvas.height
    );
    return this.processingCtx.getImageData(
      0,
      0,
      this.processingCanvas.width,
      this.processingCanvas.height
    );
  }

  public processImage(img: any) {
    return this.applyGrayScale(this.resizeImage(img));
  }
}
