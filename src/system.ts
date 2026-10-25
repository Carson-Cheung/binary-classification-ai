class System {
  private userNet = new NeuralNetwork();
  private trainingData = [];
  private imageProcessor = new ImageProcessor();
  private html = new HTMLHandler();

  constructor() {}

  private async prepareTrainingData() {
    return await this.imageProcessor.prepareTrainingData(
      DataHandler.maleImgCount,
      DataHandler.femaleImgCount
    );
  }

  public async startTraining(): Promise<void> {
    console.log("training start");
    this.trainingData = await this.prepareTrainingData();
    this.userNet.train(this.trainingData);
    console.log("training done");
  }

  //run thru pretrained model
  public async predictGender(img: HTMLImageElement) {
    const imgData = this.imageProcessor.processImage(img as HTMLImageElement);
    const prediction = await this.userNet.run(imgData);
    HTMLHandler.displayResults(prediction[0]);
  }

  //run thru user trained model
  public async predictGenderUser(img: HTMLImageElement) {
    const imgData = this.imageProcessor.processImage(img as HTMLImageElement);
    const prediction = await this.userNet.run(imgData);
    HTMLHandler.displayResults(prediction[0]);
  }
}

const SYSTEM = new System();
