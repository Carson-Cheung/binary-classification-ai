class DataHandler {
  static readonly male = 1;
  static readonly female = 0;
  static readonly maleImgCount = 890;
  static readonly femaleImgCount = 890;
  // static readonly maleImgCount = 20;
  // static readonly femaleImgCount = 20;

  constructor() {}

  public static async loadImage(filePath) {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = filePath;
    });
  }
}
