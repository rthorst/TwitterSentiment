"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var text_input_1 = require("./text_input");
var dom_1 = require("../../core/dom");
var p = require("../../core/properties");
var math_1 = require("../../core/util/math");
var AutocompleteInputView = /** @class */ (function (_super) {
    tslib_1.__extends(AutocompleteInputView, _super);
    function AutocompleteInputView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._open = false;
        _this._last_value = "";
        _this._hover_index = 0;
        return _this;
    }
    AutocompleteInputView.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.input_el.classList.add("bk-autocomplete-input");
        this.input_el.addEventListener("keydown", function (event) { return _this._keydown(event); });
        this.input_el.addEventListener("keyup", function (event) { return _this._keyup(event); });
        this.menu = dom_1.div({ class: ["bk-menu", "bk-below"] });
        this.menu.addEventListener("click", function (event) { return _this._menu_click(event); });
        this.menu.addEventListener("mouseover", function (event) { return _this._menu_hover(event); });
        this.el.appendChild(this.menu);
        dom_1.undisplay(this.menu);
    };
    AutocompleteInputView.prototype.change_input = function () {
        if (this._open && this.menu.children.length > 0) {
            this.model.value = this.menu.children[this._hover_index].textContent;
            this.input_el.focus();
            this._hide_menu();
        }
    };
    AutocompleteInputView.prototype._update_completions = function (completions) {
        dom_1.empty(this.menu);
        for (var _i = 0, completions_1 = completions; _i < completions_1.length; _i++) {
            var text = completions_1[_i];
            var item = dom_1.div({}, text);
            this.menu.appendChild(item);
        }
        if (completions.length > 0)
            this.menu.children[0].classList.add('bk-active');
    };
    AutocompleteInputView.prototype._show_menu = function () {
        var _this = this;
        if (!this._open) {
            this._open = true;
            this._hover_index = 0;
            this._last_value = this.model.value;
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
    AutocompleteInputView.prototype._hide_menu = function () {
        if (this._open) {
            this._open = false;
            dom_1.undisplay(this.menu);
        }
    };
    AutocompleteInputView.prototype._menu_click = function (event) {
        if (event.target != event.currentTarget && event.target instanceof Element) {
            this.model.value = event.target.textContent;
            this.input_el.focus();
            this._hide_menu();
        }
    };
    AutocompleteInputView.prototype._menu_hover = function (event) {
        if (event.target != event.currentTarget && event.target instanceof Element) {
            var i = 0;
            for (i = 0; i < this.menu.children.length; i++) {
                if (this.menu.children[i].textContent == event.target.textContent)
                    break;
            }
            this._bump_hover(i);
        }
    };
    AutocompleteInputView.prototype._bump_hover = function (new_index) {
        var n_children = this.menu.children.length;
        if (this._open && n_children > 0) {
            this.menu.children[this._hover_index].classList.remove('bk-active');
            this._hover_index = math_1.clamp(new_index, 0, n_children - 1);
            this.menu.children[this._hover_index].classList.add('bk-active');
        }
    };
    AutocompleteInputView.prototype._keydown = function (_event) { };
    AutocompleteInputView.prototype._keyup = function (event) {
        switch (event.keyCode) {
            case dom_1.Keys.Enter: {
                this.change_input();
                break;
            }
            case dom_1.Keys.Esc: {
                this._hide_menu();
                break;
            }
            case dom_1.Keys.Up: {
                this._bump_hover(this._hover_index - 1);
                break;
            }
            case dom_1.Keys.Down: {
                this._bump_hover(this._hover_index + 1);
                break;
            }
            default: {
                var value = this.input_el.value;
                if (value.length <= 1) {
                    this._hide_menu();
                    return;
                }
                var completions = [];
                for (var _i = 0, _a = this.model.completions; _i < _a.length; _i++) {
                    var text = _a[_i];
                    if (text.indexOf(value) != -1)
                        completions.push(text);
                }
                this._update_completions(completions);
                if (completions.length == 0)
                    this._hide_menu();
                else
                    this._show_menu();
            }
        }
    };
    return AutocompleteInputView;
}(text_input_1.TextInputView));
exports.AutocompleteInputView = AutocompleteInputView;
var AutocompleteInput = /** @class */ (function (_super) {
    tslib_1.__extends(AutocompleteInput, _super);
    function AutocompleteInput(attrs) {
        return _super.call(this, attrs) || this;
    }
    AutocompleteInput.initClass = function () {
        this.prototype.type = "AutocompleteInput";
        this.prototype.default_view = AutocompleteInputView;
        this.define({
            completions: [p.Array, []],
        });
    };
    return AutocompleteInput;
}(text_input_1.TextInput));
exports.AutocompleteInput = AutocompleteInput;
AutocompleteInput.initClass();
