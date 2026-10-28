class DataHandler {
  static readonly classA = 1;
  static readonly classB = 0;
  static readonly male = 1;
  static readonly female = 0;

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
