from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # UUID как string
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    started_at = db.Column(db.Integer, nullable=False)  # timestamp
    completed_at = db.Column(db.Integer, nullable=True)
    deadline_at = db.Column(db.Integer, nullable=False)
    order = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref='tasks')