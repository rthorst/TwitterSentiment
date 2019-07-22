"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var renderer_1 = require("./renderer");
var p = require("../../core/properties");
var DataRendererView = /** @class */ (function (_super) {
    tslib_1.__extends(DataRendererView, _super);
    function DataRendererView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DataRendererView;
}(renderer_1.RendererView));
exports.DataRendererView = DataRendererView;
var DataRenderer = /** @class */ (function (_super) {
    tslib_1.__extends(DataRenderer, _super);
    function DataRenderer(attrs) {
        return _super.call(this, attrs) || this;
    }
    DataRenderer.initClass = function () {
        this.prototype.type = "DataRenderer";
        this.define({
            x_range_name: [p.String, 'default'],
            y_range_name: [p.String, 'default'],
        });
        this.override({
            level: 'glyph',
        });
    };
    return DataRenderer;
}(renderer_1.Renderer));
exports.DataRenderer = DataRenderer;
DataRenderer.initClass();
