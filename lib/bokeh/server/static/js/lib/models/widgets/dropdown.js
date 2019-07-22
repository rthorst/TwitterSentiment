"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var abstract_button_1 = require("./abstract_button");
var bokeh_events_1 = require("../../core/bokeh_events");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var types_1 = require("../../core/util/types");
var DropdownView = /** @class */ (function (_super) {
    tslib_1.__extends(DropdownView, _super);
    function DropdownView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._open = false;
        return _this;
    }
    DropdownView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var caret = dom_1.div({ class: ["bk-caret", "bk-down"] });
        if (!this.model.is_split)
            this.button_el.appendChild(caret);
        else {
            var toggle = this._render_button(caret);
            toggle.classList.add("bk-dropdown-toggle");
            toggle.addEventListener("click", function () { return _this._toggle_menu(); });
            this.group_el.appendChild(toggle);
        }
        var items = this.model.menu.map(function (item, i) {
            if (item == null)
                return dom_1.div({ class: "bk-divider" });
            else {
                var label = types_1.isString(item) ? item : item[0];
                var el = dom_1.div({}, label);
                el.addEventListener("click", function () { return _this._item_click(i); });
                return el;
            }
        });
        this.menu = dom_1.div({ class: ["bk-menu", "bk-below"] }, items);
        this.el.appendChild(this.menu);
        dom_1.undisplay(this.menu);
    };
    DropdownView.prototype._show_menu = function () {
        var _this = this;
        if (!this._open) {
            this._open = true;
            dom_1.display(this.menu);
            var listener_1 = function (event) {
                var target = event.target;
                if (target instanceof HTMLElement && !_this.el.contains(target)) {
                    document.removeEventListener("click", listener_1);
                    _this._hide_menu();
                }
            };
            document.addEventListener("click", listener_1);
        }
    };
    DropdownView.prototype._hide_menu = function () {
        if (this._open) {
            this._open = false;
            dom_1.undisplay(this.menu);
        }
    };
    DropdownView.prototype._toggle_menu = function () {
        if (this._open)
            this._hide_menu();
        else
            this._show_menu();
    };
    DropdownView.prototype.click = function () {
        if (!this.model.is_split)
            this._toggle_menu();
        else {
            this._hide_menu();
            this.model.trigger_event(new bokeh_events_1.ButtonClick());
            this.model.value = this.model.default_value;
            if (this.model.callback != null)
                this.model.callback.execute(this.model);
            _super.prototype.click.call(this);
        }
    };
    DropdownView.prototype._item_click = function (i) {
        this._hide_menu();
        var item = this.model.menu[i];
        if (item != null) {
            var value_or_callback = types_1.isString(item) ? item : item[1];
            if (types_1.isString(value_or_callback)) {
                this.model.trigger_event(new bokeh_events_1.MenuItemClick(value_or_callback));
                this.model.value = value_or_callback;
                if (this.model.callback != null)
                    this.model.callback.execute(this.model); // XXX: {index: i, item: value_or_callback})
            }
            else {
                value_or_callback.execute(this.model, { index: i }); // TODO
                if (this.model.callback != null)
                    this.model.callback.execute(this.model); // XXX: {index: i})
            }
        }
    };
    return DropdownView;
}(abstract_button_1.AbstractButtonView));
exports.DropdownView = DropdownView;
var Dropdown = /** @class */ (function (_super) {
    tslib_1.__extends(Dropdown, _super);
    function Dropdown(attrs) {
        return _super.call(this, attrs) || this;
    }
    Dropdown.initClass = function () {
        this.prototype.type = "Dropdown";
        this.prototype.default_view = DropdownView;
        this.define({
            split: [p.Boolean, false],
            menu: [p.Array, []],
            value: [p.String,],
            default_value: [p.String,],
        });
        this.override({
            label: "Dropdown",
        });
    };
    Object.defineProperty(Dropdown.prototype, "is_split", {
        get: function () {
            return this.split || this.default_value != null;
        },
        enumerable: true,
        configurable: true
    });
    return Dropdown;
}(abstract_button_1.AbstractButton));
exports.Dropdown = Dropdown;
Dropdown.initClass();
