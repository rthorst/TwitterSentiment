"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var layout_1 = require("../../core/layout");
var dom_1 = require("../../core/dom");
var array_1 = require("../../core/util/array");
var p = require("../../core/properties");
var layout_dom_1 = require("./layout_dom");
var model_1 = require("../../model");
var TabsView = /** @class */ (function (_super) {
    tslib_1.__extends(TabsView, _super);
    function TabsView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabsView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.properties.tabs.change, function () { return _this.rebuild(); });
        this.connect(this.model.properties.active.change, function () { return _this.on_active_change(); });
    };
    Object.defineProperty(TabsView.prototype, "child_models", {
        get: function () {
            return this.model.tabs.map(function (tab) { return tab.child; });
        },
        enumerable: true,
        configurable: true
    });
    TabsView.prototype._update_layout = function () {
        var loc = this.model.tabs_location;
        var vertical = loc == "above" || loc == "below";
        // XXX: this is a hack, this should be handled by "fit" policy in grid layout
        var _a = this, scroll_el = _a.scroll_el, headers_el = _a.headers_el;
        this.header = new /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            class_1.prototype._measure = function (viewport) {
                var min_headers = 3;
                var scroll = dom_1.size(scroll_el);
                var headers = dom_1.children(headers_el).slice(0, min_headers).map(function (el) { return dom_1.size(el); });
                var _a = _super.prototype._measure.call(this, viewport), width = _a.width, height = _a.height;
                if (vertical) {
                    var min_width = scroll.width + array_1.sum(headers.map(function (size) { return size.width; }));
                    return { width: viewport.width != Infinity ? viewport.width : min_width, height: height };
                }
                else {
                    var min_height = scroll.height + array_1.sum(headers.map(function (size) { return size.height; }));
                    return { width: width, height: viewport.height != Infinity ? viewport.height : min_height };
                }
            };
            return class_1;
        }(layout_1.ContentBox))(this.header_el);
        if (vertical)
            this.header.set_sizing({ width_policy: "fit", height_policy: "fixed" });
        else
            this.header.set_sizing({ width_policy: "fixed", height_policy: "fit" });
        var row = 1;
        var col = 1;
        switch (loc) {
            case "above":
                row -= 1;
                break;
            case "below":
                row += 1;
                break;
            case "left":
                col -= 1;
                break;
            case "right":
                col += 1;
                break;
        }
        var header = { layout: this.header, row: row, col: col };
        var panels = this.child_views.map(function (child_view) {
            return { layout: child_view.layout, row: 1, col: 1 };
        });
        this.layout = new layout_1.Grid([header].concat(panels));
        this.layout.set_sizing(this.box_sizing());
    };
    TabsView.prototype.update_position = function () {
        _super.prototype.update_position.call(this);
        this.header_el.style.position = "absolute"; // XXX: do it in position()
        dom_1.position(this.header_el, this.header.bbox);
        var loc = this.model.tabs_location;
        var vertical = loc == "above" || loc == "below";
        var scroll_el_size = dom_1.size(this.scroll_el);
        var headers_el_size = dom_1.scroll_size(this.headers_el);
        if (vertical) {
            var width = this.header.bbox.width;
            if (headers_el_size.width > width) {
                this.wrapper_el.style.maxWidth = width - scroll_el_size.width + "px";
                dom_1.display(this.scroll_el);
            }
            else {
                this.wrapper_el.style.maxWidth = "";
                dom_1.undisplay(this.scroll_el);
            }
        }
        else {
            var height = this.header.bbox.height;
            if (headers_el_size.height > height) {
                this.wrapper_el.style.maxHeight = height - scroll_el_size.height + "px";
                dom_1.display(this.scroll_el);
            }
            else {
                this.wrapper_el.style.maxHeight = "";
                dom_1.undisplay(this.scroll_el);
            }
        }
        var child_views = this.child_views;
        for (var _i = 0, child_views_1 = child_views; _i < child_views_1.length; _i++) {
            var child_view = child_views_1[_i];
            dom_1.hide(child_view.el);
        }
        var tab = child_views[this.model.active];
        if (tab != null)
            dom_1.show(tab.el);
    };
    TabsView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var active = this.model.active;
        var loc = this.model.tabs_location;
        var vertical = loc == "above" || loc == "below";
        var location = "bk-" + loc;
        var headers = this.model.tabs.map(function (tab, i) {
            var el = dom_1.div({ class: ["bk-tab", i == active ? "bk-active" : null] }, tab.title);
            el.addEventListener("click", function (event) {
                if (event.target == event.currentTarget)
                    _this.change_active(i);
            });
            if (tab.closable) {
                var close_el = dom_1.div({ class: "bk-close" });
                close_el.addEventListener("click", function (event) {
                    if (event.target == event.currentTarget) {
                        _this.model.tabs = array_1.remove_at(_this.model.tabs, i);
                        var ntabs = _this.model.tabs.length;
                        if (_this.model.active > ntabs - 1)
                            _this.model.active = ntabs - 1;
                    }
                });
                el.appendChild(close_el);
            }
            return el;
        });
        this.headers_el = dom_1.div({ class: ["bk-headers"] }, headers);
        this.wrapper_el = dom_1.div({ class: "bk-headers-wrapper" }, this.headers_el);
        var left_el = dom_1.div({ class: ["bk-btn", "bk-btn-default"], disabled: "" }, dom_1.div({ class: ["bk-caret", "bk-left"] }));
        var right_el = dom_1.div({ class: ["bk-btn", "bk-btn-default"] }, dom_1.div({ class: ["bk-caret", "bk-right"] }));
        var scroll_index = 0;
        var do_scroll = function (dir) {
            return function () {
                var ntabs = _this.model.tabs.length;
                if (dir == "left")
                    scroll_index = Math.max(scroll_index - 1, 0);
                else
                    scroll_index = Math.min(scroll_index + 1, ntabs - 1);
                if (scroll_index == 0)
                    left_el.setAttribute("disabled", "");
                else
                    left_el.removeAttribute("disabled");
                if (scroll_index == ntabs - 1)
                    right_el.setAttribute("disabled", "");
                else
                    right_el.removeAttribute("disabled");
                var sizes = dom_1.children(_this.headers_el)
                    .slice(0, scroll_index)
                    .map(function (el) { return el.getBoundingClientRect(); });
                if (vertical) {
                    var left = -array_1.sum(sizes.map(function (size) { return size.width; }));
                    _this.headers_el.style.left = left + "px";
                }
                else {
                    var top_1 = -array_1.sum(sizes.map(function (size) { return size.height; }));
                    _this.headers_el.style.top = top_1 + "px";
                }
            };
        };
        left_el.addEventListener("click", do_scroll("left"));
        right_el.addEventListener("click", do_scroll("right"));
        this.scroll_el = dom_1.div({ class: "bk-btn-group" }, left_el, right_el);
        this.header_el = dom_1.div({ class: ["bk-tabs-header", location] }, this.scroll_el, this.wrapper_el);
        this.el.appendChild(this.header_el);
    };
    TabsView.prototype.change_active = function (i) {
        if (i != this.model.active) {
            this.model.active = i;
            if (this.model.callback != null)
                this.model.callback.execute(this.model);
        }
    };
    TabsView.prototype.on_active_change = function () {
        var i = this.model.active;
        var headers = dom_1.children(this.headers_el);
        for (var _i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
            var el = headers_1[_i];
            el.classList.remove("bk-active");
        }
        headers[i].classList.add("bk-active");
        var child_views = this.child_views;
        for (var _a = 0, child_views_2 = child_views; _a < child_views_2.length; _a++) {
            var child_view = child_views_2[_a];
            dom_1.hide(child_view.el);
        }
        dom_1.show(child_views[i].el);
    };
    return TabsView;
}(layout_dom_1.LayoutDOMView));
exports.TabsView = TabsView;
var Tabs = /** @class */ (function (_super) {
    tslib_1.__extends(Tabs, _super);
    function Tabs(attrs) {
        return _super.call(this, attrs) || this;
    }
    Tabs.initClass = function () {
        this.prototype.type = "Tabs";
        this.prototype.default_view = TabsView;
        this.define({
            tabs: [p.Array, []],
            tabs_location: [p.Location, "above"],
            active: [p.Number, 0],
            callback: [p.Any],
        });
    };
    return Tabs;
}(layout_dom_1.LayoutDOM));
exports.Tabs = Tabs;
Tabs.initClass();
var Panel = /** @class */ (function (_super) {
    tslib_1.__extends(Panel, _super);
    function Panel(attrs) {
        return _super.call(this, attrs) || this;
    }
    Panel.initClass = function () {
        this.prototype.type = "Panel";
        this.define({
            title: [p.String, ""],
            child: [p.Instance],
            closable: [p.Boolean, false],
        });
    };
    return Panel;
}(model_1.Model));
exports.Panel = Panel;
Panel.initClass();
