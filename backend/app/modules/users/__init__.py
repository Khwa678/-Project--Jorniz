"""Administrator-facing user management feature."""

from .routes import create_users_blueprint
from .service import UserManagementDependencies

__all__ = ["UserManagementDependencies", "create_users_blueprint"]
