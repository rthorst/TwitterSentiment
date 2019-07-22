"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_dom_1 = require("./layout_dom");
var p = require("../../core/properties");
var BoxView = /** @class */ (function (_super) {
    tslib_1.__extends(BoxView, _super);
    function BoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoxView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.children.change, function () { return _this.rebuild(); });
    };
    Object.defineProperty(BoxView.prototype, "child_models", {
        get: function () {
            return this.model.children;
        },
        enumerable: true,
        configurable: true
    });
    return BoxView;
}(layout_dom_1.LayoutDOMView));
exports.BoxView = BoxView;
var Box = /** @class */ (function (_super) {
    tslib_1.__extends(Box, _super);
    function Box(attrs) {
        return _super.call(this, attrs) || this;
    }
    Box.initClass = function () {
        this.prototype.type = "Box";
        this.define({
            children: [p.Array, []],
            spacing: [p.Number, 0],
        });
    };
    return Box;
}(layout_dom_1.LayoutDOM));
exports.Box = Box;
Box.initClass();
