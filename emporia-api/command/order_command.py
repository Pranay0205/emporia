# emporia-api/patterns/command/order_command.py
from abc import ABC, abstractmethod


class OrderCommand(ABC):

    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def undo(self):
        pass
