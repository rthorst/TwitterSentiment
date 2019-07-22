"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_dom_1 = require("../layouts/layout_dom");
var layout_1 = require("../../core/layout");
var HTMLBoxView = /** @class */ (function (_super) {
    tslib_1.__extends(HTMLBoxView, _super);
    function HTMLBoxView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(HTMLBoxView.prototype, "child_models", {
        get: function () {
            return [];
        },
        enumerable: true,
        configurable: true
    });
    HTMLBoxView.prototype._update_layout = function () {
        this.layout = new layout_1.ContentBox(this.el);
        this.layout.set_sizing(this.box_sizing());
    };
    return HTMLBoxView;
}(layout_dom_1.LayoutDOMView));
exports.HTMLBoxView = HTMLBoxView;
var HTMLBox = /** @class */ (function (_super) {
    tslib_1.__extends(HTMLBox, _super);
    function HTMLBox(attrs) {
        return _super.call(this, attrs) || this;
    }
    HTMLBox.initClass = function () {
        this.prototype.type = "HTMLBox";
    };
    return HTMLBox;
}(layout_dom_1.LayoutDOM));
exports.HTMLBox = HTMLBox;
HTMLBox.initClass();
