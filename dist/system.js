class System {
    userNet = new NeuralNetwork();
    trainingData = [];
    imageProcessor = new ImageProcessor();
    html = new HTMLHandler();
    constructor() { }
    async prepareTrainingData() {
        return await this.imageProcessor.prepareTrainingData(DataHandler.maleImgCount, DataHandler.femaleImgCount);
    }
    async startTraining() {
        console.log("training start");
        this.trainingData = await this.prepareTrainingData();
        this.userNet.train(this.trainingData);
        console.log("training done");
    }
    //run thru pretrained model
    async predictGender(img) {
        const imgData = this.imageProcessor.processImage(img);
        const prediction = await this.userNet.run(imgData);
        HTMLHandler.displayResults(prediction[0]);
    }
    //run thru user trained model
    async predictGenderUser(img) {
        const imgData = this.imageProcessor.processImage(img);
        const prediction = await this.userNet.run(imgData);
        HTMLHandler.displayResults(prediction[0]);
    }
}
const SYSTEM = new System();
//# sourceMappingURL=system.js.map