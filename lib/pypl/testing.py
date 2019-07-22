import unittest


class svgTest(unittest.TestCase):

    def assert_numeric_attributes(self, svg_element, attributes):
        for att in attributes:
            self.check_numeric(svg_element.attribs[att])

    def assert_numeric_paths(self, svg_element, attributes):
        for att in attributes:
            svg_element.tostring()  # needed to instantiate the attributes
            pathdef = svg_element.attribs[att]
            self.assertIsInstance(pathdef, str)
            points = pathdef.split(' ')
            for point in points:
                x, y = point.split(',')
                self.check_numeric(x)
                self.check_numeric(y)

    def check_numeric(self, val):
        if isinstance(val, str):
            try:
                val = float(val)
            except ValueError:
                # in this case it will fail more meaningfully on next line
                pass
        self.assertIsInstance(val, (int, float))
