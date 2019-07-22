"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xy_glyph_1 = require("./xy_glyph");
var p = require("../../core/properties");
var hittest = require("../../core/hittest");
var spatial_1 = require("../../core/util/spatial");
var ImageBaseView = /** @class */ (function (_super) {
    tslib_1.__extends(ImageBaseView, _super);
    function ImageBaseView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageBaseView.prototype._render = function (_ctx, _indices, _data) { };
    ImageBaseView.prototype._index_data = function () {
        var points = [];
        for (var i = 0, end = this._x.length; i < end; i++) {
            var _a = this._lrtb(i), l = _a[0], r = _a[1], t = _a[2], b = _a[3];
            if (isNaN(l + r + t + b) || !isFinite(l + r + t + b)) {
                continue;
            }
            points.push({ minX: l, minY: b, maxX: r, maxY: t, i: i });
        }
        return new spatial_1.SpatialIndex(points);
    };
    ImageBaseView.prototype._lrtb = function (i) {
        var xr = this.renderer.xscale.source_range;
        var x1 = this._x[i];
        var x2 = xr.is_reversed ? x1 - this._dw[i] : x1 + this._dw[i];
        var yr = this.renderer.yscale.source_range;
        var y1 = this._y[i];
        var y2 = yr.is_reversed ? y1 - this._dh[i] : y1 + this._dh[i];
        var _a = x1 < x2 ? [x1, x2] : [x2, x1], l = _a[0], r = _a[1];
        var _b = y1 < y2 ? [y1, y2] : [y2, y1], b = _b[0], t = _b[1];
        return [l, r, t, b];
    };
    ImageBaseView.prototype._set_width_heigh_data = function () {
        if (this.image_data == null || this.image_data.length != this._image.length)
            this.image_data = new Array(this._image.length);
        if (this._width == null || this._width.length != this._image.length)
            this._width = new Array(this._image.length);
        if (this._height == null || this._height.length != this._image.length)
            this._height = new Array(this._image.length);
    };
    ImageBaseView.prototype._get_or_create_canvas = function (i) {
        var _image_data = this.image_data[i];
        if (_image_data != null && _image_data.width == this._width[i] &&
            _image_data.height == this._height[i])
            return _image_data;
        else {
            var canvas = document.createElement('canvas');
            canvas.width = this._width[i];
            canvas.height = this._height[i];
            return canvas;
        }
    };
    ImageBaseView.prototype._set_image_data_from_buffer = function (i, buf8) {
        var canvas = this._get_or_create_canvas(i);
        var ctx = canvas.getContext('2d');
        var image_data = ctx.getImageData(0, 0, this._width[i], this._height[i]);
        image_data.data.set(buf8);
        ctx.putImageData(image_data, 0, 0);
        this.image_data[i] = canvas;
    };
    ImageBaseView.prototype._map_data = function () {
        switch (this.model.properties.dw.units) {
            case "data": {
                this.sw = this.sdist(this.renderer.xscale, this._x, this._dw, 'edge', this.model.dilate);
                break;
            }
            case "screen": {
                this.sw = this._dw;
                break;
            }
        }
        switch (this.model.properties.dh.units) {
            case "data": {
                this.sh = this.sdist(this.renderer.yscale, this._y, this._dh, 'edge', this.model.dilate);
                break;
            }
            case "screen": {
                this.sh = this._dh;
                break;
            }
        }
    };
    ImageBaseView.prototype._image_index = function (index, x, y) {
        var _a = this._lrtb(index), l = _a[0], r = _a[1], t = _a[2], b = _a[3];
        var width = this._width[index];
        var height = this._height[index];
        var dx = (r - l) / width;
        var dy = (t - b) / height;
        var dim1 = Math.floor((x - l) / dx);
        var dim2 = Math.floor((y - b) / dy);
        return { index: index, dim1: dim1, dim2: dim2, flat_index: dim2 * width + dim1 };
    };
    ImageBaseView.prototype._hit_point = function (geometry) {
        var sx = geometry.sx, sy = geometry.sy;
        var x = this.renderer.xscale.invert(sx);
        var y = this.renderer.yscale.invert(sy);
        var bbox = hittest.validate_bbox_coords([x, x], [y, y]);
        var candidates = this.index.indices(bbox);
        var result = hittest.create_empty_hit_test_result();
        result.image_indices = [];
        for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
            var index = candidates_1[_i];
            if ((sx != Infinity) && (sy != Infinity)) {
                result.image_indices.push(this._image_index(index, x, y));
            }
        }
        return result;
    };
    return ImageBaseView;
}(xy_glyph_1.XYGlyphView));
exports.ImageBaseView = ImageBaseView;
var ImageBase = /** @class */ (function (_super) {
    tslib_1.__extends(ImageBase, _super);
    function ImageBase(attrs) {
        return _super.call(this, attrs) || this;
    }
    ImageBase.initClass = function () {
        this.prototype.type = 'ImageBase';
        this.prototype.default_view = ImageBaseView;
        this.define({
            image: [p.NumberSpec],
            dw: [p.DistanceSpec],
            dh: [p.DistanceSpec],
            dilate: [p.Boolean, false],
            global_alpha: [p.Number, 1.0],
        });
    };
    return ImageBase;
}(xy_glyph_1.XYGlyph));
exports.ImageBase = ImageBase;
ImageBase.initClass();
