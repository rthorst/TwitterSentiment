from . import utils


class ContinuousScale(object):

    def __init__(self, data_lim, svg_lim):
        self.data_0 = data_lim[0]
        self.data_len = utils.lims2len(data_lim)
        self.svg_0 = svg_lim[0]
        self.svg_len = utils.lims2len(svg_lim)

    def __call__(self, value):
        return self.svg_0 + self.svg_len*(value - self.data_0)/self.data_len


class CategoricalScale(object):

    def __init__(self, data, svg_lim):
        self.data_0 = 0
        self.data_len = len(set(data))
        self.svg_0 = svg_lim[0]
        self.svg_len = utils.lims2len(svg_lim)
        s = ContinuousScale((0, self.data_len-1), svg_lim)
        self.lookup = {val: s(i) for i, val in enumerate(set(data))}

    def __call__(self, value):
        return self.lookup[value]
