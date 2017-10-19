function pdfRenderer(utils, pdfCanvas) {
    this.utils = utils;
    this.pdfCanvas = pdfCanvas;
}
pdfRenderer.prototype.forceRender = function (renderData) {
    if (!renderData.pdf) {
        return Promise.resolve();
    }
    return this.internalRender(renderData);
};
pdfRenderer.prototype.render = function (renderData) {
    var _this = this;
    if (!renderData.pdf) {
        return;
    }
    var needsRender = this.needsRender(this.lastRenderData, renderData);
    if (!needsRender) {
        return;
    }
    var pageChanged = !this.lastRenderData || renderData.pdf.page !== this.lastRenderData.pdf.page;
    this.lastRenderData = renderData;
    if (this.isRendering) {
        this.renderPromise.cancel();
    }
    if (pageChanged) {
        this.pdfCanvas.removeCurrentCanvas();
    }
    var newPDFCanvas = this.pdfCanvas.getRenderContext(renderData.viewport);
    renderData.pdf.context = newPDFCanvas.context;
    this.isRendering = true;
    this.renderPromise = this.internalRender(renderData);
    this.renderPromise.then(function () {
        _this.pdfCanvas.setNewVisibleData(newPDFCanvas);
        _this.isRendering = false;
    });
};
pdfRenderer.prototype.internalRender = function (renderData) {
    var pdfData = renderData.pdf;
    var _a = renderData.viewport, zoomRatio = _a.zoomRatio, pixelRatio = _a.pixelRatio;
    var viewport = pdfData.page.getViewport(zoomRatio * pixelRatio);
    var renderContext = {
        canvasContext: pdfData.context,
        viewport: viewport
    };
    return pdfData.page.render(renderContext);
};
// only render if
pdfRenderer.prototype.needsRender = function (lastRenderData, newRenderData) {
    if (!lastRenderData) {
        return true;
    }
    var needsRender = this.arePropsDiff(lastRenderData.viewport, newRenderData.viewport, ["width", "height", "zoomRatio"]);
    needsRender = needsRender || this.arePropsDiff(lastRenderData.pdf, newRenderData.pdf, ["context", "page"]);
    return needsRender;
};
pdfRenderer.prototype.arePropsDiff = function (objectA, objectB, props) {
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (objectA[prop] !== objectB[prop]) {
            return true;
        }
    }
    return false;
};

export default pdfRenderer;