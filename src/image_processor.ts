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

  // Original dataset loader method
  public async prepareTrainingData(imageCountM: number, imageCountF: number): Promise<any[]> {
    let images: any[] = [];

    // for male
    for (let i = 0; i < imageCountM; i++) {
      const idx = i + 1;
      let filePathM = `./TrainingData/males/(${idx}).jpg`;
      try {
        const img = await DataHandler.loadImage(filePathM).catch(() =>
          DataHandler.loadImage(`./TrainingData/males/ (${idx}).jpg`)
        );
        images.push({
          input: this.processImage(img),
          output: [DataHandler.male],
        });
      } catch (error) {
        console.error(`Error loading image ${filePathM}:`, error);
      }
    }

    // for female
    for (let i = 0; i < imageCountF; i++) {
      const idx = i + 1;
      let filePathF = `./TrainingData/females/(${idx}).jpg`;
      try {
        const img = await DataHandler.loadImage(filePathF).catch(() =>
          DataHandler.loadImage(`./TrainingData/females/ (${idx}).jpg`)
        );
        images.push({
          input: this.processImage(img),
          output: [DataHandler.female],
        });
      } catch (error) {
        console.error(`Error loading image ${filePathF}:`, error);
      }
    }

    console.log(`Loaded ${images.length} training images from local TrainingData/ folder.`);
    return images;
  }

  // Load unseen test images that were NEVER used during training
  public async prepareUnseenTestData(startM: number, countM: number, startF: number, countF: number): Promise<any[]> {
    let images: any[] = [];

    // Unseen male faces
    for (let i = 0; i < countM; i++) {
      const idx = startM + i;
      let filePathM = `./TrainingData/males/(${idx}).jpg`;
      try {
        const img = await DataHandler.loadImage(filePathM).catch(() =>
          DataHandler.loadImage(`./TrainingData/males/ (${idx}).jpg`)
        );
        images.push({
          input: this.processImage(img),
          output: [DataHandler.male],
          label: "Male",
          file: `males/(${idx}).jpg`
        });
      } catch (error) {
        console.warn(`Unseen test image not found: ${filePathM}`);
      }
    }

    // Unseen female faces
    for (let i = 0; i < countF; i++) {
      const idx = startF + i;
      let filePathF = `./TrainingData/females/(${idx}).jpg`;
      try {
        const img = await DataHandler.loadImage(filePathF).catch(() =>
          DataHandler.loadImage(`./TrainingData/females/ (${idx}).jpg`)
        );
        images.push({
          input: this.processImage(img),
          output: [DataHandler.female],
          label: "Female",
          file: `females/(${idx}).jpg`
        });
      } catch (error) {
        console.warn(`Unseen test image not found: ${filePathF}`);
      }
    }

    console.log(`Loaded ${images.length} UNSEEN test images (faces ${startM}-${startM + countM - 1} M, ${startF}-${startF + countF - 1} F).`);
    return images;
  }
}
