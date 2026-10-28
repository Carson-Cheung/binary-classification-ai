class NeuralNetwork {
  static readonly config = {
    binaryThresh: 0.5,
    hiddenLayers: [64, 32],
    activation: "sigmoid",
    iterations: 800,
    learningRate: 0.1,
    errorThresh: 0.03,
  };

  private net: any;

  constructor() {
    this.net = new brain.NeuralNetwork(NeuralNetwork.config);
  }

  public fromJSON(json: any) {
    this.net = new brain.NeuralNetwork();
    this.net.fromJSON(json);
  }

  public toJSON() {
    return this.net.toJSON();
  }

  public async train(data: any) {
    HTMLHandler.updateTrainingStatus("Starting training loop...");
    const options = {
      iterations: NeuralNetwork.config.iterations,
      errorThresh: NeuralNetwork.config.errorThresh,
      learningRate: NeuralNetwork.config.learningRate,
      log: (details: any) => {
        const msg =
          typeof details === "string"
            ? details
            : `Iteration ${details.iterations}, Error: ${details.error?.toFixed ? details.error.toFixed(5) : details.error}`;
        HTMLHandler.updateTrainingStatus(msg);
      },
      logPeriod: 2,
    };

    // trainAsync keeps the page responsive and lets status updates render.
    const res =
      typeof this.net.trainAsync === "function"
        ? await this.net.trainAsync(data, options)
        : this.net.train(data, options);

    HTMLHandler.updateTrainingStatus(
      `Training complete! Final error: ${res.error?.toFixed ? res.error.toFixed(4) : res.error}`
    );
    return res;
  }

  public async run(input: any) {
    if (!this.net) {
      return [0.5];
    }
    return this.net.run(input);
  }
}
