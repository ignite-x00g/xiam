import unittest
from user import User

class TestUser(unittest.TestCase):
    def test_user_creation_and_get_name(self):
        """Test that a User object is created correctly and get_name returns the correct name."""
        user = User("testuser")
        self.assertEqual(user.get_name(), "testuser")

if __name__ == '__main__':
    unittest.main()
