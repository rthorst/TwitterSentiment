import functools
import collections
import operator
import svgwrite

from .plots import ElementsCollection
from . import utils


def vaxis(scl, ticks=5, x=0, **specs):
    specs = set_general_defaults(specs, scl)

    return makeaxis('vertical', scl, ticks, x, specs)


def haxis(scl, ticks=5, y=0, **specs):
    specs = set_general_defaults(specs, scl)

    return makeaxis('horizontal', scl, ticks, y, specs)


def vtufte(data, scl, x=0, offset=None, **specs):
    specs = set_general_defaults(specs, scl)
    return tufteaxis(data, scl, x, offset, 'vertical', specs)


def htufte(data, scl, y=0, offset=None, **specs):
    specs = set_general_defaults(specs, scl)
    return tufteaxis(data, scl, y, offset, 'horizontal', specs)


def tufteaxis(data, scl, loc, offset, orientation, specs):
    ticklabelformat = specs['ticklabelformat']

    output = ElementsCollection()
    p0, p25, p50, p75, p100 = utils.prctiles(data)
    if offset is None:
        offset = .01*(scl(p100) - scl(p0))

    if orientation == 'vertical':
        pointlocalizer = utils.vpoints
        tick_label_loc = utils.partialpoint(x=loc-5*specs['tick_size'])
        label_loc = utils.partialpoint(x=loc-10*specs['tick_size'])
    else:
        pointlocalizer = utils.hpoints
        tick_label_loc = utils.partialpoint(y=loc-5*specs['tick_size'])
        label_loc = utils.partialpoint(y=loc-10*specs['tick_size'])

    output['lines'].append(
        svgwrite.shapes.Line(*pointlocalizer(loc, [scl(p0), scl(p25)])))
    output['lines'].append(
        svgwrite.shapes.Line(*pointlocalizer(loc+offset, [scl(p25), scl(p50)]))
    )
    output['lines'].append(
        svgwrite.shapes.Line(*pointlocalizer(loc+offset, [scl(p50), scl(p75)]))
    )
    output['lines'].append(
        svgwrite.shapes.Line(*pointlocalizer(loc, [scl(p75), scl(p100)])))

    ticks = [p0, p25, p50, p75, p100]
    ticks = {tick: ticklabelformat.format(tick) for tick in ticks}
    output['ticklabels'] = create_ticklabels(ticks, scl,
                                             tick_label_loc)

    if 'label' in specs:
        output['label'].append(create_label(specs['label'],
                                            ticks,
                                            scl,
                                            label_loc))

    return output


def set_general_defaults(general_spec, scl):
    d = {
        'tick_size': scl(0) - scl(.01*scl.data_len),
        'ticklabelformat': '{:.2f}'
    }
    d.update(general_spec)
    return d


def create_ticklabels(ticks, scl, label_loc):
    output = []
    for tick, ticklabel in ticks.items():
        output.append(
            svgwrite.text.Text(ticklabel,
                               insert=label_loc(scl(tick))))
    return output


def get_ticks(scl, nticks):
    return [scl.data_0 + scl.data_len*loc/(nticks-1)
            for loc in range(nticks)]


def create_label(label, ticks, scl, label_loc):
    mticks = scl(functools.reduce(operator.add, ticks)/len(ticks))
    return svgwrite.text.Text(label, insert=label_loc(mticks))


def makeaxis(direction, scl, ticks, loc, specs):
    ts = specs['tick_size']
    ticklabelformat = specs['ticklabelformat']
    if isinstance(ticks, (int, float)):
        ticks = get_ticks(scl, ticks)
        ticks = {tick: ticklabelformat.format(tick) for tick in ticks}
    elif isinstance(ticks, collections.Sequence):
        ticks = {tick: ticklabelformat.format(tick) for tick in ticks}
    elif isinstance(ticks, dict):
        pass
    else:
        raise ValueError('Invalid argument "ticks": {}'.format(ticks))

    output = ElementsCollection()

    if direction == 'vertical':
        axpoint = utils.partialpoint(x=loc)
        ticpoints = functools.partial(utils.hpoints, locations=[loc, loc+ts])
        tick_labl_loc = utils.partialpoint(x=loc+2*ts)
        label_loc = utils.partialpoint(x=loc+5*ts)
    else:
        axpoint = utils.partialpoint(y=loc)
        ticpoints = functools.partial(utils.vpoints, locations=[loc, loc+ts])
        tick_labl_loc = utils.partialpoint(y=loc+2*ts)
        label_loc = utils.partialpoint(y=loc+5*ts)

    output['line'].append(svgwrite.shapes.Line(axpoint(scl(min(ticks))),
                                               axpoint(scl(max(ticks)))))
    if 'label' in specs:
        output['label'].append(create_label(specs['label'],
                                            ticks,
                                            scl,
                                            label_loc))

    for tick in ticks:
        output['ticks'].append(svgwrite.shapes.Line(*ticpoints(scl(tick))))

    output['ticklabels'] = create_ticklabels(
        ticks, scl, tick_labl_loc)

    return output
