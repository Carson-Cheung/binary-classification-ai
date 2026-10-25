class NeuralNetwork {
    static config = {
        binaryThresh: 0.5,
        hiddenLayers: [512, 256, 128],
        activation: "sigmoid",
        iterations: 20000,
        learningRate: 0.01,
        errorThresh: 0.05, //cahnge to 0.05
    };
    static crossValidateConfig = {
        iterations: 20000,
        log: (details) => {
            console.log(details);
            console.log(details.fold);
            HTMLHandler.updateTrainingStatus(`Fold ${details.fold + 1}, Iteration ${details.iterations}, Error: ${details.error}`);
        },
    };
    folds = 40;
    net;
    constructor() {
        // Create a cross-validation instance with the specified number of folds
        this.net = new brain.CrossValidate(() => new brain.NeuralNetwork(NeuralNetwork.config));
    }
    async train(data) {
        // Train the cross-validated neural network
        //await this.net.train(data, 5);
        await this.net.train(data, NeuralNetwork.crossValidateConfig, this.folds);
        this.net = await this.net.toNeuralNetwork();
    }
    async run(input) {
        // Use the run method on the cross-validated neural network
        const output = await this.net.run(input);
        return output;
    }
}
//# sourceMappingURL=neural_network.js.map