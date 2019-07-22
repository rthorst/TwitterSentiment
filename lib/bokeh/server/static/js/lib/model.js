"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var has_props_1 = require("./core/has_props");
var p = require("./core/properties");
var types_1 = require("./core/util/types");
var object_1 = require("./core/util/object");
var logging_1 = require("./core/logging");
var Model = /** @class */ (function (_super) {
    tslib_1.__extends(Model, _super);
    function Model(attrs) {
        return _super.call(this, attrs) || this;
    }
    Model.initClass = function () {
        this.prototype.type = "Model";
        this.define({
            tags: [p.Array, []],
            name: [p.String],
            js_property_callbacks: [p.Any, {}],
            js_event_callbacks: [p.Any, {}],
            subscribed_events: [p.Array, []],
        });
    };
    Model.prototype.connect_signals = function () {
        var _this = this;
        _super.prototype.connect_signals.call(this);
        this._update_property_callbacks();
        this.connect(this.properties.js_property_callbacks.change, function () { return _this._update_property_callbacks(); });
        this.connect(this.properties.js_event_callbacks.change, function () { return _this._update_event_callbacks(); });
        this.connect(this.properties.subscribed_events.change, function () { return _this._update_event_callbacks(); });
    };
    /*protected*/ Model.prototype._process_event = function (event) {
        for (var _i = 0, _a = this.js_event_callbacks[event.event_name] || []; _i < _a.length; _i++) {
            var callback = _a[_i];
            callback.execute(event);
        }
        if (this.document != null && this.subscribed_events.some(function (m) { return m == event.event_name; }))
            this.document.event_manager.send_event(event);
    };
    Model.prototype.trigger_event = function (event) {
        if (this.document != null) {
            event.origin = this;
            this.document.event_manager.trigger(event);
        }
    };
    Model.prototype._update_event_callbacks = function () {
        if (this.document == null) {
            // File an issue: SidePanel in particular seems to have this issue
            logging_1.logger.warn('WARNING: Document not defined for updating event callbacks');
            return;
        }
        this.document.event_manager.subscribed_models.add(this.id);
    };
    Model.prototype._update_property_callbacks = function () {
        var _this = this;
        var signal_for = function (event) {
            var _a = event.split(":"), evt = _a[0], _b = _a[1], attr = _b === void 0 ? null : _b;
            return attr != null ? _this.properties[attr][evt] : _this[evt];
        };
        for (var event_1 in this._js_callbacks) {
            var callbacks = this._js_callbacks[event_1];
            var signal = signal_for(event_1);
            for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                var cb = callbacks_1[_i];
                this.disconnect(signal, cb);
            }
        }
        this._js_callbacks = {};
        for (var event_2 in this.js_property_callbacks) {
            var callbacks = this.js_property_callbacks[event_2];
            var wrappers = callbacks.map(function (cb) { return function () { return cb.execute(_this); }; });
            this._js_callbacks[event_2] = wrappers;
            var signal = signal_for(event_2);
            for (var _a = 0, wrappers_1 = wrappers; _a < wrappers_1.length; _a++) {
                var cb = wrappers_1[_a];
                this.connect(signal, cb);
            }
        }
    };
    Model.prototype._doc_attached = function () {
        if (!object_1.isEmpty(this.js_event_callbacks) || !object_1.isEmpty(this.subscribed_events))
            this._update_event_callbacks();
    };
    Model.prototype.select = function (selector) {
        if (types_1.isString(selector))
            return this.references().filter(function (ref) { return ref instanceof Model && ref.name === selector; });
        else if (selector.prototype instanceof has_props_1.HasProps)
            return this.references().filter(function (ref) { return ref instanceof selector; });
        else
            throw new Error("invalid selector");
    };
    Model.prototype.select_one = function (selector) {
        var result = this.select(selector);
        switch (result.length) {
            case 0:
                return null;
            case 1:
                return result[0];
            default:
                throw new Error("found more than one object matching given selector");
        }
    };
    return Model;
}(has_props_1.HasProps));
exports.Model = Model;
Model.initClass();
