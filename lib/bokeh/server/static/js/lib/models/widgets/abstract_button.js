"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var p = require("../../core/properties");
var dom_1 = require("../../core/dom");
var build_views_1 = require("../../core/build_views");
var control_1 = require("./control");
var AbstractButtonView = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractButtonView, _super);
    function AbstractButtonView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractButtonView.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.icon_views = {};
    };
    AbstractButtonView.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this.connect(this.model.change, function () { return _this.render(); });
    };
    AbstractButtonView.prototype.remove = function () {
        build_views_1.remove_views(this.icon_views);
        _super.prototype.remove.call(this);
    };
    AbstractButtonView.prototype._render_button = function () {
        var children = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            children[_i] = arguments[_i];
        }
        return dom_1.button.apply(void 0, [{
                type: "button",
                disabled: this.model.disabled,
                class: ["bk-btn", "bk-btn-" + this.model.button_type],
            }].concat(children));
    };
    AbstractButtonView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.button_el = this._render_button(this.model.label);
        this.button_el.addEventListener("click", function () { return _this.click(); });
        var icon = this.model.icon;
        if (icon != null) {
            build_views_1.build_views(this.icon_views, [icon], { parent: this });
            var icon_view = this.icon_views[icon.id];
            icon_view.render();
            dom_1.prepend(this.button_el, icon_view.el, dom_1.nbsp());
        }
        this.group_el = dom_1.div({ class: "bk-btn-group" }, this.button_el);
        this.el.appendChild(this.group_el);
    };
    AbstractButtonView.prototype.click = function () {
        if (this.model.callback != null)
            this.model.callback.execute(this.model);
    };
    return AbstractButtonView;
}(control_1.ControlView));
exports.AbstractButtonView = AbstractButtonView;
var AbstractButton = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractButton, _super);
    function AbstractButton(attrs) {
        return _super.call(this, attrs) || this;
    }
    AbstractButton.initClass = function () {
        this.prototype.type = "AbstractButton";
        this.define({
            label: [p.String, "Button"],
            icon: [p.Instance],
            button_type: [p.ButtonType, "default"],
            callback: [p.Any],
        });
    };
    return AbstractButton;
}(control_1.Control));
exports.AbstractButton = AbstractButton;
AbstractButton.initClass();
