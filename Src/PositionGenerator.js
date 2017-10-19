function PositionGenerator() {
}
PositionGenerator.simplePosition = function (width, height, ratio) {
    if (ratio === void 0) { ratio = 1; }
    return { width: width, height: height, xOffset: 0, yOffset: 0, zoomRatio: ratio };
};
PositionGenerator.getNewDimensions = function (parameters) {
    var openMode = parameters.openMode, width = parameters.width, height = parameters.height, zoom = parameters.zoom, maxWidth = parameters.maxWidth, maxHeight = parameters.maxHeight;
    switch (openMode) {
        case "PAGE_WIDTH":
            var newZoom1 = maxWidth / width;
            return {
                width: width * newZoom1,
                height: height * newZoom1,
                zoom: newZoom1
            };
        case "PAGE_HEIGHT":
            var newZoom2 = height > maxHeight ? maxHeight / height : 1;
            return {
                width: width * newZoom2,
                height: height * newZoom2,
                zoom: newZoom2
            };
        case "FIT":
            return PositionGenerator.generateDimensions(width, height, maxWidth, maxHeight);
        case "CURRENT_ZOOM":
            return {
                width: width * zoom,
                height: height * zoom,
                zoom: zoom
            };
        default:
            throw new Error(openMode + " is not a valid mode");
    }
};
PositionGenerator.generateDimensions = function (width, height, maxWidth, maxHeight) {
    var ratio = width / height;
    var oldWidth = Math.min(width, maxWidth);
    var oldHeight = Math.min(height, maxHeight);
    var useWidth = oldWidth <= oldHeight * ratio;
    var newWidth = useWidth ? oldWidth : oldHeight * ratio;
    var newHeight = useWidth ? oldWidth / ratio : oldHeight;
    return {
        width: newWidth,
        height: newHeight,
        zoom: newWidth / width
    };
};

export default PositionGenerator;