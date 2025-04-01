import datetime


class Order:

    def __init__(self, order_id: int, customer_id: int, product_list: list, amount: int, status: str, date: datetime):
        self.order_id = order_id
        self.customer_id = customer_id
        self.product_list = product_list
        self.amount = amount
        self.status = status
        self.date = date

    def __str__(self):
        return f"Order(order_id={self.order_id}, customer_id={self.customer_id}, product_list={self.product_list}, amount={self.amount}, status={self.status}, date={self.date})"
