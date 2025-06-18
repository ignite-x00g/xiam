import unittest
from group import Group
from user import User

class TestGroup(unittest.TestCase):
    def setUp(self):
        """Set up for test methods."""
        self.group_name = "testgroup"
        self.group = Group(self.group_name)
        self.user1 = User("user1")
        self.user2 = User("user2")

    def test_group_creation_and_get_name(self):
        """Test that a Group object is created correctly and get_name returns the correct name."""
        self.assertEqual(self.group.get_name(), self.group_name)

    def test_add_user(self):
        """Test adding a user to the group."""
        self.group.add_user(self.user1)
        self.assertIn(self.user1, self.group.users)
        self.assertEqual(len(self.group.users), 1)

    def test_add_multiple_users(self):
        """Test adding multiple users to the group."""
        self.group.add_user(self.user1)
        self.group.add_user(self.user2)
        self.assertIn(self.user1, self.group.users)
        self.assertIn(self.user2, self.group.users)
        self.assertEqual(len(self.group.users), 2)

    def test_add_non_user_object(self):
        """Test that adding a non-User object raises a TypeError."""
        with self.assertRaises(TypeError):
            self.group.add_user("not_a_user_object")

    def test_remove_user(self):
        """Test removing a user from the group."""
        self.group.add_user(self.user1)
        self.group.add_user(self.user2)
        self.group.remove_user(self.user1)
        self.assertNotIn(self.user1, self.group.users)
        self.assertIn(self.user2, self.group.users)
        self.assertEqual(len(self.group.users), 1)

    def test_remove_user_not_in_group(self):
        """Test removing a user that is not in the group does nothing to the list."""
        self.group.add_user(self.user1)
        # user3 is not added to the group
        user3 = User("user3")
        self.group.remove_user(user3)
        self.assertIn(self.user1, self.group.users)
        self.assertEqual(len(self.group.users), 1)


    def test_remove_non_user_object(self):
        """Test that removing a non-User object raises a TypeError."""
        self.group.add_user(self.user1)
        with self.assertRaises(TypeError):
            self.group.remove_user("not_a_user_object")

    def test_find_user(self):
        """Test finding a user in the group by username."""
        self.group.add_user(self.user1)
        self.group.add_user(self.user2)
        found_user = self.group.find_user("user1")
        self.assertEqual(found_user, self.user1)

    def test_find_user_not_in_group(self):
        """Test finding a user that is not in the group returns None."""
        self.group.add_user(self.user1)
        found_user = self.group.find_user("user3")
        self.assertIsNone(found_user)

    def test_get_members(self):
        """Test getting a list of member usernames."""
        self.group.add_user(self.user1)
        self.group.add_user(self.user2)
        members = self.group.get_members()
        self.assertIn("user1", members)
        self.assertIn("user2", members)
        self.assertEqual(len(members), 2)
        self.assertIsInstance(members, list)

    def test_get_members_empty_group(self):
        """Test getting members from an empty group returns an empty list."""
        members = self.group.get_members()
        self.assertEqual(members, [])
        self.assertIsInstance(members, list)

if __name__ == '__main__':
    unittest.main()
