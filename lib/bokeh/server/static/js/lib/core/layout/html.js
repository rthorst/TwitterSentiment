"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layoutable_1 = require("./layoutable");
var types_1 = require("./types");
var dom_1 = require("../dom");
var ContentBox = /** @class */ (function (_super) {
    tslib_1.__extends(ContentBox, _super);
    function ContentBox(el) {
        var _this = _super.call(this) || this;
        _this.content_size = dom_1.unsized(el, function () { return new types_1.Sizeable(dom_1.size(el)); });
        return _this;
    }
    ContentBox.prototype._content_size = function () {
        return this.content_size;
    };
    return ContentBox;
}(layoutable_1.ContentLayoutable));
exports.ContentBox = ContentBox;
var VariadicBox = /** @class */ (function (_super) {
    tslib_1.__extends(VariadicBox, _super);
    function VariadicBox(el) {
        var _this = _super.call(this) || this;
        _this.el = el;
        return _this;
    }
    VariadicBox.prototype._measure = function (viewport) {
        var _this = this;
        var bounded = new types_1.Sizeable(viewport).bounded_to(this.sizing.size);
        return dom_1.sized(this.el, bounded, function () {
            var content = new types_1.Sizeable(dom_1.content_size(_this.el));
            var _a = dom_1.extents(_this.el), border = _a.border, padding = _a.padding;
            return content.grow_by(border).grow_by(padding).map(Math.ceil);
        });
    };
    return VariadicBox;
}(layoutable_1.Layoutable));
exports.VariadicBox = VariadicBox;
