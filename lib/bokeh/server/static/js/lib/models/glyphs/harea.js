"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var area_1 = require("./area");
var spatial_1 = require("../../core/util/spatial");
var p = require("../../core/properties");
var HAreaView = /** @class */ (function (_super) {
    tslib_1.__extends(HAreaView, _super);
    function HAreaView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HAreaView.prototype._index_data = function () {
        var points = [];
        for (var i = 0, end = this._x1.length; i < end; i++) {
            var x1 = this._x1[i];
            var x2 = this._x2[i];
            var y = this._y[i];
            if (isNaN(x1 + x2 + y) || !isFinite(x1 + x2 + y))
                continue;
            points.push({ minX: Math.min(x1, x2), minY: y, maxX: Math.max(x1, x2), maxY: y, i: i });
        }
        return new spatial_1.SpatialIndex(points);
    };
    HAreaView.prototype._inner = function (ctx, sx1, sx2, sy, func) {
        ctx.beginPath();
        for (var i = 0, end = sx1.length; i < end; i++) {
            ctx.lineTo(sx1[i], sy[i]);
        }
        // iterate backwards so that the upper end is below the lower start
        for (var start = sx2.length - 1, i = start; i >= 0; i--) {
            ctx.lineTo(sx2[i], sy[i]);
        }
        ctx.closePath();
        func.call(ctx);
    };
    HAreaView.prototype._render = function (ctx, _indices, _a) {
        var _this = this;
        var sx1 = _a.sx1, sx2 = _a.sx2, sy = _a.sy;
        if (this.visuals.fill.doit) {
            this.visuals.fill.set_value(ctx);
            this._inner(ctx, sx1, sx2, sy, ctx.fill);
        }
        this.visuals.hatch.doit2(ctx, 0, function () { return _this._inner(ctx, sx1, sx2, sy, ctx.fill); }, function () { return _this.renderer.request_render(); });
    };
    HAreaView.prototype.scenterx = function (i) {
        return (this.sx1[i] + this.sx2[i]) / 2;
    };
    HAreaView.prototype.scentery = function (i) {
        return this.sy[i];
    };
    HAreaView.prototype._map_data = function () {
        this.sx1 = this.renderer.xscale.v_compute(this._x1);
        this.sx2 = this.renderer.xscale.v_compute(this._x2);
        this.sy = this.renderer.yscale.v_compute(this._y);
    };
    return HAreaView;
}(area_1.AreaView));
exports.HAreaView = HAreaView;
var HArea = /** @class */ (function (_super) {
    tslib_1.__extends(HArea, _super);
    function HArea(attrs) {
        return _super.call(this, attrs) || this;
    }
    HArea.initClass = function () {
        this.prototype.type = 'HArea';
        this.prototype.default_view = HAreaView;
        this.define({
            x1: [p.CoordinateSpec],
            x2: [p.CoordinateSpec],
            y: [p.CoordinateSpec],
        });
    };
    return HArea;
}(area_1.Area));
exports.HArea = HArea;
HArea.initClass();
