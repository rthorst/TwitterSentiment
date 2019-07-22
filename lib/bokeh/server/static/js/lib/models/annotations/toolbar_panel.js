"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var annotation_1 = require("./annotation");
var build_views_1 = require("../../core/build_views");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var ToolbarPanelView = /** @class */ (function (_super) {
    tslib_1.__extends(ToolbarPanelView, _super);
    function ToolbarPanelView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rotate = true;
        return _this;
    }
    ToolbarPanelView.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.plot_view.canvas_events.appendChild(this.el);
        this._toolbar_views = {};
        build_views_1.build_views(this._toolbar_views, [this.model.toolbar], { parent: this });
        var toolbar_view = this._toolbar_views[this.model.toolbar.id];
        this.plot_view.visibility_callbacks.push(function (visible) { return toolbar_view.set_visibility(visible); });
    };
    ToolbarPanelView.prototype.remove = function () {
        build_views_1.remove_views(this._toolbar_views);
        _super.prototype.remove.call(this);
    };
    ToolbarPanelView.prototype.render = function () {
        _super.prototype.render.call(this);
        if (!this.model.visible) {
            dom_1.undisplay(this.el);
            return;
        }
        this.el.style.position = "absolute";
        this.el.style.overflow = "hidden";
        dom_1.position(this.el, this.panel.bbox);
        var toolbar_view = this._toolbar_views[this.model.toolbar.id];
        toolbar_view.render();
        dom_1.empty(this.el);
        this.el.appendChild(toolbar_view.el);
        dom_1.display(this.el);
    };
    ToolbarPanelView.prototype._get_size = function () {
        var _a = this.model.toolbar, tools = _a.tools, logo = _a.logo;
        return {
            width: tools.length * 30 + (logo != null ? 25 : 0),
            height: 30,
        };
    };
    return ToolbarPanelView;
}(annotation_1.AnnotationView));
exports.ToolbarPanelView = ToolbarPanelView;
var ToolbarPanel = /** @class */ (function (_super) {
    tslib_1.__extends(ToolbarPanel, _super);
    function ToolbarPanel(attrs) {
        return _super.call(this, attrs) || this;
    }
    ToolbarPanel.initClass = function () {
        this.prototype.type = 'ToolbarPanel';
        this.prototype.default_view = ToolbarPanelView;
        this.define({
            toolbar: [p.Instance],
        });
    };
    return ToolbarPanel;
}(annotation_1.Annotation));
exports.ToolbarPanel = ToolbarPanel;
ToolbarPanel.initClass();
