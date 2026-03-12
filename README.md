# Task Manager

A clean, dark-themed task manager with categories **TODAY / TOMORROW / NEXT WEEK**, checkboxes, drag-and-drop reordering, inline editing, deletion, and browser localStorage persistence.

<div align="center">
  <p><strong>Main View</strong></p>
  <img src="screenshots/main-view.png" alt="Main View" width="800"/>
  <br><br>
  <p><strong>Completed Tasks</strong></p>
  <img src="screenshots/completed.png" alt="Completed Tasks" width="800"/>
</div>

## Features

- Dark modern UI with sidebar navigation  
- Task categories: TODAY, TOMORROW, NEXT WEEK  
- Progress overview for "This week" and "Next week" with dots  
- Inline task creation (Enter to add next, Escape/Blur to finish)  
- Checkboxes with strikethrough for completed tasks  
- Double-click to edit task names  
- Delete tasks  
- Drag-and-drop to reorder or move tasks between days  
- Automatic cleanup of completed tasks older than one week  
- All data saved in browser localStorage (no backend needed)

## How to Run

1. Install Python 3.8+ → https://www.python.org  
2. Navigate to the project folder:

   ```bash
   cd task_manager/app

Install dependencies:Bashpip install flask flask-cors
Run the server:Bashpython main.py
Open in browser: http://127.0.0.1:5000

Running on Another Computer

Copy the entire task_manager folder
Install Python (3.8+)
Install dependencies:Bashpip install flask flask-cors
Run the server:Bashcd app
python main.py
Open in browser: http://127.0.0.1:5000

Tech Stack

Backend: Flask (Python)
Frontend: HTML + CSS + Vanilla JavaScript
Drag-and-drop: SortableJS (CDN)
Icons: Font Awesome (CDN)

License
MIT License — feel free to use, modify, and share.
Made with ❤️ by @uvacode
