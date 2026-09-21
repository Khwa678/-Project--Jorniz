"""Administrator-facing post management feature."""

from .routes import create_posts_blueprint
from .service import AdminPostDependencies

__all__ = ["AdminPostDependencies", "create_posts_blueprint"]
