class ImageProcessor {
  static readonly trainingImgDimensions = 32;
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
      //average RGB values
      const count =
        CanvasImgData.data[i] +
        CanvasImgData.data[i + 1] +
        CanvasImgData.data[i + 2];
      const colour = Math.floor(count / 3);

      //this is not neccesary, but it visually shows what the AI sees on canvas.
      CanvasImgData.data[i] = colour; //r
      CanvasImgData.data[i + 1] = colour; //g
      CanvasImgData.data[i + 2] = colour; //b
      CanvasImgData.data[i + 3] = 255; //alpha or transparency

      //this is neccesary, since this is the part the AI uses to train.
      AIdata.push(colour);
    }

    this.processingCtx.putImageData(CanvasImgData, 0, 0);

    //update the display
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
    //add type later
    //draw on canvas to resize
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
    const processedImg = this.applyGrayScale(this.resizeImage(img));
    this.displayCtx.drawImage(
      this.processingCanvas,
      0,
      0,
      this.displayCanvas.width,
      this.displayCanvas.height
    );
    return processedImg;
  }

  public async prepareTrainingData(imageCountM: number, imageCountF: number) {
    let images: any[] = [];

    //for male
    for (let i = 0; i < imageCountM; i++) {
      const filePathM = `./TrainingData/males/ (${i + 1}).jpg`;
      console.log(filePathM);
      try {
        const img = await DataHandler.loadImage(filePathM);
        images.push({
          input: this.processImage(img),
          output: [DataHandler.male],
        });
      } catch (error) {
        console.error(`Error loading image ${filePathM}:`, error);
      }
    }

    //for female
    for (let i = 0; i < imageCountF; i++) {
      const filePathF = `./TrainingData/females/ (${i + 1}).jpg`;
      try {
        const img = await DataHandler.loadImage(filePathF);
        images.push({
          input: this.processImage(img),
          output: [DataHandler.female],
        });
      } catch (error) {
        console.error(`Error loading image ${filePathF}:`, error);
      }
    }

    console.log(images);
    return images;
  }
}
