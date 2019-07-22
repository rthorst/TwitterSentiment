"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var guide_renderer_1 = require("../renderers/guide_renderer");
var p = require("../../core/properties");
var types_1 = require("../../core/util/types");
var GridView = /** @class */ (function (_super) {
    tslib_1.__extends(GridView, _super);
    function GridView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(GridView.prototype, "_x_range_name", {
        get: function () {
            return this.model.x_range_name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "_y_range_name", {
        get: function () {
            return this.model.y_range_name;
        },
        enumerable: true,
        configurable: true
    });
    GridView.prototype.render = function () {
        if (!this.model.visible)
            return;
        var ctx = this.plot_view.canvas_view.ctx;
        ctx.save();
        this._draw_regions(ctx);
        this._draw_minor_grids(ctx);
        this._draw_grids(ctx);
        ctx.restore();
    };
    GridView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.change, function () { return _this.request_render(); });
    };
    GridView.prototype._draw_regions = function (ctx) {
        var _this = this;
        if (!this.visuals.band_fill.doit && !this.visuals.band_hatch.doit)
            return;
        this.visuals.band_fill.set_value(ctx);
        var _a = this.grid_coords('major', false), xs = _a[0], ys = _a[1];
        var _loop_1 = function (i) {
            if (i % 2 != 1)
                return "continue";
            var _a = this_1.plot_view.map_to_screen(xs[i], ys[i], this_1._x_range_name, this_1._y_range_name), sx0 = _a[0], sy0 = _a[1];
            var _b = this_1.plot_view.map_to_screen(xs[i + 1], ys[i + 1], this_1._x_range_name, this_1._y_range_name), sx1 = _b[0], sy1 = _b[1];
            if (this_1.visuals.band_fill.doit)
                ctx.fillRect(sx0[0], sy0[0], sx1[1] - sx0[0], sy1[1] - sy0[0]);
            this_1.visuals.band_hatch.doit2(ctx, i, function () {
                ctx.fillRect(sx0[0], sy0[0], sx1[1] - sx0[0], sy1[1] - sy0[0]);
            }, function () { return _this.request_render(); });
        };
        var this_1 = this;
        for (var i = 0; i < xs.length - 1; i++) {
            _loop_1(i);
        }
    };
    GridView.prototype._draw_grids = function (ctx) {
        if (!this.visuals.grid_line.doit)
            return;
        var _a = this.grid_coords('major'), xs = _a[0], ys = _a[1];
        this._draw_grid_helper(ctx, this.visuals.grid_line, xs, ys);
    };
    GridView.prototype._draw_minor_grids = function (ctx) {
        if (!this.visuals.minor_grid_line.doit)
            return;
        var _a = this.grid_coords('minor'), xs = _a[0], ys = _a[1];
        this._draw_grid_helper(ctx, this.visuals.minor_grid_line, xs, ys);
    };
    GridView.prototype._draw_grid_helper = function (ctx, visuals, xs, ys) {
        visuals.set_value(ctx);
        for (var i = 0; i < xs.length; i++) {
            var _a = this.plot_view.map_to_screen(xs[i], ys[i], this._x_range_name, this._y_range_name), sx = _a[0], sy = _a[1];
            ctx.beginPath();
            ctx.moveTo(Math.round(sx[0]), Math.round(sy[0]));
            for (var i_1 = 1; i_1 < sx.length; i_1++)
                ctx.lineTo(Math.round(sx[i_1]), Math.round(sy[i_1]));
            ctx.stroke();
        }
    };
    // {{{ TODO: state
    GridView.prototype.ranges = function () {
        var i = this.model.dimension;
        var j = (i + 1) % 2;
        var frame = this.plot_view.frame;
        var ranges = [
            frame.x_ranges[this.model.x_range_name],
            frame.y_ranges[this.model.y_range_name],
        ];
        return [ranges[i], ranges[j]];
    };
    GridView.prototype.computed_bounds = function () {
        var _a;
        var range = this.ranges()[0];
        var user_bounds = this.model.bounds;
        var range_bounds = [range.min, range.max];
        var start;
        var end;
        if (types_1.isArray(user_bounds)) {
            start = Math.min(user_bounds[0], user_bounds[1]);
            end = Math.max(user_bounds[0], user_bounds[1]);
            if (start < range_bounds[0])
                start = range_bounds[0];
            // XXX:
            //else if (start > range_bounds[1])
            //  start = null
            if (end > range_bounds[1])
                end = range_bounds[1];
            // XXX:
            //else if (end < range_bounds[0])
            //  end = null
        }
        else {
            start = range_bounds[0], end = range_bounds[1];
            for (var _i = 0, _b = this.plot_view.axis_views; _i < _b.length; _i++) {
                var axis_view = _b[_i];
                if (axis_view.dimension == this.model.dimension
                    && axis_view.model.x_range_name == this.model.x_range_name
                    && axis_view.model.y_range_name == this.model.y_range_name) {
                    _a = axis_view.computed_bounds, start = _a[0], end = _a[1];
                }
            }
        }
        return [start, end];
    };
    GridView.prototype.grid_coords = function (location, exclude_ends) {
        var _a;
        if (exclude_ends === void 0) { exclude_ends = true; }
        var i = this.model.dimension;
        var j = (i + 1) % 2;
        var _b = this.ranges(), range = _b[0], cross_range = _b[1];
        var _c = this.computed_bounds(), start = _c[0], end = _c[1];
        _a = [Math.min(start, end), Math.max(start, end)], start = _a[0], end = _a[1];
        // TODO: (bev) using cross_range.min for cross_loc is a bit of a cheat. Since we
        // currently only support "straight line" grids, this should be OK for now. If
        // we ever want to support "curved" grids, e.g. for some projections, we may
        // have to communicate more than just a single cross location.
        var ticks = this.model.ticker.get_ticks(start, end, range, cross_range.min, {})[location];
        var min = range.min;
        var max = range.max;
        var cmin = cross_range.min;
        var cmax = cross_range.max;
        var coords = [[], []];
        if (!exclude_ends) {
            if (ticks[0] != min)
                ticks.splice(0, 0, min);
            if (ticks[ticks.length - 1] != max)
                ticks.push(max);
        }
        for (var ii = 0; ii < ticks.length; ii++) {
            if ((ticks[ii] == min || ticks[ii] == max) && exclude_ends)
                continue;
            var dim_i = [];
            var dim_j = [];
            var N = 2;
            for (var n = 0; n < N; n++) {
                var loc = cmin + (cmax - cmin) / (N - 1) * n;
                dim_i.push(ticks[ii]);
                dim_j.push(loc);
            }
            coords[i].push(dim_i);
            coords[j].push(dim_j);
        }
        return coords;
    };
    return GridView;
}(guide_renderer_1.GuideRendererView));
exports.GridView = GridView;
var Grid = /** @class */ (function (_super) {
    tslib_1.__extends(Grid, _super);
    function Grid(attrs) {
        return _super.call(this, attrs) || this;
    }
    Grid.initClass = function () {
        this.prototype.type = "Grid";
        this.prototype.default_view = GridView;
        this.mixins(['line:grid_', 'line:minor_grid_', 'fill:band_', 'hatch:band_']);
        this.define({
            bounds: [p.Any, 'auto'],
            dimension: [p.Any, 0],
            ticker: [p.Instance],
            x_range_name: [p.String, 'default'],
            y_range_name: [p.String, 'default'],
        });
        this.override({
            level: "underlay",
            band_fill_color: null,
            band_fill_alpha: 0,
            grid_line_color: '#e5e5e5',
            minor_grid_line_color: null,
        });
    };
    return Grid;
}(guide_renderer_1.GuideRenderer));
exports.Grid = Grid;
Grid.initClass();
