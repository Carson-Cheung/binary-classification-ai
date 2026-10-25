class DataHandler {
    static classA = 1;
    static classB = 0;
    static male = 1;
    static female = 0;
    // 890 total images. training on all takes lots of time.
    static maleImgCount = 790;
    static femaleImgCount = 790;
    // static readonly maleImgCount = 50;
    // static readonly femaleImgCount = 50;
    // Unseen test image counts (loaded from after the training range)
    static testImgCount = 100;
    constructor() { }
    static async loadImage(filePath) {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = filePath;
        });
    }
}
//# sourceMappingURL=data.js.map