"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var image_base_1 = require("./image_base");
var array_1 = require("../../core/util/array");
var ImageRGBAView = /** @class */ (function (_super) {
    tslib_1.__extends(ImageRGBAView, _super);
    function ImageRGBAView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageRGBAView.prototype.initialize = function () {
        var _this = this;
        _super.prototype.initialize.call(this);
        this.connect(this.model.properties.global_alpha.change, function () { return _this.renderer.request_render(); });
    };
    ImageRGBAView.prototype._set_data = function (indices) {
        this._set_width_heigh_data();
        for (var i = 0, end = this._image.length; i < end; i++) {
            if (indices != null && indices.indexOf(i) < 0)
                continue;
            var buf = void 0;
            if (this._image_shape != null && this._image_shape[i].length > 0) {
                buf = this._image[i].buffer;
                var shape = this._image_shape[i];
                this._height[i] = shape[0];
                this._width[i] = shape[1];
            }
            else {
                var _image = this._image[i];
                var flat = array_1.concat(_image);
                buf = new ArrayBuffer(flat.length * 4);
                var color = new Uint32Array(buf);
                for (var j = 0, endj = flat.length; j < endj; j++) {
                    color[j] = flat[j];
                }
                this._height[i] = _image.length;
                this._width[i] = _image[0].length;
            }
            var buf8 = new Uint8Array(buf);
            this._set_image_data_from_buffer(i, buf8);
        }
    };
    ImageRGBAView.prototype._render = function (ctx, indices, _a) {
        var image_data = _a.image_data, sx = _a.sx, sy = _a.sy, sw = _a.sw, sh = _a.sh;
        var old_smoothing = ctx.getImageSmoothingEnabled();
        ctx.setImageSmoothingEnabled(false);
        ctx.globalAlpha = this.model.global_alpha;
        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
            var i = indices_1[_i];
            if (isNaN(sx[i] + sy[i] + sw[i] + sh[i]))
                continue;
            var y_offset = sy[i];
            ctx.translate(0, y_offset);
            ctx.scale(1, -1);
            ctx.translate(0, -y_offset);
            ctx.drawImage(image_data[i], sx[i] | 0, sy[i] | 0, sw[i], sh[i]);
            ctx.translate(0, y_offset);
            ctx.scale(1, -1);
            ctx.translate(0, -y_offset);
        }
        ctx.setImageSmoothingEnabled(old_smoothing);
    };
    return ImageRGBAView;
}(image_base_1.ImageBaseView));
exports.ImageRGBAView = ImageRGBAView;
var ImageRGBA = /** @class */ (function (_super) {
    tslib_1.__extends(ImageRGBA, _super);
    function ImageRGBA(attrs) {
        return _super.call(this, attrs) || this;
    }
    ImageRGBA.initClass = function () {
        this.prototype.type = 'ImageRGBA';
        this.prototype.default_view = ImageRGBAView;
    };
    return ImageRGBA;
}(image_base_1.ImageBase));
exports.ImageRGBA = ImageRGBA;
ImageRGBA.initClass();
