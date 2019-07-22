"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var image_base_1 = require("./image_base");
var linear_color_mapper_1 = require("../mappers/linear_color_mapper");
var p = require("../../core/properties");
var array_1 = require("../../core/util/array");
var ImageView = /** @class */ (function (_super) {
    tslib_1.__extends(ImageView, _super);
    function ImageView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageView.prototype.initialize = function () {
        var _this = this;
        _super.prototype.initialize.call(this);
        this.connect(this.model.color_mapper.change, function () { return _this._update_image(); });
        this.connect(this.model.properties.global_alpha.change, function () { return _this.renderer.request_render(); });
    };
    ImageView.prototype._update_image = function () {
        // Only reset image_data if already initialized
        if (this.image_data != null) {
            this._set_data();
            this.renderer.plot_view.request_render();
        }
    };
    ImageView.prototype._set_data = function () {
        this._set_width_heigh_data();
        var cmap = this.model.color_mapper.rgba_mapper;
        for (var i = 0, end = this._image.length; i < end; i++) {
            var img = void 0;
            if (this._image_shape != null && this._image_shape[i].length > 0) {
                img = this._image[i];
                var shape = this._image_shape[i];
                this._height[i] = shape[0];
                this._width[i] = shape[1];
            }
            else {
                var _image = this._image[i];
                img = array_1.concat(_image);
                this._height[i] = _image.length;
                this._width[i] = _image[0].length;
            }
            var buf8 = cmap.v_compute(img);
            this._set_image_data_from_buffer(i, buf8);
        }
    };
    ImageView.prototype._render = function (ctx, indices, _a) {
        var image_data = _a.image_data, sx = _a.sx, sy = _a.sy, sw = _a.sw, sh = _a.sh;
        var old_smoothing = ctx.getImageSmoothingEnabled();
        ctx.setImageSmoothingEnabled(false);
        ctx.globalAlpha = this.model.global_alpha;
        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
            var i = indices_1[_i];
            if (image_data[i] == null)
                continue;
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
    return ImageView;
}(image_base_1.ImageBaseView));
exports.ImageView = ImageView;
// NOTE: this needs to be redefined here, because palettes are located in bokeh-api.js bundle
var Greys9 = function () { return ["#000000", "#252525", "#525252", "#737373", "#969696", "#bdbdbd", "#d9d9d9", "#f0f0f0", "#ffffff"]; };
var Image = /** @class */ (function (_super) {
    tslib_1.__extends(Image, _super);
    function Image(attrs) {
        return _super.call(this, attrs) || this;
    }
    Image.initClass = function () {
        this.prototype.type = 'Image';
        this.prototype.default_view = ImageView;
        this.define({
            color_mapper: [p.Instance, function () { return new linear_color_mapper_1.LinearColorMapper({ palette: Greys9() }); }],
        });
    };
    return Image;
}(image_base_1.ImageBase));
exports.Image = Image;
Image.initClass();
