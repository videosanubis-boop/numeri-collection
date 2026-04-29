from typing import override


class ServiceError(BaseException):
  def __init__(self, service: str, message: str):
    self.service: str = service
    self.message: str = message
    super().__init__(self.message)

  @override
  def __str__(self):
    return f"{self.service}: {self.message}"
