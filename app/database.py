from .models import db, User, Task
from uuid import uuid4
from .schemas import Task as TaskSchema, TaskUpdate

def get_user_tasks(user_id: int):
    tasks = Task.query.filter_by(user_id=user_id).all()
    return {t.id: TaskSchema.from_orm(t).dict() for t in tasks}

def create_task(user_id: int, task_data: dict):
    task = Task(
        id=str(uuid4()),
        user_id=user_id,
        **task_data
    )
    db.session.add(task)
    db.session.commit()
    return TaskSchema.from_orm(task).dict()

def update_task(user_id: int, task_id: str, fields: dict):
    task = Task.query.filter_by(user_id=user_id, id=task_id).first()
    if not task:
        return None
    for key, value in fields.items():
        setattr(task, key, value)
    db.session.commit()
    return TaskSchema.from_orm(task).dict()

def delete_task(user_id: int, task_id: str):
    task = Task.query.filter_by(user_id=user_id, id=task_id).first()
    if task:
        db.session.delete(task)
        db.session.commit()
        return True
    return False

def organize_tasks(user_id: int):
    # Автоочистка старых завершённых (аналог organizeTasks)
    now = int(datetime.utcnow().timestamp())
    week_ago = now - 7 * 24 * 3600
    tasks = Task.query.filter_by(user_id=user_id).all()
    changed = False
    for task in tasks:
        if task.completed_at and task.completed_at < week_ago:
            db.session.delete(task)
            changed = True
    if changed:
        db.session.commit()
    return changed