"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layoutable_1 = require("./layoutable");
var bbox_1 = require("../util/bbox");
var Stack = /** @class */ (function (_super) {
    tslib_1.__extends(Stack, _super);
    function Stack() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.children = [];
        return _this;
    }
    return Stack;
}(layoutable_1.Layoutable));
exports.Stack = Stack;
var HStack = /** @class */ (function (_super) {
    tslib_1.__extends(HStack, _super);
    function HStack() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HStack.prototype._measure = function (_viewport) {
        var width = 0;
        var height = 0;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var size_hint = child.measure({ width: 0, height: 0 });
            width += size_hint.width;
            height = Math.max(height, size_hint.height);
        }
        return { width: width, height: height };
    };
    HStack.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        var top = outer.top, bottom = outer.bottom;
        var left = outer.left;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var width = child.measure({ width: 0, height: 0 }).width;
            child.set_geometry(new bbox_1.BBox({ left: left, width: width, top: top, bottom: bottom }));
            left += width;
        }
    };
    return HStack;
}(Stack));
exports.HStack = HStack;
var VStack = /** @class */ (function (_super) {
    tslib_1.__extends(VStack, _super);
    function VStack() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VStack.prototype._measure = function (_viewport) {
        var width = 0;
        var height = 0;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var size_hint = child.measure({ width: 0, height: 0 });
            width = Math.max(width, size_hint.width);
            height += size_hint.height;
        }
        return { width: width, height: height };
    };
    VStack.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        var left = outer.left, right = outer.right;
        var top = outer.top;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            var height = child.measure({ width: 0, height: 0 }).height;
            child.set_geometry(new bbox_1.BBox({ top: top, height: height, left: left, right: right }));
            top += height;
        }
    };
    return VStack;
}(Stack));
exports.VStack = VStack;
var AnchorLayout = /** @class */ (function (_super) {
    tslib_1.__extends(AnchorLayout, _super);
    function AnchorLayout() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.children = [];
        return _this;
    }
    AnchorLayout.prototype._measure = function (viewport) {
        var width = 0;
        var height = 0;
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var layout = _a[_i].layout;
            var size_hint = layout.measure(viewport);
            width = Math.max(width, size_hint.width);
            height = Math.max(height, size_hint.height);
        }
        return { width: width, height: height };
    };
    AnchorLayout.prototype._set_geometry = function (outer, inner) {
        _super.prototype._set_geometry.call(this, outer, inner);
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var _b = _a[_i], layout = _b.layout, anchor = _b.anchor, margin = _b.margin;
            var left = outer.left, right = outer.right, top_1 = outer.top, bottom = outer.bottom, hcenter = outer.hcenter, vcenter = outer.vcenter;
            var _c = layout.measure(outer), width = _c.width, height = _c.height;
            var bbox = void 0;
            switch (anchor) {
                case 'top_left':
                    bbox = new bbox_1.BBox({ left: left + margin, top: top_1 + margin, width: width, height: height });
                    break;
                case 'top_center':
                    bbox = new bbox_1.BBox({ hcenter: hcenter, top: top_1 + margin, width: width, height: height });
                    break;
                case 'top_right':
                    bbox = new bbox_1.BBox({ right: right - margin, top: top_1 + margin, width: width, height: height });
                    break;
                case 'bottom_right':
                    bbox = new bbox_1.BBox({ right: right - margin, bottom: bottom - margin, width: width, height: height });
                    break;
                case 'bottom_center':
                    bbox = new bbox_1.BBox({ hcenter: hcenter, bottom: bottom - margin, width: width, height: height });
                    break;
                case 'bottom_left':
                    bbox = new bbox_1.BBox({ left: left + margin, bottom: bottom - margin, width: width, height: height });
                    break;
                case 'center_left':
                    bbox = new bbox_1.BBox({ left: left + margin, vcenter: vcenter, width: width, height: height });
                    break;
                case 'center':
                    bbox = new bbox_1.BBox({ hcenter: hcenter, vcenter: vcenter, width: width, height: height });
                    break;
                case 'center_right':
                    bbox = new bbox_1.BBox({ right: right - margin, vcenter: vcenter, width: width, height: height });
                    break;
                default:
                    throw new Error("unreachable");
            }
            layout.set_geometry(bbox);
        }
    };
    return AnchorLayout;
}(layoutable_1.Layoutable));
exports.AnchorLayout = AnchorLayout;
