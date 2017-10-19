import {CURSORS} from './Constants';

function canvas(utils, pdfCanvas, normalCanvasName, drawingCanvasName, width, height, offsetLeft, offsetTop) {
    this.utils = utils;
    this.pdfCanvas = pdfCanvas;
    this.utils = utils;
    this.canvas = document.getElementById(normalCanvasName);
    this.context = this.canvas.getContext("2d");
    this.tempCanvas = document.getElementById(drawingCanvasName);
    this.tempContext = this.tempCanvas.getContext("2d");
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStoreRatio = this.context.webkitBackingStorePixelRatio ||
        this.context.mozBackingStorePixelRatio ||
        this.context.msBackingStorePixelRatio ||
        this.context.oBackingStorePixelRatio ||
        this.context.backingStorePixelRatio || 1;
    this.ratio = devicePixelRatio / backingStoreRatio;
    this.context.scale(this.ratio, this.ratio);
    this.tempContext.scale(this.ratio, this.ratio);
    this.zoomRatio = 1;
    this.offsetLeft = offsetLeft;
    this.offsetTop = offsetTop;
    this.canvas.lineJoin = "round";
    this.tempCanvas.lineCap = "round";
}
canvas.prototype.setScreenSize = function (width, height) {
    this.screenWidth = width;
    this.screenHeight = height;
};
canvas.prototype.on = function (eventName, callback) {
    this.tempCanvas.addEventListener(eventName, callback);
};
canvas.prototype.setBackground = function (image, width, height) {
    this.background = image;
    this.srcWidth = width;
    this.srcHeight = height;
};
canvas.prototype.getMaxResolution = function () {
    if (this.background) {
        var image = this.background;
        // 4000 x 4000 is the max image size
        var ratio = Math.max(Math.ceil(image.width / 4000), Math.ceil(image.height / 4000));
        var width = image.width / ratio;
        var height = image.height / ratio;
        return { width: width, height: height, ratio: Math.round(width / this.srcWidth) };
    }
    else {
        return { width: this.srcWidth, height: this.srcHeight, ratio: 1 };
    }
};
canvas.prototype.setOriginalSize = function (srcWidth, srcHeight) {
    this.srcWidth = srcWidth;
    this.srcHeight = srcHeight;
};
canvas.prototype.resize = function (width, height, zoom) {
    var newWidth = width * this.ratio;
    var newHeight = height * this.ratio;
    var zoomRatio = zoom || this.zoomRatio;
    if (newWidth === this.width &&
        newHeight === this.height &&
        zoomRatio === this.zoomRatio) {
        return;
    }
    this.width = newWidth;
    this.height = newHeight;
    this.zoomRatio = zoomRatio;
    this.resizeCanvas(this.canvas, width, height, this.ratio);
    this.resizeCanvas(this.tempCanvas, width, height, this.ratio);
    if (this.pdfCanvas.enabled) {
        this.pdfCanvas.resize(width, height, this.ratio);
    }
};
canvas.prototype.clearImage = function () {
    this.background = null;
    this.context.fillStyle = "rgba(245, 245, 245, 1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
};
canvas.prototype.getDownloadURL = function () {
    var promise = this.utils.promise;
    var dataUrl;
    if (this.pdfCanvas.enabled) {
        dataUrl = this.pdfCanvas.generateDataUrl(this.canvas);
    }
    else {
        dataUrl = this.canvas.toDataURL("image/png");
    }
    return promise.resolve(dataUrl); //this.utils.createShortUrl(dataUrl));
};
canvas.prototype.updateCursor = function (cursorStyle) {
    this.canvas.style.cursor = cursorStyle;
    this.tempCanvas.style.cursor = cursorStyle;
    // chrome doesn't support grab without prefix
    if (cursorStyle === CURSORS.GRAB) {
        this.canvas.style.cursor = "-webkit-" + cursorStyle;
        this.tempCanvas.style.cursor = "-webkit-" + cursorStyle;
    }
};
canvas.prototype.setZoom = function (zoomVal) {
    var width = this.srcWidth * zoomVal;
    var height = this.srcHeight * zoomVal;
    this.resize(width, height, zoomVal);
    return {
        width: width,
        height: height,
        zoom: zoomVal
    };
};
canvas.prototype.getPixel = function (point) {
    var tempPixel = this.tempContext.getImageData(point.x, point.y, 1, 1).data;
    var mainPixel = this.context.getImageData(point.x, point.y, 1, 1).data;
    var pixel = this.combineColors(tempPixel, mainPixel);
    if (this.pdfCanvas.enabled) {
        var pdfPixel = this.pdfCanvas.getPixel(point);
        pixel = this.combineColors(pixel, pdfPixel);
    }
    return pixel;
};
// https://stackoverflow.com/questions/7438263/alpha-compositing-algorithm-blend-modes
canvas.prototype.combineColors = function (fg, bg) {
    var alpha_bg = bg[3] / 255;
    var alpha_fg = fg[3] / 255;
    var alpha_final = alpha_bg + alpha_fg - alpha_bg * alpha_fg;
    var newColor = [0, 0, 0, alpha_final * 255];
    for (var i = 0; i < 3; i++) {
        var color_fg_a = fg[i] * alpha_fg;
        var color_bg_a = bg[i] * alpha_bg;
        newColor[i] = Math.round(color_fg_a + color_bg_a * (1 - alpha_fg));
    }
    return newColor;
};
canvas.prototype.getOffset = function () {
    var offset = jQuery(this.canvas).offset();
    return {
        left: offset.left,
        top: offset.top
    };
};
canvas.prototype.getTempRenderData = function () {
    return {
        viewport: this.getViewPort(),
        context: this.tempContext
    };
};
canvas.prototype.getRenderData = function () {
    return {
        viewport: this.getViewPort(),
        background: this.getBackground(),
        context: this.context,
        pdf: this.pdfCanvas.getRenderData()
    };
};
canvas.prototype.createSaveableRenderData = function (dimensions) {
    var _a = this.createSaveableContext(dimensions.width, dimensions.height), context = _a.context, canvas = _a.canvas;
    return {
        renderData: {
            viewport: {
                width: dimensions.width,
                height: dimensions.height,
                xOffset: 0,
                yOffset: 0,
                // we don't need to care about the screen type when generating an image
                pixelRatio: 1,
                zoomRatio: dimensions.zoom,
            },
            background: this.getBackground(),
            context: context,
            pdf: this.pdfCanvas.createSaveableRenderData(context)
        },
        canvas: canvas
    };
};
canvas.prototype.createSaveableContext = function (width, height) {
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    return { context: tempCanvas.getContext("2d"), canvas: tempCanvas };
};
canvas.prototype.resizeCanvas = function (canvas, width, height, ratio) {
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    canvas.width = width * ratio;
    canvas.height = height * ratio;
};
canvas.prototype.getBackground = function () {
    if (!this.background) {
        return null;
    }
    return {
        image: this.background,
        width: this.srcWidth,
        height: this.srcHeight
    };
};
canvas.prototype.getViewPort = function () {
    return {
        width: this.width,
        height: this.height,
        xOffset: 0,
        yOffset: 0,
        pixelRatio: this.ratio,
        zoomRatio: this.zoomRatio
    };
};

export default canvas;