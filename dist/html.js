class HTMLHandler {
    static imgDisplay = document.getElementById("imgDisplay");
    static imgDisplayUser = document.getElementById("imgDisplayUser");
    static fileUpload = document.getElementById("imageUploadInput");
    static fileUploadUser = document.getElementById("imageUploadInputUser");
    static trainButton;
    static runButton;
    static trainingStatus = document.getElementById("trainingStatus");
    static results = document.getElementById("results");
    constructor() { }
    static updateTrainingStatus(text) {
        this.trainingStatus.innerHTML += "<br>" + text;
    }
    static toggleTrainingStatus() {
        this.trainingStatus.classList.toggle("expanded");
    }
    static predictGender() {
        console.log(this.imgDisplay);
        SYSTEM.predictGender(this.imgDisplay);
    }
    static predictGenderUser() {
        console.log(this.imgDisplayUser);
        SYSTEM.predictGenderUser(this.imgDisplayUser);
    }
    static displayImage() {
        const file = HTMLHandler.fileUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Set the source of the image to the uploaded file
                HTMLHandler.imgDisplay.src = e.target.result;
            };
            // Read the uploaded file as a data URL
            reader.readAsDataURL(file);
        }
        else {
            alert("Please select an image file.");
        }
    }
    static displayImageUser() {
        const file = HTMLHandler.fileUploadUser.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                // Set the source of the image to the uploaded file
                HTMLHandler.imgDisplayUser.src = e.target.result;
            };
            // Read the uploaded file as a data URL
            reader.readAsDataURL(file);
        }
        else {
            alert("Please select an image file.");
        }
    }
    static displayResults(percent) {
        if (percent > 0.5) {
            this.results.innerHTML = `Male with ${(percent * 100).toFixed(2)}% certainty`;
        }
        else {
            this.results.innerHTML = `Female with ${(100 - percent * 100).toFixed(2)}% certainty`;
        }
    }
}
//# sourceMappingURL=html.js.map