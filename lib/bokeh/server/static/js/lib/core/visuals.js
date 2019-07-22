"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mixins = require("./property_mixins");
var color_1 = require("./util/color");
function _horz(ctx, h, h2) {
    ctx.moveTo(0, h2 + 0.5);
    ctx.lineTo(h, h2 + 0.5);
    ctx.stroke();
}
function _vert(ctx, h, h2) {
    ctx.moveTo(h2 + 0.5, 0);
    ctx.lineTo(h2 + 0.5, h);
    ctx.stroke();
}
function _x(ctx, h) {
    ctx.moveTo(0, h);
    ctx.lineTo(h, 0);
    ctx.stroke();
    ctx.moveTo(0, 0);
    ctx.lineTo(h, h);
    ctx.stroke();
}
function _get_canvas(size) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}
function create_hatch_canvas(hatch_pattern, hatch_color, hatch_scale, hatch_weight) {
    var h = hatch_scale;
    var h2 = h / 2;
    var h4 = h2 / 2;
    var canvas = _get_canvas(hatch_scale);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = hatch_color;
    ctx.lineCap = "square";
    ctx.fillStyle = hatch_color;
    ctx.lineWidth = hatch_weight;
    switch (hatch_pattern) {
        // we should not need these if code conditions on hatch.doit, but
        // include them here just for completeness
        case " ":
        case "blank":
            break;
        case ".":
        case "dot":
            ctx.arc(h2, h2, h2 / 2, 0, 2 * Math.PI, true);
            ctx.fill();
            break;
        case "o":
        case "ring":
            ctx.arc(h2, h2, h2 / 2, 0, 2 * Math.PI, true);
            ctx.stroke();
            break;
        case "-":
        case "horizontal_line":
            _horz(ctx, h, h2);
            break;
        case "|":
        case "vertical_line":
            _vert(ctx, h, h2);
            break;
        case "+":
        case "cross":
            _horz(ctx, h, h2);
            _vert(ctx, h, h2);
            break;
        case "\"":
        case "horizontal_dash":
            _horz(ctx, h2, h2);
            break;
        case ":":
        case "vertical_dash":
            _vert(ctx, h2, h2);
            break;
        case "@":
        case "spiral":
            var h30 = h / 30;
            ctx.moveTo(h2, h2);
            for (var i = 0; i < 360; i++) {
                var angle = 0.1 * i;
                var x = h2 + (h30 * angle) * Math.cos(angle);
                var y = h2 + (h30 * angle) * Math.sin(angle);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;
        case "/":
        case "right_diagonal_line":
            ctx.moveTo(-h4 + 0.5, h);
            ctx.lineTo(h4 + 0.5, 0);
            ctx.stroke();
            ctx.moveTo(h4 + 0.5, h);
            ctx.lineTo(3 * h4 + 0.5, 0);
            ctx.stroke();
            ctx.moveTo(3 * h4 + 0.5, h);
            ctx.lineTo(5 * h4 + 0.5, 0);
            ctx.stroke();
            ctx.stroke();
            break;
        case "\\":
        case "left_diagonal_line":
            ctx.moveTo(h4 + 0.5, h);
            ctx.lineTo(-h4 + 0.5, 0);
            ctx.stroke();
            ctx.moveTo(3 * h4 + 0.5, h);
            ctx.lineTo(h4 + 0.5, 0);
            ctx.stroke();
            ctx.moveTo(5 * h4 + 0.5, h);
            ctx.lineTo(3 * h4 + 0.5, 0);
            ctx.stroke();
            ctx.stroke();
            break;
        case "x":
        case "diagonal_cross":
            _x(ctx, h);
            break;
        case ",":
        case "right_diagonal_dash":
            ctx.moveTo(h4 + 0.5, 3 * h4 + 0.5);
            ctx.lineTo(3 * h4 + 0.5, h4 + 0.5);
            ctx.stroke();
            break;
        case "`":
        case "left_diagonal_dash":
            ctx.moveTo(h4 + 0.5, h4 + 0.5);
            ctx.lineTo(3 * h4 + 0.5, 3 * h4 + 0.5);
            ctx.stroke();
            break;
        case "v":
        case "horizontal_wave":
            ctx.moveTo(0, h4);
            ctx.lineTo(h2, 3 * h4);
            ctx.lineTo(h, h4);
            ctx.stroke();
            break;
        case ">":
        case "vertical_wave":
            ctx.moveTo(h4, 0);
            ctx.lineTo(3 * h4, h2);
            ctx.lineTo(h4, h);
            ctx.stroke();
            break;
        case "*":
        case "criss_cross":
            _x(ctx, h);
            _horz(ctx, h, h2);
            _vert(ctx, h, h2);
            break;
    }
    return canvas;
}
var ContextProperties = /** @class */ (function () {
    function ContextProperties(obj, prefix) {
        if (prefix === void 0) { prefix = ""; }
        this.obj = obj;
        this.prefix = prefix;
        // }
        this.cache = {};
        for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
            var attr = _a[_i];
            this[attr] = obj.properties[prefix + attr];
        }
    }
    ContextProperties.prototype.warm_cache = function (source) {
        for (var _i = 0, _a = this.attrs; _i < _a.length; _i++) {
            var attr = _a[_i];
            var prop = this.obj.properties[this.prefix + attr];
            if (prop.spec.value !== undefined) // TODO (bev) better test?
                this.cache[attr] = prop.spec.value;
            else if (source != null)
                this.cache[attr + "_array"] = prop.array(source);
            else
                throw new Error("source is required with a vectorized visual property");
        }
    };
    ContextProperties.prototype.cache_select = function (attr, i) {
        var prop = this.obj.properties[this.prefix + attr];
        var value;
        if (prop.spec.value !== undefined) // TODO (bev) better test?
            this.cache[attr] = value = prop.spec.value;
        else
            this.cache[attr] = value = this.cache[attr + "_array"][i];
        return value;
    };
    ContextProperties.prototype.set_vectorize = function (ctx, i) {
        if (this.all_indices != null) // all_indices is set by a Visuals instance associated with a CDSView
            this._set_vectorize(ctx, this.all_indices[i]);
        else // all_indices is not set for annotations which may have vectorized visual props
            this._set_vectorize(ctx, i);
    };
    return ContextProperties;
}());
exports.ContextProperties = ContextProperties;
var Line = /** @class */ (function (_super) {
    tslib_1.__extends(Line, _super);
    function Line() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Line.prototype.set_value = function (ctx) {
        ctx.strokeStyle = this.line_color.value();
        ctx.globalAlpha = this.line_alpha.value();
        ctx.lineWidth = this.line_width.value();
        ctx.lineJoin = this.line_join.value();
        ctx.lineCap = this.line_cap.value();
        ctx.setLineDash(this.line_dash.value());
        ctx.setLineDashOffset(this.line_dash_offset.value());
    };
    Object.defineProperty(Line.prototype, "doit", {
        get: function () {
            return !(this.line_color.spec.value === null ||
                this.line_alpha.spec.value == 0 ||
                this.line_width.spec.value == 0);
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype._set_vectorize = function (ctx, i) {
        this.cache_select("line_color", i);
        if (ctx.strokeStyle !== this.cache.line_color)
            ctx.strokeStyle = this.cache.line_color;
        this.cache_select("line_alpha", i);
        if (ctx.globalAlpha !== this.cache.line_alpha)
            ctx.globalAlpha = this.cache.line_alpha;
        this.cache_select("line_width", i);
        if (ctx.lineWidth !== this.cache.line_width)
            ctx.lineWidth = this.cache.line_width;
        this.cache_select("line_join", i);
        if (ctx.lineJoin !== this.cache.line_join)
            ctx.lineJoin = this.cache.line_join;
        this.cache_select("line_cap", i);
        if (ctx.lineCap !== this.cache.line_cap)
            ctx.lineCap = this.cache.line_cap;
        this.cache_select("line_dash", i);
        if (ctx.getLineDash() !== this.cache.line_dash)
            ctx.setLineDash(this.cache.line_dash);
        this.cache_select("line_dash_offset", i);
        if (ctx.getLineDashOffset() !== this.cache.line_dash_offset)
            ctx.setLineDashOffset(this.cache.line_dash_offset);
    };
    Line.prototype.color_value = function () {
        var _a = color_1.color2rgba(this.line_color.value(), this.line_alpha.value()), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
        return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
    };
    return Line;
}(ContextProperties));
exports.Line = Line;
Line.prototype.attrs = Object.keys(mixins.line());
var Fill = /** @class */ (function (_super) {
    tslib_1.__extends(Fill, _super);
    function Fill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Fill.prototype.set_value = function (ctx) {
        ctx.fillStyle = this.fill_color.value();
        ctx.globalAlpha = this.fill_alpha.value();
    };
    Object.defineProperty(Fill.prototype, "doit", {
        get: function () {
            return !(this.fill_color.spec.value === null ||
                this.fill_alpha.spec.value == 0);
        },
        enumerable: true,
        configurable: true
    });
    Fill.prototype._set_vectorize = function (ctx, i) {
        this.cache_select("fill_color", i);
        if (ctx.fillStyle !== this.cache.fill_color)
            ctx.fillStyle = this.cache.fill_color;
        this.cache_select("fill_alpha", i);
        if (ctx.globalAlpha !== this.cache.fill_alpha)
            ctx.globalAlpha = this.cache.fill_alpha;
    };
    Fill.prototype.color_value = function () {
        var _a = color_1.color2rgba(this.fill_color.value(), this.fill_alpha.value()), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
        return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
    };
    return Fill;
}(ContextProperties));
exports.Fill = Fill;
Fill.prototype.attrs = Object.keys(mixins.fill());
var Hatch = /** @class */ (function (_super) {
    tslib_1.__extends(Hatch, _super);
    function Hatch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hatch.prototype.cache_select = function (name, i) {
        var value;
        if (name == "pattern") {
            this.cache_select("hatch_color", i);
            this.cache_select("hatch_scale", i);
            this.cache_select("hatch_pattern", i);
            this.cache_select("hatch_weight", i);
            var _a = this.cache, hatch_color_1 = _a.hatch_color, hatch_scale_1 = _a.hatch_scale, hatch_pattern_1 = _a.hatch_pattern, hatch_weight_1 = _a.hatch_weight, hatch_extra = _a.hatch_extra;
            if (hatch_extra != null && hatch_extra.hasOwnProperty(hatch_pattern_1)) {
                var custom = hatch_extra[hatch_pattern_1];
                this.cache.pattern = custom.get_pattern(hatch_color_1, hatch_scale_1, hatch_weight_1);
            }
            else {
                this.cache.pattern = function (ctx) {
                    var canvas = create_hatch_canvas(hatch_pattern_1, hatch_color_1, hatch_scale_1, hatch_weight_1);
                    return ctx.createPattern(canvas, 'repeat');
                };
            }
        }
        else
            value = _super.prototype.cache_select.call(this, name, i);
        return value;
    };
    Hatch.prototype._try_defer = function (defer_func) {
        var _a = this.cache, hatch_pattern = _a.hatch_pattern, hatch_extra = _a.hatch_extra;
        if (hatch_extra != null && hatch_extra.hasOwnProperty(hatch_pattern)) {
            var custom = hatch_extra[hatch_pattern];
            custom.onload(defer_func);
        }
    };
    Object.defineProperty(Hatch.prototype, "doit", {
        get: function () {
            return !(this.hatch_color.spec.value === null ||
                this.hatch_alpha.spec.value == 0 ||
                this.hatch_pattern.spec.value == " " ||
                this.hatch_pattern.spec.value == "blank" ||
                this.hatch_pattern.spec.value === null);
        },
        enumerable: true,
        configurable: true
    });
    Hatch.prototype.doit2 = function (ctx, i, ready_func, defer_func) {
        if (!this.doit) {
            return;
        }
        this.cache_select("pattern", i);
        var pattern = this.cache.pattern(ctx);
        if (pattern == null) {
            this._try_defer(defer_func);
        }
        else {
            this.set_vectorize(ctx, i);
            ready_func();
        }
    };
    Hatch.prototype._set_vectorize = function (ctx, i) {
        this.cache_select("pattern", i);
        ctx.fillStyle = this.cache.pattern(ctx);
        this.cache_select("hatch_alpha", i);
        if (ctx.globalAlpha !== this.cache.hatch_alpha)
            ctx.globalAlpha = this.cache.hatch_alpha;
    };
    Hatch.prototype.color_value = function () {
        var _a = color_1.color2rgba(this.hatch_color.value(), this.hatch_alpha.value()), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
        return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
    };
    return Hatch;
}(ContextProperties));
exports.Hatch = Hatch;
Hatch.prototype.attrs = Object.keys(mixins.hatch());
var Text = /** @class */ (function (_super) {
    tslib_1.__extends(Text, _super);
    function Text() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Text.prototype.cache_select = function (name, i) {
        var value;
        if (name == "font") {
            _super.prototype.cache_select.call(this, "text_font_style", i);
            _super.prototype.cache_select.call(this, "text_font_size", i);
            _super.prototype.cache_select.call(this, "text_font", i);
            var _a = this.cache, text_font_style = _a.text_font_style, text_font_size = _a.text_font_size, text_font = _a.text_font;
            this.cache.font = value = text_font_style + " " + text_font_size + " " + text_font;
        }
        else
            value = _super.prototype.cache_select.call(this, name, i);
        return value;
    };
    Text.prototype.font_value = function () {
        var font = this.text_font.value();
        var font_size = this.text_font_size.value();
        var font_style = this.text_font_style.value();
        return font_style + " " + font_size + " " + font;
    };
    Text.prototype.color_value = function () {
        var _a = color_1.color2rgba(this.text_color.value(), this.text_alpha.value()), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
        return "rgba(" + r * 255 + "," + g * 255 + "," + b * 255 + "," + a + ")";
    };
    Text.prototype.set_value = function (ctx) {
        ctx.font = this.font_value();
        ctx.fillStyle = this.text_color.value();
        ctx.globalAlpha = this.text_alpha.value();
        ctx.textAlign = this.text_align.value();
        ctx.textBaseline = this.text_baseline.value();
    };
    Object.defineProperty(Text.prototype, "doit", {
        get: function () {
            return !(this.text_color.spec.value === null ||
                this.text_alpha.spec.value == 0);
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype._set_vectorize = function (ctx, i) {
        this.cache_select("font", i);
        if (ctx.font !== this.cache.font)
            ctx.font = this.cache.font;
        this.cache_select("text_color", i);
        if (ctx.fillStyle !== this.cache.text_color)
            ctx.fillStyle = this.cache.text_color;
        this.cache_select("text_alpha", i);
        if (ctx.globalAlpha !== this.cache.text_alpha)
            ctx.globalAlpha = this.cache.text_alpha;
        this.cache_select("text_align", i);
        if (ctx.textAlign !== this.cache.text_align)
            ctx.textAlign = this.cache.text_align;
        this.cache_select("text_baseline", i);
        if (ctx.textBaseline !== this.cache.text_baseline)
            ctx.textBaseline = this.cache.text_baseline;
    };
    return Text;
}(ContextProperties));
exports.Text = Text;
Text.prototype.attrs = Object.keys(mixins.text());
var Visuals = /** @class */ (function () {
    function Visuals(model) {
        for (var _i = 0, _a = model.mixins; _i < _a.length; _i++) {
            var mixin = _a[_i];
            var _b = mixin.split(":"), name_1 = _b[0], _c = _b[1], prefix = _c === void 0 ? "" : _c;
            var cls = void 0;
            switch (name_1) {
                case "line":
                    cls = Line;
                    break;
                case "fill":
                    cls = Fill;
                    break;
                case "hatch":
                    cls = Hatch;
                    break;
                case "text":
                    cls = Text;
                    break;
                default:
                    throw new Error("unknown visual: " + name_1);
            }
            this[prefix + name_1] = new cls(model, prefix);
        }
    }
    Visuals.prototype.warm_cache = function (source) {
        for (var name_2 in this) {
            if (this.hasOwnProperty(name_2)) {
                var prop = this[name_2];
                if (prop instanceof ContextProperties)
                    prop.warm_cache(source);
            }
        }
    };
    Visuals.prototype.set_all_indices = function (all_indices) {
        for (var name_3 in this) {
            if (this.hasOwnProperty(name_3)) {
                var prop = this[name_3];
                if (prop instanceof ContextProperties)
                    prop.all_indices = all_indices;
            }
        }
    };
    return Visuals;
}());
exports.Visuals = Visuals;
