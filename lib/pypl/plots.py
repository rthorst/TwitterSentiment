import itertools
import svgwrite
from collections import defaultdict

from . import utils


class ElementsCollection(defaultdict):

    def __init__(self):
        super(ElementsCollection, self).__init__(list)

    @property
    def elements(self):
        return list(itertools.chain(*[val for val in self.values()]))

    def attr(self, key, value):
        for e in self.elements:
            e.attribs[key] = value
        return self

    def select(self, *selected):
        coll = ElementsCollection()
        for sel in selected:
            coll[sel] = self[sel]
        return coll

    def __add__(self, coll):
        out = ElementsCollection()
        for key, val in self.items():
            out[key].extend(val)

        for key, val in coll.items():
            out[key].extend(val)
        return out

    def to_svg_elements(self, target, order=None):
        if order is None:
            order = self.keys()

        for key in order:
            target.elements.extend(self[key])

        return target


def scatterplot(x, y, colors, cycle=True):
    output = ElementsCollection()
    n = max(len(x), len(y))

    if cycle:
        x = itertools.cycle(x)
        y = itertools.cycle(y)
        colors = itertools.cycle(colors)

    for _, x_, y_, col in zip(range(n), x, y, colors):
        output['points'].append(svgwrite.shapes.Circle((x_, y_), fill=col))

    return output


def boxplot(data, scl, loc, width):
    raw_prc = utils.prctiles(data)
    raw_prc = utils.clip(raw_prc, scl)
    p0, p25, p50, p75, p100 = [scl(p) for p in raw_prc]

    output = ElementsCollection()
    for points in ((p0, p25), (p75, p100)):
        output['whiskers'].append(
            svgwrite.shapes.Line(*utils.vpoints(loc, points)))

    output['box'].append(
        svgwrite.shapes.Rect(
            insert=(loc-0.5*width, min(p25, p75)),
            size=(width, abs(p75-p25))))

    output['median'].append(
        svgwrite.shapes.Line(
            *utils.hpoints(p50, [loc-.5*width, loc+.5*width])))

    return output


def legend(names2styles, loc, step, size, marker=svgwrite.shapes.Rect):
    output = ElementsCollection()
    x, y = loc
    for name, style in names2styles.items():
        if isinstance(style, str):
            style = {'fill': style}
        output['fields'].append(
            marker(*_marker2args(marker, x, y, size), **style))
        output['labels'].append(
            svgwrite.text.Text(name,
                               insert=(x+2*size, y),
                               alignment_baseline='middle'))
        y += step
    return output


def _marker2args(marker, x, y, size):
    translated = {
        svgwrite.shapes.Rect: ((x, y), (size, size)),
        svgwrite.shapes.Circle: ((x+size/2, y+size/2), size/2),
        svgwrite.shapes.Line: ((x, y+size/2), (x+size, y+size/2))
    }
    return translated[marker]


def errorline(xy, ci=None, mark=True):
    coords = [(x, y) for x, y in zip(*xy)]

    output = ElementsCollection()

    if ci is not None:
        cix = [point[0] for point in coords]
        cix = itertools.chain(cix, reversed(cix))
        ciy = itertools.chain(ci[0], reversed(ci[1]))
        cipoints = [(x, y) for x, y in zip(cix, ciy)]
        output['ci'].append(
            svgwrite.shapes.Polygon(cipoints))

    output['line'].append(
        svgwrite.shapes.Polyline(coords))

    if mark:
        for point in coords:
            output['markers'].append(
                svgwrite.shapes.Circle(point))

    return output


def bars(xy, width, base):
    coords = [(x, y) for x, y in zip(*xy)]
    output = ElementsCollection()

    for x, y in coords:
        output['bars'].append(
            svgwrite.shapes.Rect((x-0.5*width, y), (width, abs(y-base))))

    return output
