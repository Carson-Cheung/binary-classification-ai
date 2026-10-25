class DataHandler {
  static readonly classA = 1;
  static readonly classB = 0;
  static readonly male = 1;
  static readonly female = 0;

  // 890 total images. training on all takes lots of time.
  static readonly maleImgCount = 790;
  static readonly femaleImgCount = 790;
  // static readonly maleImgCount = 50;
  // static readonly femaleImgCount = 50;

  // Unseen test image counts (loaded from after the training range)
  static readonly testImgCount = 100;

  constructor() {}

  public static async loadImage(filePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = filePath;
    });
  }
}
