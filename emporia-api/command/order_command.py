# emporia-api/patterns/command/order_command.py
from abc import ABC, abstractmethod

class OrderCommand(ABC):
    """Base command interface for order operations"""
    
    @abstractmethod
    def execute(self):
        """Execute the command"""
        pass
        
    @abstractmethod
    def undo(self):
        """Undo the command execution (for rollback purposes)"""
        pass