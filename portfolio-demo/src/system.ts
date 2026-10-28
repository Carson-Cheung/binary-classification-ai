class System {
  public pretrainedNet = new NeuralNetwork();
  public userNet = new NeuralNetwork();
  public userTrainingData: any[] = [];
  public imageProcessor = new ImageProcessor();
  public html = new HTMLHandler();
  public modelLoaded: boolean = false;
  public userNetTrained: boolean = false;

  constructor() {
    this.loadPretrainedModel();
  }

  public async loadPretrainedModel(): Promise<void> {
    try {
      HTMLHandler.updateTrainingStatus("Loading pre-trained 48x48 binary classification model...");
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
    label: string
  ): Promise<number> {
    const list = Array.from(files);
    let addedCount = 0;
    HTMLHandler.updateTrainingStatus(`Reading ${list.length} file(s) for ${label}...`);

    for (const file of list) {
      if (!file.type.startsWith("image/") && !file.name.match(/\.(png|jpe?g|webp|bmp|gif)$/i)) {
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
      `✓ Added ${addedCount} sample(s) to ${label} (Total dataset: ${this.userTrainingData.length})`
    );
    return addedCount;
  }

  public async loadSwatchData(
    urls: string[],
    outputValue: number,
    label: string
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
    this.userNetTrained = false;
    HTMLHandler.updateClassCounts();
    HTMLHandler.updateTrainingStatus("Dataset cleared. 0 samples loaded. Ready for new images.");
  }

  public async startTraining(): Promise<void> {
    if (this.userTrainingData.length === 0) {
      alert("Please upload at least 1 image for Class A and Class B (or click Auto-Load Sample Dataset) before training.");
      return;
    }
    const hasA = this.userTrainingData.some((d) => d.output[0] === 1);
    const hasB = this.userTrainingData.some((d) => d.output[0] === 0);
    if (!hasA || !hasB) {
      alert("Please provide at least one sample for both Class A and Class B.");
      return;
    }

    const startBtn = document.getElementById("startTrainingBtn") as HTMLButtonElement | null;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = "Training in Progress...";
    }

    try {
      const countA = this.userTrainingData.filter((d) => d.output[0] === 1).length;
      const countB = this.userTrainingData.filter((d) => d.output[0] === 0).length;
      HTMLHandler.updateTrainingStatus(
        `Starting training on ${this.userTrainingData.length} samples (${countA} Class A, ${countB} Class B)...`
      );

      // Yield thread briefly to update DOM
      await new Promise((r) => setTimeout(r, 60));

      // Shuffle so the classes are interleaved; training on all of A then all of B biases the net.
      this.userNet = new NeuralNetwork();
      await this.userNet.train(shuffle(this.userTrainingData));
      this.userNetTrained = true;
      HTMLHandler.updateTrainingStatus(
        "✓ Custom model training complete! Select or drop a test image below and click 'Run Custom Network'."
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
    if (!this.userNetTrained) {
      alert("Please train the custom model first by adding Class A and Class B samples and clicking 'Start Training'.");
      return;
    }
    const imgData = this.imageProcessor.processImage(img);
    const prediction = await this.userNet.run(imgData);
    HTMLHandler.displayUserResults(prediction[0]);
  }

  public async predictGenderUser(img: HTMLImageElement): Promise<void> {
    return this.predictUser(img);
  }
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SYSTEM = new System();
