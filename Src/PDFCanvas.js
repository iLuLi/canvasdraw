function pdfCanvas(utils, canvasWrapperName) {
    this.utils = utils;
    this.canvasWrapperName = canvasWrapperName;
    this.enabled = false;
}
pdfCanvas.prototype.setPDFDoc = function (pdf) {
    this.pdfDoc = pdf;
};
pdfCanvas.prototype.setPDFPage = function (page) {
    this.pdfPage = page;
};
pdfCanvas.prototype.setEnabled = function (enabled) {
    if (enabled === this.enabled) {
        return;
    }
    if (enabled || !this.canvasWrapper) {
        this.canvasWrapper = document.getElementById(this.canvasWrapperName);
    }
    this.enabled = enabled;
};
pdfCanvas.prototype.generateDataUrl = function (canvasToCopy) {
    this.context.drawImage(canvasToCopy, 0, 0, this.canvas.width, this.canvas.height);
    var dataUrl = this.canvas.toDataURL("image/png");
    return dataUrl;
};
pdfCanvas.prototype.getPixel = function (point) {
    if (this.canvas && this.enabled) {
        return this.context.getImageData(point.x, point.y, 1, 1).data;
    }
    else {
        return [0, 0, 0, 0];
    }
};
// don't call directly use canvas instead
pdfCanvas.prototype.resize = function (width, height, ratio) {
    if (this.canvas && this.enabled) {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
    }
};
pdfCanvas.prototype.getRenderData = function () {
    if (!this.enabled || !this.pdfPage) {
        return null;
    }
    return {
        page: this.pdfPage,
        context: this.context
    };
};
pdfCanvas.prototype.createSaveableRenderData = function (tempContext) {
    if (!this.enabled || !this.pdfPage) {
        return null;
    }
    return {
        page: this.pdfPage,
        context: tempContext
    };
};
pdfCanvas.prototype.setNewVisibleData = function (_a) {
    var canvas = _a.canvas, context = _a.context;
    this.removeCurrentCanvas();
    canvas.removeAttribute("hidden");
    this.canvas = canvas;
    this.context = context;
};
pdfCanvas.prototype.removeCurrentCanvas = function () {
    if (!this.canvas) {
        return;
    }
    // Zeroing the width and height causes Firefox to release graphics
    // resources immediately.
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.canvas.remove();
    this.canvas = null;
};
pdfCanvas.prototype.getRenderContext = function (viewport) {
    return this.createCanvas(viewport.width, viewport.height, viewport.pixelRatio, true);
};
pdfCanvas.prototype.createCanvas = function (width, height, ratio, hide) {
    var canvas = document.createElement('canvas');
    canvas.style.width = (width / ratio) + "px";
    canvas.style.height = (height / ratio) + "px";
    canvas.width = width;
    canvas.height = height;
    this.canvasWrapper.appendChild(canvas);
    var context = canvas.getContext('2d', { alpha: false });
    // context.scale(ratio, ratio);
    if (hide) {
        canvas.setAttribute("hidden", "hidden");
    }
    return {
        canvas: canvas, context: context
    };
};

export default pdfCanvas;