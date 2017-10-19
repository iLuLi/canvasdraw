import {RENDER_TYPES, COMMANDS} from './Constants';
import lineGrid from './LineGrid';
import shapeGrid from './ShapeGrid';
import utils from './Utils';
import CommandManager from './CommandManager';
import _ from 'lodash';

function grid(currentUserId, utils) {
    this.utils = utils;
    this.copyBuffer = null;
    this.width = 0;
    this.height = 0;
    this.zIndex = 0;
    this.currentPageNum = 1;
    this.lineGrid = new lineGrid();
    this.shapeGrid = new shapeGrid();
    this.commandManager = new CommandManager(this, this.utils);
    this.grids = (_a = {},
        _a[RENDER_TYPES.STROKE] = this.lineGrid,
        _a[RENDER_TYPES.TEXT] = this.shapeGrid,
        _a[RENDER_TYPES.SHAPE] = this.shapeGrid,
        _a);
    this.gridArr = [this.lineGrid, this.shapeGrid];
    this.currentUserId = currentUserId;
    var _a;
}
grid.prototype.initialize = function (width, height) {
    this.width = width;
    this.height = height;
    this.pageNum = 1;
    this.zIndex = 0;
    this.layers = {};
    this.currentLayer = this.createLayer(this.currentUserId);
    this.gridArr.forEach(function (grid) {
        grid.initialize(width, height);
    });
    this.commandManager.initialize();
};
grid.prototype.updatePageNumber = function (pageNum) {
    this.currentPageNum = pageNum;
};
grid.prototype.load = function (layers) {
    var _this = this;
    layers.forEach(function (layerData) {
        var layer = _this.createLayer(layerData.userId, layerData);
        _.forEach(layerData.pages, function (pageData) {
            var page = _this.createPage(layer, pageData.pageNum);
            _this.gridArr.forEach(function (grid) {
                grid.loadPage(layer.layerId, page, pageData);
            });
            layer.pages[page.pageNum] = page;
        });
    });
    // make sure the current layer is on top
    this.currentLayer.orderNum = this.getNextOrderNum();
};
grid.prototype.searchAt = function (x, y, radius) {
    var _this = this;
    var pages = this.getAllVisiblePages();
    var objects = [];
    _.forEach(pages, function (page) {
        var searchResults = _this.applyGridCollectionFunc(function (grid) { return grid.searchAt(page, x, y, radius); });
        objects = objects.concat(searchResults);
    });
    return objects;
};
grid.prototype.searchFor = function (x, y, radius, type) {
    var objects = this.searchAt(x, y, radius);
    return _.filter(objects, { type: type });
};
grid.prototype.eraseObjects = function (objectsErased) {
    var somethingErased = objectsErased.length > 0;
    if (somethingErased) {
        this.commandManager.addAction({
            command: COMMANDS.ERASED_OBJECTS,
            objects: objectsErased
        });
    }
    this.removeObjects(objectsErased);
    return somethingErased;
};
grid.prototype.clearAll = function () {
    var _this = this;
    var pages = this.getAllVisiblePages();
    var objects = _.reduce(pages, function (objects, page) { return objects.concat(_this.getAllRenderObjects(page)); }, []);
    if (objects.length) {
        this.commandManager.addAction({
            command: COMMANDS.ERASED_OBJECTS,
            objects: objects
        });
    }
    pages.forEach(function (page) {
        _this.gridArr.forEach(function (grid) {
            grid.clear(page);
        });
    });
};
grid.prototype.addRenderObject = function (object) {
    if (object.isEditing) {
        object.isEditing = false;
        return;
    }
    object.zIndex = this.zIndex++;
    object.layerId = this.currentLayer.layerId;
    object.pageNum = this.currentPageNum;
    var page = this.getLayerPage(this.currentLayer.layerId, this.currentPageNum);
    this.grids[object.type].addObject(page, object);
    this.commandManager.addAction({
        command: COMMANDS.ADDED_OBJECTS,
        objects: [object]
    });
};
grid.prototype.getAllRenderPages = function () {
    var pages = this.getAllVisiblePages();
    return _.sortBy(pages, "orderNum");
};
grid.prototype.getAllVisiblePages = function () {
    var _this = this;
    var pages = [];
    _.forEach(this.layers, function (layer) {
        if (layer.visible && layer.pages[_this.currentPageNum]) {
            pages.push(layer.pages[_this.currentPageNum]);
        }
    });
    return pages;
};
grid.prototype.getAllRenderObjects = function (page) {
    var objects = this.applyGridCollectionFunc(function (grid) { return grid.getObjects(page); });
    return _.sortBy(objects, function (obj) { return obj.zIndex; });
};
;
grid.prototype.undo = function () {
    this.commandManager.undoLastAction();
};
grid.prototype.redo = function () {
    this.commandManager.redoLastAction();
};
grid.prototype.savePosition = function (object) {
    this.grids[object.type].savePosition(object);
};
// TODO make more generic
grid.prototype.transformApplied = function (object) {
    var shape = object;
    if (!_.isEqual(shape.savedPosition, { p1: shape.p1, p2: shape.p2 })) {
        this.commandManager.addAction({
            command: COMMANDS.TRANSFORM_OBJECTS,
            objects: [shape],
            transforms: [{
                    startP1: _.clone(shape.savedPosition.p1),
                    startP2: _.clone(shape.savedPosition.p2),
                    endP1: _.clone(shape.p1),
                    endP2: _.clone(shape.p2)
                }]
        });
    }
    shape.savedPosition = null;
};
// use eraseObjects in tools
grid.prototype.removeObjects = function (objects) {
    var _this = this;
    objects.forEach(function (object) {
        var page = _this.getLayerPage(object.layerId, object.pageNum);
        _this.grids[object.type].removeObject(page, object);
    });
};
;
// use addRenderObject in tools
grid.prototype.addObjects = function (objects) {
    var _this = this;
    objects.forEach(function (object) {
        var page = _this.getLayerPage(object.layerId, object.pageNum);
        _this.grids[object.type].addObject(page, object);
    });
};
;
// only use from command manager
grid.prototype.applyTransforms = function (objects, transforms) {
    for (var i = 0; i < objects.length; i++) {
        var shape = objects[i];
        shape.p1 = transforms[i].endP1;
        shape.p2 = transforms[i].endP2;
    }
};
grid.prototype.createLayer = function (createdBy, layerData) {
    if (layerData === void 0) { layerData = {}; }
    var layerId = layerData.layerId || utils.makeId("layer");
    var orderNum = layerData.orderNum || this.getNextOrderNum();
    var layer = {
        layerId: layerId,
        name: "layer " + orderNum,
        createdBy: layerData.createdBy || createdBy,
        createdOn: layerData.createdOn || new Date(),
        visible: true,
        orderNum: orderNum,
        // pages are created lazily
        pages: {}
    };
    this.layers[layer.layerId] = layer;
    return layer;
};
grid.prototype.getSaveData = function (position) {
    var _this = this;
    var savableLayers = [];
    _.forEach(this.layers, function (layer) {
        var pages = [];
        _.forEach(layer.pages, function (page) {
            var objects = _this.applyGridCollectionFunc(function (grid) { return grid.getSavableObjects(page, position); });
            // discard any pages without objects
            if (objects.length === 0) {
                return;
            }
            pages.push({ pageNum: page.pageNum, objects: objects });
        });
        // discard any layers without objects
        if (pages.length === 0) {
            return;
        }
        var savableLayer = {
            layerId: layer.layerId,
            name: layer.name,
            createdBy: layer.createdBy,
            createdOn: layer.createdOn,
            visible: layer.visible,
            orderNum: layer.orderNum,
            pages: pages
        };
        savableLayers.push(savableLayer);
    });
    return savableLayers;
};
grid.prototype.getLayerPage = function (layerId, pageNum) {
    var layer = this.layers[layerId];
    var page = layer.pages[pageNum];
    if (!page) {
        page = this.createPage(layer, pageNum);
    }
    return page;
};
grid.prototype.hasContent = function () {
    var pages = this.getAllPages();
    for (var i = 0; i < pages.length; i++) {
        var objects = this.getAllRenderObjects(pages[i]);
        if (objects.length > 0) {
            return true;
        }
    }
    return false;
};
grid.prototype.addToCopyBuffer = function (object) {
    this.copyBuffer = _.cloneDeep(object);
};
grid.prototype.pasteCopyBuffer = function () {
    var object = _.cloneDeep(this.copyBuffer);
    this.addRenderObject(object);
    return object;
};
grid.prototype.createPage = function (layer, pageNum) {
    var page = {
        layerId: layer.layerId,
        pageNum: pageNum || this.currentPageNum,
        shapes: [],
        strokes: [],
        strokeGrid: []
    };
    layer.pages[pageNum] = page;
    return page;
};
grid.prototype.applyAllLayersCollectionFunc = function (fn) {
    var _this = this;
    var objects = [];
    _.forEach(this.layers, function (layer) {
        var page = layer.pages[_this.currentPageNum];
        if (!layer.visible || !page) {
            return;
        }
        _this.gridArr.forEach(function (grid) {
            objects = objects.concat(fn(page, grid));
        });
    });
    return objects;
};
grid.prototype.applyGridCollectionFunc = function (fn) {
    var objects = [];
    this.gridArr.forEach(function (grid) {
        objects = objects.concat(fn(grid));
    });
    return objects;
};
grid.prototype.getNextOrderNum = function () {
    return _.reduce(this.layers, function (max, layer) { return layer.orderNum > max ? layer.orderNum : max; }, 0) + 1;
};
grid.prototype.getAllPages = function () {
    var pages = [];
    _.forEach(this.layers, function (layer) {
        _.forEach(layer.pages, function (page) {
            pages.push(page);
        });
    });
    return pages;
};

export default grid;