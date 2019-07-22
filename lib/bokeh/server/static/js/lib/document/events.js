"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var has_props_1 = require("../core/has_props");
var DocumentChangedEvent = /** @class */ (function () {
    function DocumentChangedEvent(document) {
        this.document = document;
    }
    return DocumentChangedEvent;
}());
exports.DocumentChangedEvent = DocumentChangedEvent;
var ModelChangedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(ModelChangedEvent, _super);
    function ModelChangedEvent(document, model, attr, old, new_, setter_id, hint) {
        var _this = _super.call(this, document) || this;
        _this.model = model;
        _this.attr = attr;
        _this.old = old;
        _this.new_ = new_;
        _this.setter_id = setter_id;
        _this.hint = hint;
        return _this;
    }
    ModelChangedEvent.prototype.json = function (references) {
        if (this.attr === "id") {
            throw new Error("'id' field should never change, whatever code just set it is wrong");
        }
        if (this.hint != null)
            return this.hint.json(references);
        var value = this.new_;
        var value_json = has_props_1.HasProps._value_to_json(this.attr, value, this.model);
        var value_refs = {};
        has_props_1.HasProps._value_record_references(value, value_refs, true); // true = recurse
        if (this.model.id in value_refs && this.model !== value) {
            // we know we don't want a whole new copy of the obj we're
            // patching unless it's also the value itself
            delete value_refs[this.model.id];
        }
        for (var id in value_refs) {
            references[id] = value_refs[id];
        }
        return {
            kind: "ModelChanged",
            model: this.model.ref(),
            attr: this.attr,
            new: value_json,
        };
    };
    return ModelChangedEvent;
}(DocumentChangedEvent));
exports.ModelChangedEvent = ModelChangedEvent;
var ColumnsPatchedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(ColumnsPatchedEvent, _super);
    function ColumnsPatchedEvent(document, column_source, patches) {
        var _this = _super.call(this, document) || this;
        _this.column_source = column_source;
        _this.patches = patches;
        return _this;
    }
    ColumnsPatchedEvent.prototype.json = function (_references) {
        return {
            kind: "ColumnsPatched",
            column_source: this.column_source,
            patches: this.patches,
        };
    };
    return ColumnsPatchedEvent;
}(DocumentChangedEvent));
exports.ColumnsPatchedEvent = ColumnsPatchedEvent;
var ColumnsStreamedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(ColumnsStreamedEvent, _super);
    function ColumnsStreamedEvent(document, column_source, data, rollover) {
        var _this = _super.call(this, document) || this;
        _this.column_source = column_source;
        _this.data = data;
        _this.rollover = rollover;
        return _this;
    }
    ColumnsStreamedEvent.prototype.json = function (_references) {
        return {
            kind: "ColumnsStreamed",
            column_source: this.column_source,
            data: this.data,
            rollover: this.rollover,
        };
    };
    return ColumnsStreamedEvent;
}(DocumentChangedEvent));
exports.ColumnsStreamedEvent = ColumnsStreamedEvent;
var TitleChangedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(TitleChangedEvent, _super);
    function TitleChangedEvent(document, title, setter_id) {
        var _this = _super.call(this, document) || this;
        _this.title = title;
        _this.setter_id = setter_id;
        return _this;
    }
    TitleChangedEvent.prototype.json = function (_references) {
        return {
            kind: "TitleChanged",
            title: this.title,
        };
    };
    return TitleChangedEvent;
}(DocumentChangedEvent));
exports.TitleChangedEvent = TitleChangedEvent;
var RootAddedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(RootAddedEvent, _super);
    function RootAddedEvent(document, model, setter_id) {
        var _this = _super.call(this, document) || this;
        _this.model = model;
        _this.setter_id = setter_id;
        return _this;
    }
    RootAddedEvent.prototype.json = function (references) {
        has_props_1.HasProps._value_record_references(this.model, references, true);
        return {
            kind: "RootAdded",
            model: this.model.ref(),
        };
    };
    return RootAddedEvent;
}(DocumentChangedEvent));
exports.RootAddedEvent = RootAddedEvent;
var RootRemovedEvent = /** @class */ (function (_super) {
    tslib_1.__extends(RootRemovedEvent, _super);
    function RootRemovedEvent(document, model, setter_id) {
        var _this = _super.call(this, document) || this;
        _this.model = model;
        _this.setter_id = setter_id;
        return _this;
    }
    RootRemovedEvent.prototype.json = function (_references) {
        return {
            kind: "RootRemoved",
            model: this.model.ref(),
        };
    };
    return RootRemovedEvent;
}(DocumentChangedEvent));
exports.RootRemovedEvent = RootRemovedEvent;
