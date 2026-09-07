"""Signup and login feature module."""

from .routes import create_auth_blueprint
from .service import AuthDependencies

__all__ = ["AuthDependencies", "create_auth_blueprint"]
