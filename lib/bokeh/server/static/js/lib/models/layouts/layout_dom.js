"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var model_1 = require("../../model");
var dom_1 = require("../../core/dom");
var logging_1 = require("../../core/logging");
var types_1 = require("../../core/util/types");
var p = require("../../core/properties");
var build_views_1 = require("../../core/build_views");
var dom_view_1 = require("../../core/dom_view");
var LayoutDOMView = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutDOMView, _super);
    function LayoutDOMView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._idle_notified = false;
        _this._offset_parent = null;
        _this._viewport = {};
        return _this;
    }
    LayoutDOMView.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.el.style.position = this.is_root ? "relative" : "absolute";
        this._child_views = {};
        this.build_child_views();
    };
    LayoutDOMView.prototype.remove = function () {
        for (var _i = 0, _a = this.child_views; _i < _a.length; _i++) {
            var child_view = _a[_i];
            child_view.remove();
        }
        this._child_views = {};
        _super.prototype.remove.call(this);
    };
    LayoutDOMView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        if (this.is_root) {
            this._on_resize = function () { return _this.resize_layout(); };
            window.addEventListener("resize", this._on_resize);
            this._parent_observer = setInterval(function () {
                var offset_parent = _this.el.offsetParent;
                if (_this._offset_parent != offset_parent) {
                    _this._offset_parent = offset_parent;
                    if (offset_parent != null) {
                        _this.compute_viewport();
                        _this.invalidate_layout();
                    }
                }
            }, 250);
        }
        var p = this.model.properties;
        this.on_change([
            p.width, p.height,
            p.min_width, p.min_height,
            p.max_width, p.max_height,
            p.margin,
            p.width_policy, p.height_policy, p.sizing_mode,
            p.aspect_ratio,
            p.visible,
            p.background,
        ], function () { return _this.invalidate_layout(); });
        this.on_change([
            p.css_classes,
        ], function () { return _this.invalidate_render(); });
    };
    LayoutDOMView.prototype.disconnect_signals = function () {
        if (this._parent_observer != null)
            clearTimeout(this._parent_observer);
        if (this._on_resize != null)
            window.removeEventListener("resize", this._on_resize);
        _super.prototype.disconnect_signals.call(this);
    };
    LayoutDOMView.prototype.css_classes = function () {
        return _super.prototype.css_classes.call(this).concat(this.model.css_classes);
    };
    Object.defineProperty(LayoutDOMView.prototype, "child_views", {
        get: function () {
            var _this = this;
            return this.child_models.map(function (child) { return _this._child_views[child.id]; });
        },
        enumerable: true,
        configurable: true
    });
    LayoutDOMView.prototype.build_child_views = function () {
        build_views_1.build_views(this._child_views, this.child_models, { parent: this });
    };
    LayoutDOMView.prototype.render = function () {
        var _a;
        _super.prototype.render.call(this);
        dom_1.empty(this.el); // XXX: this should be in super
        var background = this.model.background;
        this.el.style.backgroundColor = background != null ? background : "";
        (_a = dom_1.classes(this.el).clear()).add.apply(_a, this.css_classes());
        for (var _i = 0, _b = this.child_views; _i < _b.length; _i++) {
            var child_view = _b[_i];
            this.el.appendChild(child_view.el);
            child_view.render();
        }
    };
    LayoutDOMView.prototype.update_layout = function () {
        for (var _i = 0, _a = this.child_views; _i < _a.length; _i++) {
            var child_view = _a[_i];
            child_view.update_layout();
        }
        this._update_layout();
    };
    LayoutDOMView.prototype.update_position = function () {
        this.el.style.display = this.model.visible ? "block" : "none";
        var margin = this.is_root ? this.layout.sizing.margin : undefined;
        dom_1.position(this.el, this.layout.bbox, margin);
        for (var _i = 0, _a = this.child_views; _i < _a.length; _i++) {
            var child_view = _a[_i];
            child_view.update_position();
        }
    };
    LayoutDOMView.prototype.after_layout = function () {
        for (var _i = 0, _a = this.child_views; _i < _a.length; _i++) {
            var child_view = _a[_i];
            child_view.after_layout();
        }
        this._has_finished = true;
    };
    LayoutDOMView.prototype.compute_viewport = function () {
        this._viewport = this._viewport_size();
    };
    LayoutDOMView.prototype.renderTo = function (element) {
        element.appendChild(this.el);
        this._offset_parent = this.el.offsetParent;
        this.compute_viewport();
        this.build();
    };
    LayoutDOMView.prototype.build = function () {
        this.assert_root();
        this.render();
        this.update_layout();
        this.compute_layout();
        return this;
    };
    LayoutDOMView.prototype.rebuild = function () {
        this.build_child_views();
        this.invalidate_render();
    };
    LayoutDOMView.prototype.compute_layout = function () {
        var start = Date.now();
        this.layout.compute(this._viewport);
        this.update_position();
        this.after_layout();
        logging_1.logger.debug("layout computed in " + (Date.now() - start) + " ms");
        this.notify_finished();
    };
    LayoutDOMView.prototype.resize_layout = function () {
        this.root.compute_viewport();
        this.root.compute_layout();
    };
    LayoutDOMView.prototype.invalidate_layout = function () {
        this.root.update_layout();
        this.root.compute_layout();
    };
    LayoutDOMView.prototype.invalidate_render = function () {
        this.render();
        this.invalidate_layout();
    };
    LayoutDOMView.prototype.has_finished = function () {
        if (!_super.prototype.has_finished.call(this))
            return false;
        for (var _i = 0, _a = this.child_views; _i < _a.length; _i++) {
            var child_view = _a[_i];
            if (!child_view.has_finished())
                return false;
        }
        return true;
    };
    LayoutDOMView.prototype.notify_finished = function () {
        if (!this.is_root)
            this.root.notify_finished();
        else {
            if (!this._idle_notified && this.has_finished()) {
                if (this.model.document != null) {
                    this._idle_notified = true;
                    this.model.document.notify_idle(this.model);
                }
            }
        }
    };
    LayoutDOMView.prototype._width_policy = function () {
        return this.model.width != null ? "fixed" : "fit";
    };
    LayoutDOMView.prototype._height_policy = function () {
        return this.model.height != null ? "fixed" : "fit";
    };
    LayoutDOMView.prototype.box_sizing = function () {
        var _a = this.model, width_policy = _a.width_policy, height_policy = _a.height_policy, aspect_ratio = _a.aspect_ratio;
        if (width_policy == "auto")
            width_policy = this._width_policy();
        if (height_policy == "auto")
            height_policy = this._height_policy();
        var sizing_mode = this.model.sizing_mode;
        if (sizing_mode != null) {
            if (sizing_mode == "fixed")
                width_policy = height_policy = "fixed";
            else if (sizing_mode == "stretch_both")
                width_policy = height_policy = "max";
            else if (sizing_mode == "stretch_width")
                width_policy = "max";
            else if (sizing_mode == "stretch_height")
                height_policy = "max";
            else {
                if (aspect_ratio == null)
                    aspect_ratio = "auto";
                switch (sizing_mode) {
                    case "scale_width":
                        width_policy = "max";
                        height_policy = "min";
                        break;
                    case "scale_height":
                        width_policy = "min";
                        height_policy = "max";
                        break;
                    case "scale_both":
                        width_policy = "max";
                        height_policy = "max";
                        break;
                    default:
                        throw new Error("unreachable");
                }
            }
        }
        var sizing = { width_policy: width_policy, height_policy: height_policy };
        var _b = this.model, min_width = _b.min_width, min_height = _b.min_height;
        if (min_width != null)
            sizing.min_width = min_width;
        if (min_height != null)
            sizing.min_height = min_height;
        var _c = this.model, width = _c.width, height = _c.height;
        if (width != null)
            sizing.width = width;
        if (height != null)
            sizing.height = height;
        var _d = this.model, max_width = _d.max_width, max_height = _d.max_height;
        if (max_width != null)
            sizing.max_width = max_width;
        if (max_height != null)
            sizing.max_height = max_height;
        if (aspect_ratio == "auto" && width != null && height != null)
            sizing.aspect = width / height;
        else if (types_1.isNumber(aspect_ratio))
            sizing.aspect = aspect_ratio;
        var margin = this.model.margin;
        if (margin != null) {
            if (types_1.isNumber(margin))
                sizing.margin = { top: margin, right: margin, bottom: margin, left: margin };
            else if (margin.length == 2) {
                var vertical = margin[0], horizontal = margin[1];
                sizing.margin = { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
            }
            else {
                var top_1 = margin[0], right = margin[1], bottom = margin[2], left = margin[3];
                sizing.margin = { top: top_1, right: right, bottom: bottom, left: left };
            }
        }
        sizing.visible = this.model.visible;
        var align = this.model.align;
        if (types_1.isArray(align))
            sizing.halign = align[0], sizing.valign = align[1];
        else
            sizing.halign = sizing.valign = align;
        return sizing;
    };
    LayoutDOMView.prototype._viewport_size = function () {
        var _this = this;
        return dom_1.undisplayed(this.el, function () {
            var measuring = _this.el;
            while (measuring = measuring.parentElement) {
                // .bk-root element doesn't bring any value
                if (measuring.classList.contains("bk-root"))
                    continue;
                // we reached <body> element, so use viewport size
                if (measuring == document.body) {
                    var _a = dom_1.extents(document.body).margin, left_1 = _a.left, right_1 = _a.right, top_2 = _a.top, bottom_1 = _a.bottom;
                    var width_1 = Math.ceil(document.documentElement.clientWidth - left_1 - right_1);
                    var height_1 = Math.ceil(document.documentElement.clientHeight - top_2 - bottom_1);
                    return { width: width_1, height: height_1 };
                }
                // stop on first element with sensible dimensions
                var _b = dom_1.extents(measuring).padding, left = _b.left, right = _b.right, top_3 = _b.top, bottom = _b.bottom;
                var _c = measuring.getBoundingClientRect(), width = _c.width, height = _c.height;
                var inner_width = Math.ceil(width - left - right);
                var inner_height = Math.ceil(height - top_3 - bottom);
                if (inner_width > 0 || inner_height > 0)
                    return {
                        width: inner_width > 0 ? inner_width : undefined,
                        height: inner_height > 0 ? inner_height : undefined,
                    };
            }
            // this element is detached from DOM
            return {};
        });
    };
    LayoutDOMView.prototype.serializable_state = function () {
        return tslib_1.__assign({}, _super.prototype.serializable_state.call(this), { bbox: this.layout.bbox.rect, children: this.child_views.map(function (child) { return child.serializable_state(); }) });
    };
    return LayoutDOMView;
}(dom_view_1.DOMView));
exports.LayoutDOMView = LayoutDOMView;
var LayoutDOM = /** @class */ (function (_super) {
    tslib_1.__extends(LayoutDOM, _super);
    function LayoutDOM(attrs) {
        return _super.call(this, attrs) || this;
    }
    LayoutDOM.initClass = function () {
        this.prototype.type = "LayoutDOM";
        this.define({
            width: [p.Number, null],
            height: [p.Number, null],
            min_width: [p.Number, null],
            min_height: [p.Number, null],
            max_width: [p.Number, null],
            max_height: [p.Number, null],
            margin: [p.Any, [0, 0, 0, 0]],
            width_policy: [p.Any, "auto"],
            height_policy: [p.Any, "auto"],
            aspect_ratio: [p.Any, null],
            sizing_mode: [p.SizingMode, null],
            visible: [p.Boolean, true],
            disabled: [p.Boolean, false],
            align: [p.Any, "start"],
            background: [p.Color, null],
            css_classes: [p.Array, []],
        });
    };
    return LayoutDOM;
}(model_1.Model));
exports.LayoutDOM = LayoutDOM;
LayoutDOM.initClass();
