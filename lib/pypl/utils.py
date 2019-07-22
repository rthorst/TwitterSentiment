
def lims2len(lims):
    return lims[1] - lims[0]


def prctiles(data, p=(0, .25, .5, .75, 1)):
    n = len(data)
    indices = (int((n-1)*p_) for p_ in sorted(p))
    sdata = list(sorted(data))
    return [sdata[i] for i in indices]


def clip(data, scl):
    mn, mx = scl.data_0, scl.data_0+scl.data_len
    return [min(max(p, mn), mx) for p in data]


def hpoints(vpos, locations):
    return [(loc, vpos) for loc in locations]


def vpoints(hpos, locations):
    return [(hpos, loc) for loc in locations]


def partialpoint(x=None, y=None):

    if x is None and y is not None:

        def mkpoint(other):
            return (other, y)

    elif x is not None and y is None:

        def mkpoint(other):
            return (x, other)

    else:

        mkpoint = partialpoint

    return mkpoint
