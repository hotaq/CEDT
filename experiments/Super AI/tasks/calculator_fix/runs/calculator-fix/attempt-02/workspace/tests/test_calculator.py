import unittest

from calculator import sum_numbers


class CalculatorTests(unittest.TestCase):
    def test_empty_list(self):
        self.assertEqual(sum_numbers([]), 0)

    def test_multiple_values(self):
        self.assertEqual(sum_numbers([1, 2, 3]), 6)


if __name__ == "__main__":
    unittest.main()
