class HTMLHandler {
  static readonly imgDisplay: HTMLImageElement = document.getElementById(
    "imgDisplay"
  ) as HTMLImageElement;
  static readonly imgDisplayUser: HTMLImageElement = document.getElementById(
    "imgDisplayUser"
  ) as HTMLImageElement;
  static readonly fileUpload: HTMLInputElement = document.getElementById(
    "imageUploadInput"
  ) as HTMLInputElement;
  static readonly fileUploadUser: HTMLInputElement = document.getElementById(
    "imageUploadInputUser"
  ) as HTMLInputElement;
  static readonly trainButton: HTMLButtonElement;
  static readonly runButton: HTMLButtonElement;
  static readonly trainingStatus: HTMLParagraphElement =
    document.getElementById("trainingStatus") as HTMLParagraphElement;
  static readonly results: HTMLParagraphElement = document.getElementById(
    "results"
  ) as HTMLParagraphElement;

  constructor() {}

  static updateTrainingStatus(text: string) {
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
        HTMLHandler.imgDisplay.src = e.target.result as string;
      };

      // Read the uploaded file as a data URL
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file.");
    }
  }
  static displayImageUser() {
    const file = HTMLHandler.fileUploadUser.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Set the source of the image to the uploaded file
        HTMLHandler.imgDisplayUser.src = e.target.result as string;
      };

      // Read the uploaded file as a data URL
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file.");
    }
  }

  static displayResults(percent) {
    if (percent > 0.5) {
      this.results.innerHTML = `Male with ${(percent * 100).toFixed(
        2
      )}% certainty`;
    } else {
      this.results.innerHTML = `Female with ${(100 - percent * 100).toFixed(
        2
      )}% certainty`;
    }
  }
}
