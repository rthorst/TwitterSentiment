"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var glyph_1 = require("./glyph");
var utils_1 = require("./utils");
var AreaView = /** @class */ (function (_super) {
    tslib_1.__extends(AreaView, _super);
    function AreaView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AreaView.prototype.draw_legend_for_index = function (ctx, bbox, index) {
        utils_1.generic_area_legend(this.visuals, ctx, bbox, index);
    };
    return AreaView;
}(glyph_1.GlyphView));
exports.AreaView = AreaView;
var Area = /** @class */ (function (_super) {
    tslib_1.__extends(Area, _super);
    function Area(attrs) {
        return _super.call(this, attrs) || this;
    }
    Area.initClass = function () {
        this.prototype.type = 'Area';
        this.mixins(['fill', 'hatch']);
    };
    return Area;
}(glyph_1.Glyph));
exports.Area = Area;
Area.initClass();
