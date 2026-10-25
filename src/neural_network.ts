declare const brain: any;

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
    console.log(`Starting training on ${data.length} samples...`);

    const options = {
      iterations: NeuralNetwork.config.iterations,
      errorThresh: NeuralNetwork.config.errorThresh,
      learningRate: NeuralNetwork.config.learningRate,
      log: (details: any) => {
        console.log("Training status:", details);
        const msg =
          typeof details === "string"
            ? details
            : `Iteration ${details.iterations}, Error: ${details.error?.toFixed ? details.error.toFixed(5) : details.error}`;
        HTMLHandler.updateTrainingStatus(msg);
      },
      logPeriod: 2,
    };

    let res;
    if (typeof this.net.trainAsync === "function") {
      res = await this.net.trainAsync(data, options);
    } else {
      res = this.net.train(data, options);
    }

    console.log("Training complete!", res);
    HTMLHandler.updateTrainingStatus(
      `✓ Training complete! Final error: ${res.error?.toFixed ? res.error.toFixed(4) : res.error}`
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
