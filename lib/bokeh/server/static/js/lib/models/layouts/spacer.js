"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_dom_1 = require("./layout_dom");
var layout_1 = require("../../core/layout");
var SpacerView = /** @class */ (function (_super) {
    tslib_1.__extends(SpacerView, _super);
    function SpacerView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SpacerView.prototype, "child_models", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    SpacerView.prototype._update_layout = function () {
        this.layout = new layout_1.LayoutItem();
        this.layout.set_sizing(this.box_sizing());
    };
    return SpacerView;
}(layout_dom_1.LayoutDOMView));
exports.SpacerView = SpacerView;
var Spacer = /** @class */ (function (_super) {
    tslib_1.__extends(Spacer, _super);
    function Spacer(attrs) {
        return _super.call(this, attrs) || this;
    }
    Spacer.initClass = function () {
        this.prototype.type = "Spacer";
        this.prototype.default_view = SpacerView;
    };
    return Spacer;
}(layout_dom_1.LayoutDOM));
exports.Spacer = Spacer;
Spacer.initClass();
