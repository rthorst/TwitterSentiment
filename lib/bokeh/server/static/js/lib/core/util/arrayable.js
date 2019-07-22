"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function splice(array, start, k) {
    var items = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        items[_i - 3] = arguments[_i];
    }
    var len = array.length;
    if (start < 0)
        start += len;
    if (start < 0)
        start = 0;
    else if (start > len)
        start = len;
    if (k == null || k > len - start)
        k = len - start;
    else if (k < 0)
        k = 0;
    var n = len - k + items.length;
    var result = new array.constructor(n);
    var i = 0;
    for (; i < start; i++) {
        result[i] = array[i];
    }
    for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
        var item = items_1[_a];
        result[i++] = item;
    }
    for (var j = start + k; j < len; j++) {
        result[i++] = array[j];
    }
    return result;
}
exports.splice = splice;
function insert(array, item, i) {
    return splice(array, i, 0, item);
}
exports.insert = insert;
function append(array, item) {
    return splice(array, array.length, 0, item);
}
exports.append = append;
function prepend(array, item) {
    return splice(array, 0, 0, item);
}
exports.prepend = prepend;
function indexOf(array, item) {
    for (var i = 0, n = array.length; i < n; i++) {
        if (array[i] === item)
            return i;
    }
    return -1;
}
exports.indexOf = indexOf;
function map(array, fn) {
    var n = array.length;
    var result = new array.constructor(n);
    for (var i = 0; i < n; i++) {
        result[i] = fn(array[i], i, array);
    }
    return result;
}
exports.map = map;
function reduce(array, fn, initial) {
    var n = array.length;
    if (initial === undefined && n == 0)
        throw new Error("can't reduce an empty array without an initial value");
    var value;
    var i;
    if (initial === undefined) {
        value = array[0];
        i = 1;
    }
    else {
        value = initial;
        i = 0;
    }
    for (; i < n; i++) {
        value = fn(value, array[i], i, array);
    }
    return value;
}
exports.reduce = reduce;
function min(array) {
    var value;
    var result = Infinity;
    for (var i = 0, length_1 = array.length; i < length_1; i++) {
        value = array[i];
        if (value < result) {
            result = value;
        }
    }
    return result;
}
exports.min = min;
function min_by(array, key) {
    if (array.length == 0)
        throw new Error("min_by() called with an empty array");
    var result = array[0];
    var resultComputed = key(result);
    for (var i = 1, length_2 = array.length; i < length_2; i++) {
        var value = array[i];
        var computed = key(value);
        if (computed < resultComputed) {
            result = value;
            resultComputed = computed;
        }
    }
    return result;
}
exports.min_by = min_by;
function max(array) {
    var value;
    var result = -Infinity;
    for (var i = 0, length_3 = array.length; i < length_3; i++) {
        value = array[i];
        if (value > result) {
            result = value;
        }
    }
    return result;
}
exports.max = max;
function max_by(array, key) {
    if (array.length == 0)
        throw new Error("max_by() called with an empty array");
    var result = array[0];
    var resultComputed = key(result);
    for (var i = 1, length_4 = array.length; i < length_4; i++) {
        var value = array[i];
        var computed = key(value);
        if (computed > resultComputed) {
            result = value;
            resultComputed = computed;
        }
    }
    return result;
}
exports.max_by = max_by;
function sum(array) {
    var result = 0;
    for (var i = 0, n = array.length; i < n; i++) {
        result += array[i];
    }
    return result;
}
exports.sum = sum;
function cumsum(array) {
    var result = new array.constructor(array.length);
    reduce(array, function (a, b, i) { return result[i] = a + b; }, 0);
    return result;
}
exports.cumsum = cumsum;
function every(array, predicate) {
    for (var i = 0, length_5 = array.length; i < length_5; i++) {
        if (!predicate(array[i]))
            return false;
    }
    return true;
}
exports.every = every;
function some(array, predicate) {
    for (var i = 0, length_6 = array.length; i < length_6; i++) {
        if (predicate(array[i]))
            return true;
    }
    return false;
}
exports.some = some;
function index_of(array, value) {
    for (var i = 0, length_7 = array.length; i < length_7; i++) {
        if (array[i] === value)
            return i;
    }
    return -1;
}
exports.index_of = index_of;
function _find_index(dir) {
    return function (array, predicate) {
        var length = array.length;
        var index = dir > 0 ? 0 : length - 1;
        for (; index >= 0 && index < length; index += dir) {
            if (predicate(array[index]))
                return index;
        }
        return -1;
    };
}
exports.find_index = _find_index(1);
exports.find_last_index = _find_index(-1);
function find(array, predicate) {
    var index = exports.find_index(array, predicate);
    return index == -1 ? undefined : array[index];
}
exports.find = find;
function find_last(array, predicate) {
    var index = exports.find_last_index(array, predicate);
    return index == -1 ? undefined : array[index];
}
exports.find_last = find_last;
function sorted_index(array, value) {
    var low = 0;
    var high = array.length;
    while (low < high) {
        var mid = Math.floor((low + high) / 2);
        if (array[mid] < value)
            low = mid + 1;
        else
            high = mid;
    }
    return low;
}
exports.sorted_index = sorted_index;
