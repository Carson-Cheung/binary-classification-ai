class HTMLHandler {
    static get imgDisplay() {
        return document.getElementById("imgDisplay");
    }
    static get imgDisplayUser() {
        return document.getElementById("imgDisplayUser");
    }
    static get fileUpload() {
        return document.getElementById("imageUploadInput");
    }
    static get fileUploadUser() {
        return document.getElementById("imageUploadInputUser");
    }
    static get trainingStatus() {
        return document.getElementById("trainingStatus");
    }
    static get results() {
        return document.getElementById("results");
    }
    constructor() { }
    static updateTrainingStatus(text) {
        const el = document.getElementById("trainingStatus");
        if (el) {
            el.innerHTML += "<br>" + text;
            el.scrollTop = el.scrollHeight;
        }
    }
    static toggleTrainingStatus() {
        const el = document.getElementById("trainingStatus");
        if (el) {
            el.classList.toggle("expanded");
        }
    }
    static updateClassCounts() {
        const countA = SYSTEM.userTrainingData.filter((d) => d.output[0] === 1).length;
        const countB = SYSTEM.userTrainingData.filter((d) => d.output[0] === 0).length;
        const badgeA = document.getElementById("countBadgeA");
        if (badgeA) {
            badgeA.textContent = countA > 0 ? `✓ ${countA} samples loaded` : "0 samples";
            badgeA.classList.toggle("has-samples", countA > 0);
        }
        const badgeB = document.getElementById("countBadgeB");
        if (badgeB) {
            badgeB.textContent = countB > 0 ? `✓ ${countB} samples loaded` : "0 samples";
            badgeB.classList.toggle("has-samples", countB > 0);
        }
    }
    static clearDataset() {
        SYSTEM.clearDataset();
    }
    static onDragOver(e, dropzoneId) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(dropzoneId);
        if (el)
            el.classList.add("drag-over");
    }
    static onDragLeave(e, dropzoneId) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(dropzoneId);
        if (el)
            el.classList.remove("drag-over");
    }
    static async onDrop(e, classType) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById(`dropzone${classType}`);
        if (el)
            el.classList.remove("drag-over");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await this.handleFiles(e.dataTransfer.files, classType);
        }
    }
    static onDropUser(e) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.getElementById("dropzoneUser");
        if (el)
            el.classList.remove("drag-over");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            this.previewFileUser(e.dataTransfer.files[0]);
        }
    }
    static async handleInputFiles(input, classType) {
        if (input && input.files && input.files.length > 0) {
            await this.handleFiles(input.files, classType);
            input.value = ""; // Reset to allow re-selection
        }
    }
    static async handleFiles(files, classType) {
        const val = classType === "A" ? 1 : 0;
        const label = classType === "A" ? "Class A (Dark)" : "Class B (Light)";
        await SYSTEM.addFilesToDataset(files, val, label);
    }
    // Backward compatibility
    static addToTrainingA() {
        const input = document.getElementById("imageUploadTrainingA");
        if (input && input.files && input.files.length > 0) {
            this.handleFiles(input.files, "A");
        }
        else {
            input?.click();
        }
    }
    static addToTrainingB() {
        const input = document.getElementById("imageUploadTrainingB");
        if (input && input.files && input.files.length > 0) {
            this.handleFiles(input.files, "B");
        }
        else {
            input?.click();
        }
    }
    static previewFileUser(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.getElementById("imgDisplayUser");
                if (img)
                    img.src = e.target?.result;
            };
            reader.readAsDataURL(file);
        }
    }
    static displayImage() {
        const input = document.getElementById("imageUploadInput");
        const file = input && input.files ? input.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.getElementById("imgDisplay");
                if (img)
                    img.src = e.target?.result;
            };
            reader.readAsDataURL(file);
        }
        else {
            alert("Please select an image file.");
        }
    }
    static displayImageUser() {
        const input = document.getElementById("imageUploadInputUser");
        const file = input && input.files ? input.files[0] : null;
        if (file) {
            this.previewFileUser(file);
        }
    }
    static async autoLoadColorSwatches() {
        HTMLHandler.updateTrainingStatus("⚡ Fetching sample dark & light color swatch dataset...");
        try {
            const res = await fetch("./sample_dataset/manifest.json");
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const manifest = await res.json();
            HTMLHandler.updateTrainingStatus(`Loading ${manifest.classA_dark.length} Dark and ${manifest.classB_light.length} Light swatches...`);
            const addedA = await SYSTEM.loadSwatchData(manifest.classA_dark, 1, "Class A (Dark)");
            const addedB = await SYSTEM.loadSwatchData(manifest.classB_light, 0, "Class B (Light)");
            HTMLHandler.updateClassCounts();
            HTMLHandler.updateTrainingStatus(`✓ Successfully auto-loaded ${addedA} Dark (Class A) and ${addedB} Light (Class B) samples! Total dataset: ${SYSTEM.userTrainingData.length}. Ready to train!`);
        }
        catch (err) {
            console.error("Auto-load failed:", err);
            HTMLHandler.updateTrainingStatus(`Failed to auto-load swatches: ${err.message}. You can download the .zip and upload manually.`);
        }
    }
    static loadQuickTestSwatch(type) {
        const img = document.getElementById("imgDisplayUser");
        if (!img)
            return;
        if (type === "dark") {
            img.src = "./sample_dataset/Test_Samples/test_dark_03_blackberry.png";
            HTMLHandler.updateTrainingStatus("Loaded sample dark test swatch: Blackberry Dark (#32172D). Click 'Run Custom Network' to evaluate.");
        }
        else {
            img.src = "./sample_dataset/Test_Samples/test_light_01_mint.png";
            HTMLHandler.updateTrainingStatus("Loaded sample light test swatch: Mint Cream (#CCFBF1). Click 'Run Custom Network' to evaluate.");
        }
    }
    static predict() {
        const img = document.getElementById("imgDisplay");
        if (!img || !img.src) {
            alert("Please select and upload an image first.");
            return;
        }
        SYSTEM.predictGender(img);
    }
    static predictGender() {
        this.predict();
    }
    static predictUser() {
        const img = document.getElementById("imgDisplayUser");
        if (!img || !img.src) {
            alert("Please select, drop, or pick a test swatch image first.");
            return;
        }
        SYSTEM.predictGenderUser(img);
    }
    static predictGenderUser() {
        this.predictUser();
    }
    // Pre-trained classifier result
    static displayResults(percent) {
        const el = document.getElementById("results");
        if (!el)
            return;
        if (percent >= 0.5) {
            el.innerHTML = `Male (${(percent * 100).toFixed(1)}% confidence)`;
        }
        else {
            el.innerHTML = `Female (${((1 - percent) * 100).toFixed(1)}% confidence)`;
        }
    }
    // User-trained classifier result
    static displayUserResults(percent) {
        const el = document.getElementById("results");
        if (!el)
            return;
        if (percent >= 0.5) {
            const conf = (percent * 100).toFixed(1);
            el.innerHTML = `<span style="color: #60a5fa;">Class A (Dark)</span><br><span style="font-size: 14px; color: #94a3b8; font-weight: normal;">${conf}% confidence (Score: ${percent.toFixed(3)})</span>`;
        }
        else {
            const conf = ((1 - percent) * 100).toFixed(1);
            el.innerHTML = `<span style="color: #facc15;">Class B (Light)</span><br><span style="font-size: 14px; color: #94a3b8; font-weight: normal;">${conf}% confidence (Score: ${(1 - percent).toFixed(3)})</span>`;
        }
    }
}
