"""Disposable synthetic SQL fixtures; deliberately NOT a MariaDB acceptance test."""
import sqlite3
import unittest

class SqlFixtureTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.executescript('''
            CREATE TABLE items (id INTEGER PRIMARY KEY, price_cents INTEGER NOT NULL CHECK(price_cents >= 0));
            CREATE TABLE orders (id INTEGER PRIMARY KEY, item_id INTEGER NOT NULL REFERENCES items(id),
                                 qty INTEGER NOT NULL CHECK(qty > 0));
            INSERT INTO items(id,price_cents) VALUES (1,2300);
        ''')

    def tearDown(self):
        self.db.close()

    def test_total_price(self):
        self.db.execute('INSERT INTO orders(item_id, qty) VALUES (?,?)', (1, 3))
        value = self.db.execute('SELECT SUM(i.price_cents * o.qty) FROM orders o JOIN items i ON i.id=o.item_id').fetchone()[0]
        self.assertEqual(value, 6900)

    def test_invalid_qty_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('INSERT INTO orders(item_id, qty) VALUES (?,?)', (1, -1))

    def test_foreign_key_rejected(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute('INSERT INTO orders(item_id, qty) VALUES (?,?)', (99, 1))

if __name__ == '__main__':
    unittest.main(verbosity=2)
