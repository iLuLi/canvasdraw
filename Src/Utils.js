import _ from 'lodash';

/**
 * 工具类，用于触发事件，处理图片
 * 
 * @constructor
 * 
 * @param {Promise} $p Promise 
 * @param {bool} isMobile 
 * @param {EventDispatch} eventEmitter 提供emit方法用于触发事件
 */
function utils($p, isMobile, eventEmitter) {
    this.promise = $p;
    this.isMobile = isMobile;
    this.eventEmitter = eventEmitter;
}
utils.prototype.emitEvent = function (name) {
    if(this.eventEmitter) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _a;
        (_a = this.eventEmitter).emit.apply(_a, [name].concat(args));
    }
    
};

/**
 * 通过url获取img对象
 * 
 * @param {String} url 
 * @returns Promise
 */
utils.prototype.getImage = function (url) {
    var promise = this.promise;
    return new promise(function(resove) {
        var imageObject = new Image();
        var isDataUri = _.startsWith(url, "data:image");
        imageObject.onload = function () { resolve(imageObject); };
        if (isDataUri) {
            imageObject.src = this.createShortUrl(url);
        }
        else {
            imageObject.crossOrigin = "anonymous";
            imageObject.src = url;
        }
    });
    
};
/**
 * canvas保存为blob格式图片
 * 
 * @param {canvas} canvas 
 * @returns Promise
 */
utils.prototype.getImageBlob = function (canvas) {
    var _this = this;
    return new this.promise(function (resolve) {
        if (HTMLCanvasElement.prototype.toBlob) {
            canvas.toBlob(function (blob) {
                resolve(blob);
            });
        }
        else {
            var url = canvas.toDataURL();
            var blob = _this.dataURItoBlob(url);
            resolve(blob);
        }
    });
};

/**
 * base64格式转为blob
 * 
 * @param {String} dataURI 
 * @returns Blob
 */
utils.prototype.dataURItoBlob = function (dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
};

/**
 * blob形式的短连接URL
 * 
 * @param {String} url 
 * @returns String
 */
utils.prototype.createShortUrl = function (url) {
    var blob = this.dataURItoBlob(url);
    return URL.createObjectURL(blob);
};

/**
 * 随机编号
 * 
 * @param {String} prefix 
 * @returns String
 */
utils.makeId = function (prefix) {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return prefix + "-" + S4() + S4() + S4() + S4();
};

export default utils;