class System {
  public pretrainedNet = new NeuralNetwork();
  public userNet = new NeuralNetwork();
  public userTrainingData: any[] = [];
  public imageProcessor = new ImageProcessor();
  public html = new HTMLHandler();
  public modelLoaded: boolean = false;

  constructor() {
    this.loadPretrainedModel();
  }

  public async loadPretrainedModel(): Promise<void> {
    try {
      HTMLHandler.updateTrainingStatus(
        "Loading pre-trained 48x48 binary classification model...",
      );
      const response = await fetch("./pretrained_model.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const modelJson = await response.json();
      this.pretrainedNet.fromJSON(modelJson);
      this.modelLoaded = true;
      console.log("Pre-trained model loaded successfully.");
      HTMLHandler.updateTrainingStatus("Pre-trained model loaded and ready!");
    } catch (err: any) {
      console.warn("Could not load pretrained_model.json automatically:", err);
      HTMLHandler.updateTrainingStatus("Pre-trained model initialized. Ready!");
    }
  }

  public shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  public async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  public async addFilesToDataset(
    files: FileList | File[],
    outputValue: number,
    label: string,
  ): Promise<number> {
    const list = Array.from(files);
    let addedCount = 0;
    HTMLHandler.updateTrainingStatus(
      `Reading ${list.length} file(s) for ${label}...`,
    );

    for (const file of list) {
      if (
        !file.type.startsWith("image/") &&
        !file.name.match(/\.(png|jpe?g|webp|bmp|gif)$/i)
      ) {
        continue;
      }
      try {
        const dataUrl = await this.readFileAsDataURL(file);
        const img = await this.loadImage(dataUrl);
        const processed = this.imageProcessor.processImage(img);
        this.userTrainingData.push({
          input: processed,
          output: [outputValue],
        });
        addedCount++;
      } catch (err) {
        console.warn(`Failed to process image ${file.name}:`, err);
      }
    }

    HTMLHandler.updateClassCounts();
    HTMLHandler.updateTrainingStatus(
      `✓ Added ${addedCount} sample(s) to ${label} (Total dataset: ${this.userTrainingData.length})`,
    );
    return addedCount;
  }

  public async loadSwatchData(
    urls: string[],
    outputValue: number,
    label: string,
  ): Promise<number> {
    let addedCount = 0;
    for (const url of urls) {
      try {
        const img = await this.loadImage(url);
        const processed = this.imageProcessor.processImage(img);
        this.userTrainingData.push({
          input: processed,
          output: [outputValue],
        });
        addedCount++;
      } catch (err) {
        console.warn(`Failed to load swatch ${url}:`, err);
      }
    }
    return addedCount;
  }

  public clearDataset(): void {
    this.userTrainingData = [];
    HTMLHandler.updateClassCounts();
    HTMLHandler.updateTrainingStatus(
      "Dataset cleared. 0 samples loaded. Ready for new images.",
    );
  }

  public async startTraining(): Promise<void> {
    if (this.userTrainingData.length === 0) {
      HTMLHandler.updateTrainingStatus(
        `Loading local TrainingData images (${DataHandler.maleImgCount} male, ${DataHandler.femaleImgCount} female)...`,
      );
      this.userTrainingData = await this.imageProcessor.prepareTrainingData(
        DataHandler.maleImgCount,
        DataHandler.femaleImgCount,
      );
      if (this.userTrainingData.length === 0) {
        alert(
          "Please upload at least 1 image for Class A and 1 image for Class B first.",
        );
        return;
      }
    }
    const hasA = this.userTrainingData.some((d) => d.output[0] === 1);
    const hasB = this.userTrainingData.some((d) => d.output[0] === 0);
    if (!hasA || !hasB) {
      alert("Please provide at least one sample for both Class A and Class B.");
      return;
    }

    const startBtn = document.getElementById(
      "startTrainingBtn",
    ) as HTMLButtonElement | null;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = "Training in Progress...";
    }

    try {
      const countA = this.userTrainingData.filter(
        (d) => d.output[0] === 1,
      ).length;
      const countB = this.userTrainingData.filter(
        (d) => d.output[0] === 0,
      ).length;
      console.log("training start");
      HTMLHandler.updateTrainingStatus(
        `Starting training on ${this.userTrainingData.length} samples (${countA} Class A, ${countB} Class B)...`,
      );

      // Yield thread briefly to update DOM
      await new Promise((r) => setTimeout(r, 60));

      // Shuffle dataset to prevent recency bias / catastrophic forgetting
      const shuffledData = this.shuffleArray(this.userTrainingData);
      console.log(
        "Shuffled dataset order before training (interleaving classes).",
      );

      this.userNet = new NeuralNetwork();
      await this.userNet.train(shuffledData);
      console.log("training done");
      HTMLHandler.updateTrainingStatus(
        "✓ Custom model training complete! Select or drop a test image below and click 'Run Custom Network'.",
      );
    } finally {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Start Training";
      }
    }
  }

  // Run through pre-trained binary model
  public async predict(img: HTMLImageElement): Promise<void> {
    const imgData = this.imageProcessor.processImage(img);
    const prediction = await this.pretrainedNet.run(imgData);
    HTMLHandler.displayResults(prediction[0]);
  }

  public async predictGender(img: HTMLImageElement): Promise<void> {
    return this.predict(img);
  }

  // Run through user-trained model (Class A / Class B)
  public async predictUser(img: HTMLImageElement): Promise<void> {
    if (this.userTrainingData.length === 0) {
      alert(
        "Please train the custom model first by adding Class A and Class B samples and clicking 'Start Training'.",
      );
      return;
    }
    const imgData = this.imageProcessor.processImage(img);
    const prediction = await this.userNet.run(imgData);
    HTMLHandler.displayUserResults(prediction[0]);
  }

  public async predictGenderUser(img: HTMLImageElement): Promise<void> {
    return this.predictUser(img);
  }

  public async checkAcc(): Promise<void> {
    if (this.userTrainingData.length === 0) {
      alert("Please train the model first before checking accuracy!");
      return;
    }

    const checkBtn = document.getElementById(
      "checkAccuracyBtn",
    ) as HTMLButtonElement | null;
    if (checkBtn) {
      checkBtn.disabled = true;
      checkBtn.textContent = "Testing Accuracy...";
    }

    try {
      HTMLHandler.updateTrainingStatus(
        "Loading UNSEEN test images from TrainingData/...",
      );

      // Calculate start indices right after the training range
      const startM = DataHandler.maleImgCount + 1;
      const countM = DataHandler.testImgCount;
      const startF = DataHandler.femaleImgCount + 1;
      const countF = DataHandler.testImgCount;

      console.log(
        `Loading unseen test images: Males (${startM} to ${startM + countM - 1}), Females (${startF} to ${startF + countF - 1})...`,
      );

      const unseenTestData = await this.imageProcessor.prepareUnseenTestData(
        startM,
        countM,
        startF,
        countF,
      );

      // Determine which dataset to evaluate
      const testSet =
        unseenTestData.length > 0 ? unseenTestData : this.userTrainingData;
      const isUnseen = unseenTestData.length > 0;

      let totalCorrect = 0;
      let maleCorrect = 0;
      let maleTotal = 0;
      let femaleCorrect = 0;
      let femaleTotal = 0;

      HTMLHandler.updateTrainingStatus(
        `Evaluating ${isUnseen ? "UNSEEN test" : "training"} accuracy across ${testSet.length} samples...`,
      );

      for (const sample of testSet) {
        const prediction = await this.userNet.run(sample.input);
        const predictedClass = prediction[0] >= 0.5 ? 1 : 0;
        const actualClass = sample.output[0];

        const isCorrect = predictedClass === actualClass;
        if (isCorrect) totalCorrect++;

        if (actualClass === 1) {
          maleTotal++;
          if (isCorrect) maleCorrect++;
        } else {
          femaleTotal++;
          if (isCorrect) femaleCorrect++;
        }
      }

      const overallPct = ((totalCorrect / testSet.length) * 100).toFixed(1);
      const malePct =
        maleTotal > 0 ? ((maleCorrect / maleTotal) * 100).toFixed(1) : "0.0";
      const femalePct =
        femaleTotal > 0
          ? ((femaleCorrect / femaleTotal) * 100).toFixed(1)
          : "0.0";

      const title = isUnseen ? "UNSEEN Test Accuracy" : "Training Accuracy";
      const logMsg = `${title}: ${overallPct}% (${totalCorrect}/${testSet.length} correct) | Male: ${maleCorrect}/${maleTotal} (${malePct}%), Female: ${femaleCorrect}/${femaleTotal} (${femalePct}%)`;
      console.log(logMsg);

      const htmlMsg = `
        <b>${title}: ${overallPct}%</b> (${totalCorrect} of ${testSet.length} correct)<br>
        • Male faces: ${maleCorrect}/${maleTotal} (${malePct}%)<br>
        • Female faces: ${femaleCorrect}/${femaleTotal} (${femalePct}%)<br>
        <span style="font-size: 13px; color: #aed6f1;">${
          isUnseen
            ? `Tested on unseen images #${startM}-${startM + countM - 1} M and #${startF}-${startF + countF - 1} F (never seen during training).`
            : "Tested on training set."
        }</span>
      `;

      HTMLHandler.updateTrainingStatus(htmlMsg);
    } catch (err: any) {
      console.error("Accuracy check error:", err);
      HTMLHandler.updateTrainingStatus(
        `Error evaluating accuracy: ${err.message}`,
      );
    } finally {
      if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.textContent = "Check Accuracy";
      }
    }
  }

  public async checkAccuracy(): Promise<void> {
    return this.checkAcc();
  }

  // Export and download the trained model as pretrained_model.json
  public downloadModel(): void {
    if (!this.userNet) {
      alert("No trained model found to download!");
      return;
    }
    const modelJson = JSON.stringify(this.userNet.toJSON());
    const blob = new Blob([modelJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pretrained_model.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Downloaded pretrained_model.json!");
    HTMLHandler.updateTrainingStatus("✓ Downloaded trained model to pretrained_model.json!");
  }
}

const SYSTEM = new System();
