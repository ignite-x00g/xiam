from user import User

class Group:
    def __init__(self, name):
        self.name = name
        self.users = []

    def add_user(self, user):
        if isinstance(user, User):
            self.users.append(user)
        else:
            raise TypeError("Only User objects can be added to a group.")

    def remove_user(self, user):
        if isinstance(user, User):
            if user in self.users:
                self.users.remove(user)
        else:
            raise TypeError("Only User objects can be removed from a group.")

    def find_user(self, username):
        for user in self.users:
            if user.get_name() == username:
                return user
        return None

    def get_members(self):
        return [user.get_name() for user in self.users]

    def get_name(self):
        return self.name
