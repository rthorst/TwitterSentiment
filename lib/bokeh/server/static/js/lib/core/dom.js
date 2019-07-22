"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./util/types");
var _createElement = function (tag) {
    return function (attrs) {
        if (attrs === void 0) { attrs = {}; }
        var children = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            children[_i - 1] = arguments[_i];
        }
        var element = document.createElement(tag);
        element.classList.add("bk");
        for (var attr in attrs) {
            var value = attrs[attr];
            if (value == null || types_1.isBoolean(value) && !value)
                continue;
            if (attr === "class") {
                if (types_1.isString(value))
                    value = value.split(/\s+/);
                if (types_1.isArray(value)) {
                    for (var _a = 0, _b = value; _a < _b.length; _a++) {
                        var cls = _b[_a];
                        if (cls != null)
                            element.classList.add(cls);
                    }
                    continue;
                }
            }
            if (attr === "style" && types_1.isPlainObject(value)) {
                for (var prop in value) {
                    element.style[prop] = value[prop];
                }
                continue;
            }
            if (attr === "data" && types_1.isPlainObject(value)) {
                for (var key in value) {
                    element.dataset[key] = value[key]; // XXX: attrs needs a better type
                }
                continue;
            }
            element.setAttribute(attr, value);
        }
        function append(child) {
            if (child instanceof HTMLElement)
                element.appendChild(child);
            else if (types_1.isString(child))
                element.appendChild(document.createTextNode(child));
            else if (child != null && child !== false)
                throw new Error("expected an HTMLElement, string, false or null, got " + JSON.stringify(child));
        }
        for (var _c = 0, children_1 = children; _c < children_1.length; _c++) {
            var child = children_1[_c];
            if (types_1.isArray(child)) {
                for (var _d = 0, child_1 = child; _d < child_1.length; _d++) {
                    var _child = child_1[_d];
                    append(_child);
                }
            }
            else
                append(child);
        }
        return element;
    };
};
function createElement(tag, attrs) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return _createElement(tag).apply(void 0, [attrs].concat(children));
}
exports.createElement = createElement;
exports.div = _createElement("div"), exports.span = _createElement("span"), exports.canvas = _createElement("canvas"), exports.link = _createElement("link"), exports.style = _createElement("style"), exports.a = _createElement("a"), exports.p = _createElement("p"), exports.i = _createElement("i"), exports.pre = _createElement("pre"), exports.button = _createElement("button"), exports.label = _createElement("label"), exports.input = _createElement("input"), exports.select = _createElement("select"), exports.option = _createElement("option"), exports.optgroup = _createElement("optgroup"), exports.textarea = _createElement("textarea");
function nbsp() {
    return document.createTextNode("\u00a0");
}
exports.nbsp = nbsp;
function removeElement(element) {
    var parent = element.parentNode;
    if (parent != null) {
        parent.removeChild(element);
    }
}
exports.removeElement = removeElement;
function replaceWith(element, replacement) {
    var parent = element.parentNode;
    if (parent != null) {
        parent.replaceChild(replacement, element);
    }
}
exports.replaceWith = replaceWith;
function prepend(element) {
    var nodes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        nodes[_i - 1] = arguments[_i];
    }
    var first = element.firstChild;
    for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
        var node = nodes_1[_a];
        element.insertBefore(node, first);
    }
}
exports.prepend = prepend;
function empty(element) {
    var child;
    while (child = element.firstChild) {
        element.removeChild(child);
    }
}
exports.empty = empty;
function display(element) {
    element.style.display = "";
}
exports.display = display;
function undisplay(element) {
    element.style.display = "none";
}
exports.undisplay = undisplay;
function show(element) {
    element.style.visibility = "";
}
exports.show = show;
function hide(element) {
    element.style.visibility = "hidden";
}
exports.hide = hide;
function offset(element) {
    var rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset - document.documentElement.clientTop,
        left: rect.left + window.pageXOffset - document.documentElement.clientLeft,
    };
}
exports.offset = offset;
function matches(el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector;
    return f.call(el, selector);
}
exports.matches = matches;
function parent(el, selector) {
    var node = el;
    while (node = node.parentElement) {
        if (matches(node, selector))
            return node;
    }
    return null;
}
exports.parent = parent;
function num(value) {
    return parseFloat(value) || 0;
}
function extents(el) {
    var style = getComputedStyle(el);
    return {
        border: {
            top: num(style.borderTopWidth),
            bottom: num(style.borderBottomWidth),
            left: num(style.borderLeftWidth),
            right: num(style.borderRightWidth),
        },
        margin: {
            top: num(style.marginTop),
            bottom: num(style.marginBottom),
            left: num(style.marginLeft),
            right: num(style.marginRight),
        },
        padding: {
            top: num(style.paddingTop),
            bottom: num(style.paddingBottom),
            left: num(style.paddingLeft),
            right: num(style.paddingRight),
        },
    };
}
exports.extents = extents;
function size(el) {
    var rect = el.getBoundingClientRect();
    return {
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
    };
}
exports.size = size;
function scroll_size(el) {
    return {
        width: Math.ceil(el.scrollWidth),
        height: Math.ceil(el.scrollHeight),
    };
}
exports.scroll_size = scroll_size;
function outer_size(el) {
    var _a = extents(el).margin, left = _a.left, right = _a.right, top = _a.top, bottom = _a.bottom;
    var _b = size(el), width = _b.width, height = _b.height;
    return {
        width: Math.ceil(width + left + right),
        height: Math.ceil(height + top + bottom),
    };
}
exports.outer_size = outer_size;
function content_size(el) {
    var _a = el.getBoundingClientRect(), left = _a.left, top = _a.top;
    var padding = extents(el).padding;
    var width = 0;
    var height = 0;
    for (var _i = 0, _b = children(el); _i < _b.length; _i++) {
        var child = _b[_i];
        var rect = child.getBoundingClientRect();
        width = Math.max(width, Math.ceil(rect.left - left - padding.left + rect.width));
        height = Math.max(height, Math.ceil(rect.top - top - padding.top + rect.height));
    }
    return { width: width, height: height };
}
exports.content_size = content_size;
function position(el, box, margin) {
    var style = el.style;
    style.left = box.left + "px";
    style.top = box.top + "px";
    style.width = box.width + "px";
    style.height = box.height + "px";
    if (margin == null)
        style.margin = "";
    else {
        var top_1 = margin.top, right = margin.right, bottom = margin.bottom, left = margin.left;
        style.margin = top_1 + "px " + right + "px " + bottom + "px " + left + "px";
    }
}
exports.position = position;
function children(el) {
    return Array.from(el.children);
}
exports.children = children;
var ClassList = /** @class */ (function () {
    function ClassList(el) {
        this.el = el;
        this.classList = el.classList;
    }
    Object.defineProperty(ClassList.prototype, "values", {
        get: function () {
            var values = [];
            for (var i_1 = 0; i_1 < this.classList.length; i_1++) {
                var item = this.classList.item(i_1);
                if (item != null)
                    values.push(item);
            }
            return values;
        },
        enumerable: true,
        configurable: true
    });
    ClassList.prototype.has = function (cls) {
        return this.classList.contains(cls);
    };
    ClassList.prototype.add = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i] = arguments[_i];
        }
        for (var _a = 0, classes_1 = classes; _a < classes_1.length; _a++) {
            var cls = classes_1[_a];
            this.classList.add(cls);
        }
        return this;
    };
    ClassList.prototype.remove = function () {
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i] = arguments[_i];
        }
        for (var _a = 0, classes_2 = classes; _a < classes_2.length; _a++) {
            var cls = classes_2[_a];
            this.classList.remove(cls);
        }
        return this;
    };
    ClassList.prototype.clear = function () {
        for (var _i = 0, _a = this.values; _i < _a.length; _i++) {
            var cls = _a[_i];
            if (cls != "bk")
                this.classList.remove(cls);
        }
        return this;
    };
    ClassList.prototype.toggle = function (cls, activate) {
        var add = activate != null ? activate : !this.has(cls);
        if (add)
            this.add(cls);
        else
            this.remove(cls);
        return this;
    };
    return ClassList;
}());
exports.ClassList = ClassList;
function classes(el) {
    return new ClassList(el);
}
exports.classes = classes;
var Keys;
(function (Keys) {
    Keys[Keys["Backspace"] = 8] = "Backspace";
    Keys[Keys["Tab"] = 9] = "Tab";
    Keys[Keys["Enter"] = 13] = "Enter";
    Keys[Keys["Esc"] = 27] = "Esc";
    Keys[Keys["PageUp"] = 33] = "PageUp";
    Keys[Keys["PageDown"] = 34] = "PageDown";
    Keys[Keys["Left"] = 37] = "Left";
    Keys[Keys["Up"] = 38] = "Up";
    Keys[Keys["Right"] = 39] = "Right";
    Keys[Keys["Down"] = 40] = "Down";
    Keys[Keys["Delete"] = 46] = "Delete";
})(Keys = exports.Keys || (exports.Keys = {}));
function undisplayed(el, fn) {
    var display = el.style.display;
    el.style.display = "none";
    try {
        return fn();
    }
    finally {
        el.style.display = display;
    }
}
exports.undisplayed = undisplayed;
function unsized(el, fn) {
    return sized(el, {}, fn);
}
exports.unsized = unsized;
function sized(el, size, fn) {
    var _a = el.style, width = _a.width, height = _a.height, position = _a.position, display = _a.display;
    el.style.position = "absolute";
    el.style.display = "";
    el.style.width = size.width != null && size.width != Infinity ? size.width + "px" : "auto";
    el.style.height = size.height != null && size.height != Infinity ? size.height + "px" : "auto";
    try {
        return fn();
    }
    finally {
        el.style.position = position;
        el.style.display = display;
        el.style.width = width;
        el.style.height = height;
    }
}
exports.sized = sized;
