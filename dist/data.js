class DataHandler {
    static male = 1;
    static female = 0;
    static maleImgCount = 890;
    static femaleImgCount = 890;
    // static readonly maleImgCount = 20;
    // static readonly femaleImgCount = 20;
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