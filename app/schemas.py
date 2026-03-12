from pydantic import BaseModel
from typing import Optional

class TaskBase(BaseModel):
    name: str
    started_at: int
    deadline_at: int
    order: int

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    completed_at: Optional[int] = None
    deadline_at: Optional[int] = None
    order: Optional[int] = None

class Task(TaskBase):
    id: str
    completed_at: Optional[int] = None

    class Config:
        from_attributes = True