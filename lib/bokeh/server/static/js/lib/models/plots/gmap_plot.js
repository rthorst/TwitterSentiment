"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var logging_1 = require("../../core/logging");
var plot_1 = require("./plot");
var p = require("../../core/properties");
var model_1 = require("../../model");
var range1d_1 = require("../ranges/range1d");
var gmap_plot_canvas_1 = require("./gmap_plot_canvas");
exports.GMapPlotView = gmap_plot_canvas_1.GMapPlotView;
var MapOptions = /** @class */ (function (_super) {
    tslib_1.__extends(MapOptions, _super);
    function MapOptions(attrs) {
        return _super.call(this, attrs) || this;
    }
    MapOptions.initClass = function () {
        this.prototype.type = "MapOptions";
        this.define({
            lat: [p.Number],
            lng: [p.Number],
            zoom: [p.Number, 12],
        });
    };
    return MapOptions;
}(model_1.Model));
exports.MapOptions = MapOptions;
MapOptions.initClass();
var GMapOptions = /** @class */ (function (_super) {
    tslib_1.__extends(GMapOptions, _super);
    function GMapOptions(attrs) {
        return _super.call(this, attrs) || this;
    }
    GMapOptions.initClass = function () {
        this.prototype.type = "GMapOptions";
        this.define({
            map_type: [p.String, "roadmap"],
            scale_control: [p.Boolean, false],
            styles: [p.String],
            tilt: [p.Int, 45],
        });
    };
    return GMapOptions;
}(MapOptions));
exports.GMapOptions = GMapOptions;
GMapOptions.initClass();
var GMapPlot = /** @class */ (function (_super) {
    tslib_1.__extends(GMapPlot, _super);
    function GMapPlot(attrs) {
        return _super.call(this, attrs) || this;
    }
    GMapPlot.initClass = function () {
        this.prototype.type = "GMapPlot";
        this.prototype.default_view = gmap_plot_canvas_1.GMapPlotView;
        // This seems to be necessary so that everything can initialize.
        // Feels very clumsy, but I'm not sure how the properties system wants
        // to handle something like this situation.
        this.define({
            map_options: [p.Instance],
            api_key: [p.String],
        });
        this.override({
            x_range: function () { return new range1d_1.Range1d(); },
            y_range: function () { return new range1d_1.Range1d(); },
        });
    };
    GMapPlot.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.use_map = true;
        if (!this.api_key)
            logging_1.logger.error("api_key is required. See https://developers.google.com/maps/documentation/javascript/get-api-key for more information on how to obtain your own.");
    };
    return GMapPlot;
}(plot_1.Plot));
exports.GMapPlot = GMapPlot;
GMapPlot.initClass();
