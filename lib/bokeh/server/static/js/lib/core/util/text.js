"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = require("../dom");
var cache = {};
function measure_font(font) {
    if (cache[font] != null)
        return cache[font];
    var text = dom_1.span({ style: { font: font } }, "Hg");
    var block = dom_1.div({ style: { display: "inline-block", width: "1px", height: "0px" } });
    var elem = dom_1.div({}, text, block);
    document.body.appendChild(elem);
    try {
        block.style.verticalAlign = "baseline";
        var ascent = dom_1.offset(block).top - dom_1.offset(text).top;
        block.style.verticalAlign = "bottom";
        var height = dom_1.offset(block).top - dom_1.offset(text).top;
        var result = { height: height, ascent: ascent, descent: height - ascent };
        cache[font] = result;
        return result;
    }
    finally {
        document.body.removeChild(elem);
    }
}
exports.measure_font = measure_font;
var _cache = {};
function measure_text(text, font) {
    var text_cache = _cache[font];
    if (text_cache != null) {
        var size = text_cache[text];
        if (size != null)
            return size;
    }
    else
        _cache[font] = {};
    var el = dom_1.div({ style: { display: "inline-block", "white-space": "nowrap", font: font } }, text);
    document.body.appendChild(el);
    try {
        var _a = el.getBoundingClientRect(), width = _a.width, height = _a.height;
        _cache[font][text] = { width: width, height: height };
        return { width: width, height: height };
    }
    finally {
        document.body.removeChild(el);
    }
}
exports.measure_text = measure_text;
