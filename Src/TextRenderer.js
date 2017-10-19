function textRenderer(grid, canvas) {
    this.FONT_STRING = "px Avenir Next Cyr W00 Medium";
    this.grid = grid;
    this.canvas = canvas;
}
textRenderer.prototype.getTextSize = function (context, text, fontSize, maxWidth, maxHeight) {
    var self = this;
    var lineHeight = fontSize * 1.5;
    var width = 0;
    var height = lineHeight;
    context.save();
    context.font = self.makeFontString(fontSize);
    text = text.replace(/\n|\r/gi, " \n ");
    var words = text.split(" ");
    var line = "";
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (words[n] === "\n") {
            height += lineHeight;
            line = "";
        }
        else if (testWidth > maxWidth) {
            width = maxWidth;
            var word = words[n];
            if (n !== 0 && !this.isChineseChar(word[0])) {
                height += lineHeight;
                line = "";
            }
            var newTestLine = line;
            var previousLine = line;
            for (var i = 0; i < word.length; i++) {
                newTestLine = newTestLine + word[i];
                var textWidth = context.measureText(newTestLine).width;
                if (textWidth > maxWidth) {
                    newTestLine = word[i];
                    height += lineHeight;
                }
                previousLine = newTestLine;
            }
            line = newTestLine + " ";
        }
        else {
            width = width > testWidth ? width : testWidth;
            line = testLine;
        }
        // issues with floating points
        if (height > maxHeight + 0.0001) {
            height -= fontSize * 1.25;
            break;
        }
    }
    context.restore();
    return {
        width: width,
        height: height
    };
};
textRenderer.prototype.render = function (_a, textObject) {
    var context = _a.context, viewport = _a.viewport;
    var ratio = viewport.zoomRatio || 1;
    var invRatio = 1 / ratio;
    var offsetX = (viewport.xOffset || 0) * invRatio;
    var offsetY = (viewport.yOffset || 0) * invRatio;
    textObject.p1.xDraw = textObject.p1.x * viewport.pixelRatio + offsetX;
    textObject.p1.yDraw = textObject.p1.y * viewport.pixelRatio + offsetY;
    textObject.p2.xDraw = textObject.p2.x * viewport.pixelRatio + offsetX;
    textObject.p2.yDraw = textObject.p2.y * viewport.pixelRatio + offsetY;
    context.save();
    context.scale(ratio, ratio);
    this.draw(context, textObject);
    context.restore();
};
textRenderer.prototype.draw = function (context, textObject) {
    var self = this;
    var p1 = textObject.p1;
    var p2 = textObject.p2;
    var x1 = Math.min(p1.xDraw, p2.xDraw);
    var x2 = Math.max(p1.xDraw, p2.xDraw);
    var y1 = Math.min(p1.yDraw, p2.yDraw);
    var y2 = Math.max(p1.yDraw, p2.yDraw);
    var width = x2 - x1;
    var height = y2 - y1;
    var fontSize = (self.canvas.ratio * textObject.fontSize);
    context.save();
    context.font = self.makeFontString(fontSize);
    context.fillStyle = textObject.color;
    context.textAlign = "start";
    context.textBaseline = "top";
    self.wrapText(context, textObject.text, x1, y1, width, height, fontSize * 1.5);
    context.restore();
};
textRenderer.prototype.wrapText = function (context, text, x, y, maxWidth, maxHeight, lineHeight) {
    text = text.replace(/\n|\r/gi, " \n ");
    var words = text.split(" ");
    var height = lineHeight;
    var line = "";
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (words[n] === "\n") {
            context.fillText(line, x, y);
            y += lineHeight;
            height += lineHeight;
            line = "";
        }
        else if (testWidth > maxWidth) {
            var word = words[n];
            if (n !== 0 && !this.isChineseChar(word[0])) {
                context.fillText(line, x, y);
                y += lineHeight;
                height += lineHeight;
                line = "";
            }
            var newTestLine = line;
            var previousLine = line;
            for (var i = 0; i < word.length; i++) {
                newTestLine = newTestLine + word[i];
                var textWidth = context.measureText(newTestLine).width;
                if (textWidth > maxWidth) {
                    context.fillText(previousLine, x, y);
                    newTestLine = word[i];
                    y += lineHeight;
                    height += lineHeight;
                }
                previousLine = newTestLine;
            }
            line = newTestLine + " ";
        }
        else {
            line = testLine;
        }
        if (height > maxHeight) {
            line = "";
            break;
        }
    }
    context.fillText(line, x, y);
};
textRenderer.prototype.isChineseChar = function (char) {
    return (/[\u4E00-\u9FCC\u3400-\u4DB5]/i).test(char);
};
textRenderer.prototype.makeFontString = function (fontSize) {
    return Math.floor(fontSize) + this.FONT_STRING;
};

export default textRenderer;