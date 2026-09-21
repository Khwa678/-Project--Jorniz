"""Administrator-facing HU Coin reward management."""

from .routes import create_rewards_blueprint
from .service import AdminRewardDependencies

__all__ = ["AdminRewardDependencies", "create_rewards_blueprint"]
