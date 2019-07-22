"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var p = require("../../core/properties");
var signaling_1 = require("../../core/signaling");
var array_1 = require("../../core/util/array");
var object_1 = require("../../core/util/object");
var types_1 = require("../../core/util/types");
var layout_dom_1 = require("../layouts/layout_dom");
var title_1 = require("../annotations/title");
var linear_scale_1 = require("../scales/linear_scale");
var toolbar_1 = require("../tools/toolbar");
var column_data_source_1 = require("../sources/column_data_source");
var glyph_renderer_1 = require("../renderers/glyph_renderer");
var data_range1d_1 = require("../ranges/data_range1d");
var plot_canvas_1 = require("./plot_canvas");
exports.PlotView = plot_canvas_1.PlotView;
var Plot = /** @class */ (function (_super) {
    tslib_1.__extends(Plot, _super);
    function Plot(attrs) {
        return _super.call(this, attrs) || this;
    }
    Plot.initClass = function () {
        this.prototype.type = "Plot";
        this.prototype.default_view = plot_canvas_1.PlotView;
        this.mixins(["line:outline_", "fill:background_", "fill:border_"]);
        this.define({
            toolbar: [p.Instance, function () { return new toolbar_1.Toolbar(); }],
            toolbar_location: [p.Location, 'right'],
            toolbar_sticky: [p.Boolean, true],
            plot_width: [p.Number, 600],
            plot_height: [p.Number, 600],
            frame_width: [p.Number, null],
            frame_height: [p.Number, null],
            title: [p.Any, function () { return new title_1.Title({ text: "" }); }],
            title_location: [p.Location, 'above'],
            above: [p.Array, []],
            below: [p.Array, []],
            left: [p.Array, []],
            right: [p.Array, []],
            center: [p.Array, []],
            renderers: [p.Array, []],
            x_range: [p.Instance, function () { return new data_range1d_1.DataRange1d(); }],
            extra_x_ranges: [p.Any, {}],
            y_range: [p.Instance, function () { return new data_range1d_1.DataRange1d(); }],
            extra_y_ranges: [p.Any, {}],
            x_scale: [p.Instance, function () { return new linear_scale_1.LinearScale(); }],
            y_scale: [p.Instance, function () { return new linear_scale_1.LinearScale(); }],
            lod_factor: [p.Number, 10],
            lod_interval: [p.Number, 300],
            lod_threshold: [p.Number, 2000],
            lod_timeout: [p.Number, 500],
            hidpi: [p.Boolean, true],
            output_backend: [p.OutputBackend, "canvas"],
            min_border: [p.Number, 5],
            min_border_top: [p.Number, null],
            min_border_left: [p.Number, null],
            min_border_bottom: [p.Number, null],
            min_border_right: [p.Number, null],
            inner_width: [p.Number],
            inner_height: [p.Number],
            outer_width: [p.Number],
            outer_height: [p.Number],
            match_aspect: [p.Boolean, false],
            aspect_scale: [p.Number, 1],
            reset_policy: [p.ResetPolicy, "standard"],
        });
        this.override({
            outline_line_color: "#e5e5e5",
            border_fill_color: "#ffffff",
            background_fill_color: "#ffffff",
        });
    };
    Object.defineProperty(Plot.prototype, "width", {
        get: function () {
            var width = this.getv("width");
            return width != null ? width : this.plot_width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plot.prototype, "height", {
        get: function () {
            var height = this.getv("height");
            return height != null ? height : this.plot_height;
        },
        enumerable: true,
        configurable: true
    });
    Plot.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.reset = new signaling_1.Signal0(this, "reset");
        for (var _i = 0, _a = object_1.values(this.extra_x_ranges).concat(this.x_range); _i < _a.length; _i++) {
            var xr = _a[_i];
            var plots = xr.plots;
            if (types_1.isArray(plots)) {
                plots = plots.concat(this);
                xr.setv({ plots: plots }, { silent: true });
            }
        }
        for (var _b = 0, _c = object_1.values(this.extra_y_ranges).concat(this.y_range); _b < _c.length; _b++) {
            var yr = _c[_b];
            var plots = yr.plots;
            if (types_1.isArray(plots)) {
                plots = plots.concat(this);
                yr.setv({ plots: plots }, { silent: true });
            }
        }
    };
    Plot.prototype.add_layout = function (renderer, side) {
        if (side === void 0) { side = "center"; }
        var side_renderers = this.getv(side);
        side_renderers.push(renderer /* XXX */);
    };
    Plot.prototype.remove_layout = function (renderer) {
        var del = function (items) {
            array_1.remove_by(items, function (item) { return item == renderer; });
        };
        del(this.left);
        del(this.right);
        del(this.above);
        del(this.below);
        del(this.center);
    };
    Plot.prototype.add_renderers = function () {
        var renderers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            renderers[_i] = arguments[_i];
        }
        this.renderers = this.renderers.concat(renderers);
    };
    Plot.prototype.add_glyph = function (glyph, source, extra_attrs) {
        if (source === void 0) { source = new column_data_source_1.ColumnDataSource(); }
        if (extra_attrs === void 0) { extra_attrs = {}; }
        var attrs = tslib_1.__assign({}, extra_attrs, { data_source: source, glyph: glyph });
        var renderer = new glyph_renderer_1.GlyphRenderer(attrs);
        this.add_renderers(renderer);
        return renderer;
    };
    Plot.prototype.add_tools = function () {
        var tools = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tools[_i] = arguments[_i];
        }
        this.toolbar.tools = this.toolbar.tools.concat(tools);
    };
    Object.defineProperty(Plot.prototype, "panels", {
        get: function () {
            return this.side_panels.concat(this.center);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plot.prototype, "side_panels", {
        get: function () {
            var _a = this, above = _a.above, below = _a.below, left = _a.left, right = _a.right;
            return array_1.concat([above, below, left, right]);
        },
        enumerable: true,
        configurable: true
    });
    return Plot;
}(layout_dom_1.LayoutDOM));
exports.Plot = Plot;
Plot.initClass();
