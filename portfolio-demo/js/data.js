class DataHandler {
    static classA = 1;
    static classB = 0;
    static male = 1;
    static female = 0;
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
