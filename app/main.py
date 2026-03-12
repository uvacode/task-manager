from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from .models import db
from .database import get_user_tasks, create_task, update_task, delete_task, organize_tasks
from .schemas import TaskCreate, TaskUpdate
from uuid import uuid4

app = Flask(__name__, static_folder='static')
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Создаём базу при первом запуске
with app.app_context():
    db.create_all()

# Для теста — фиксированный user_id=1
USER_ID = 1

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    organize_tasks(USER_ID)  # автоочистка при запросе
    tasks = get_user_tasks(USER_ID)
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create():
    data = request.json
    task_data = TaskCreate(**data).dict()
    task = create_task(USER_ID, task_data)
    return jsonify(task), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update(task_id):
    data = request.json
    fields = TaskUpdate(**data).dict(exclude_unset=True)
    updated = update_task(USER_ID, task_id, fields)
    if not updated:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(updated)

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete(task_id):
    if delete_task(USER_ID, task_id):
        return jsonify({"success": True})
    return jsonify({"error": "Task not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)