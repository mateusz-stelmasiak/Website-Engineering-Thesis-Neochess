import jwt
from time import time

from flask import url_for


class ResetPasswordService:
    def __init__(self, key, username=None):
        if username is not None:
            self.username = username

        self.key = key

    def __get_reset_token(self, expires=500):
        return jwt.encode({
            'reset_password': self.username,
            'exp': time() + expires
        }, key=self.key)

    def get_url_for_password_reset(self):
        return url_for(
            'app_routes.reset_verified',
            user=self.username,
            token=self.__get_reset_token(),
            _external=True
        )

    def verify_reset_token(self, token):
        try:
            username = jwt.decode(token, key=self.key)['reset_password']
        except Exception as ex:
            print(ex)
            return

        return username
