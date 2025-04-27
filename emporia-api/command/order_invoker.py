# emporia-api/patterns/command/order_invoker.py
class OrderInvoker:
    """Invoker class that executes order commands"""
    
    def __init__(self):
        self.command_history = []
        
    def execute_command(self, command):
        """Execute a command and store it in history"""
        try:
            result = command.execute()
            self.command_history.append(command)
            return result
        except Exception as e:
            # If execution fails, rollback previous commands
            self.rollback()
            raise e
    
    def execute_commands(self, commands):
        """Execute a sequence of commands"""
        results = []
        for command in commands:
            results.append(self.execute_command(command))
        return results
            
    def rollback(self):
        """Undo all executed commands in reverse order"""
        # Reverse the history to undo in LIFO order
        for command in reversed(self.command_history):
            command.undo()
        self.command_history.clear()