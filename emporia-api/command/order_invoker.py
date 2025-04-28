# emporia-api/patterns/command/order_invoker.py
class OrderInvoker:

    def __init__(self):
        self.command_history = []

    def execute_command(self, command):

        try:
            result = command.execute()
            self.command_history.append(command)
            return result
        except Exception as e:
            # If execution fails, rollback previous commands
            self.rollback()
            raise e

    def execute_commands(self, commands):

        results = []
        for command in commands:
            results.append(self.execute_command(command))
        return results

    def rollback(self):

        # Reverse the history to undo in LIFO order
        for command in reversed(self.command_history):
            command.undo()
        self.command_history.clear()
