from flask import Flask, request, jsonify, render_template, url_for
import sqlite3
import bcrypt
import jwt
import datetime
from functools import wraps
from flask_cors import CORS
from jwt import ExpiredSignatureError, InvalidTokenError

app = Flask(__name__)
CORS(app)

SECRET_KEY = "supersecret"  # Change in production
DATABASE = "synergy.db"

# ==================== DB HELPERS ====================
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            createdBy INTEGER
        );

        CREATE TABLE IF NOT EXISTS project_members (
            projectId INTEGER,
            userId INTEGER,
            PRIMARY KEY (projectId, userId)
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectId INTEGER,
            title TEXT,
            description TEXT,
            assignedTo INTEGER,
            status TEXT DEFAULT 'To-Do',
            dueDate TEXT
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectId INTEGER,
            senderId INTEGER,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            message TEXT,
            read INTEGER DEFAULT 0
        );
        """)

init_db()

# ==================== AUTH MIDDLEWARE ====================
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            return jsonify({"error": "Token missing"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data
        except ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# ==================== AUTH ROUTES ====================
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username, password = data["username"], data["password"]
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    try:
        with get_db() as db:
            cur = db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed))
            db.commit()
            return jsonify({"id": cur.lastrowid, "username": username})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username exists"}), 400

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username, password = data["username"], data["password"]
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 400
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid password"}), 400
    token = jwt.encode(
        {"id": user["id"], "username": user["username"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        SECRET_KEY, algorithm="HS256"
    )
    return jsonify({"token": token})

# ==================== PROFILE ====================
@app.route("/api/profile", methods=["GET"])
@token_required
def profile(current_user):
    with get_db() as db:
        row = db.execute("SELECT id, username FROM users WHERE id = ?", (current_user["id"],)).fetchone()
    return jsonify(dict(row))

@app.route("/api/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    data = request.json or {}
    updates, params = [], []
    if "username" in data:
        updates.append("username = ?")
        params.append(data["username"])
    if "password" in data:
        hashed = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
        updates.append("password = ?")
        params.append(hashed)
    if not updates:
        return jsonify({"success": True})
    params.append(current_user["id"])
    with get_db() as db:
        db.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
        db.commit()
    return jsonify({"success": True})

# ==================== PROJECT MEMBERSHIP CHECK ====================
def is_member(user_id, project_id):
    with get_db() as db:
        row = db.execute("SELECT 1 FROM project_members WHERE projectId=? AND userId=?", (project_id, user_id)).fetchone()
    return row is not None

# ==================== PROJECTS ====================
@app.route("/api/projects", methods=["POST"])
@token_required
def create_project(current_user):
    data = request.json
    name, description = data.get("name"), data.get("description")
    if not name:
        return jsonify({"error": "Project name required"}), 400
    with get_db() as db:
        cur = db.execute("INSERT INTO projects (name, description, createdBy) VALUES (?, ?, ?)",
                         (name, description, current_user["id"]))
        project_id = cur.lastrowid
        db.execute("INSERT INTO project_members (projectId, userId) VALUES (?, ?)", (project_id, current_user["id"]))
        db.commit()
    return jsonify({"id": project_id, "name": name, "description": description})

@app.route("/api/projects", methods=["GET"])
@token_required
def get_projects(current_user):
    search = request.args.get("search")
    query = "SELECT p.* FROM projects p JOIN project_members pm ON p.id=pm.projectId WHERE pm.userId=?"
    params = [current_user["id"]]
    if search:
        query += " AND p.name LIKE ?"
        params.append(f"%{search}%")
    with get_db() as db:
        rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/projects/<int:project_id>", methods=["DELETE"])
@token_required
def delete_project(current_user, project_id):
    with get_db() as db:
        project = db.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        if project["createdBy"] != current_user["id"]:
            return jsonify({"error": "Only creator can delete"}), 403
        db.execute("DELETE FROM projects WHERE id=?", (project_id,))
        db.execute("DELETE FROM project_members WHERE projectId=?", (project_id,))
        db.execute("DELETE FROM tasks WHERE projectId=?", (project_id,))
        db.execute("DELETE FROM messages WHERE projectId=?", (project_id,))
        db.commit()
    return jsonify({"success": True})

# ==================== TASKS ====================
@app.route("/api/projects/<int:project_id>/tasks", methods=["POST"])
@token_required
def create_task(current_user, project_id):
    if not is_member(current_user["id"], project_id):
        return jsonify({"error": "Not a project member"}), 403
    data = request.json
    title = data.get("title")
    if not title:
        return jsonify({"error": "Task title required"}), 400
    description = data.get("description")
    assigned_to = data.get("assignedTo")
    status = data.get("status") or "To-Do"
    due_date = data.get("dueDate")
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO tasks (projectId, title, description, assignedTo, status, dueDate) VALUES (?, ?, ?, ?, ?, ?)",
            (project_id, title, description, assigned_to, status, due_date)
        )
        task_id = cur.lastrowid
        db.commit()
        if assigned_to:
            add_notification(assigned_to, f'A new task "{title}" has been assigned to you.')
    return jsonify({"id": task_id, "title": title, "description": description, "assignedTo": assigned_to, "status": status, "dueDate": due_date})

@app.route("/api/projects/<int:project_id>/tasks", methods=["GET"])
@token_required
def get_tasks(current_user, project_id):
    if not is_member(current_user["id"], project_id):
        return jsonify({"error": "Not a project member"}), 403
    assignee = request.args.get("assignee")
    status = request.args.get("status")
    due_date = request.args.get("dueDate")
    query = "SELECT * FROM tasks WHERE projectId=?"
    params = [project_id]
    if assignee:
        query += " AND assignedTo=?"
        params.append(assignee)
    if status:
        query += " AND status=?"
        params.append(status)
    if due_date:
        query += " AND dueDate=?"
        params.append(due_date)
    with get_db() as db:
        rows = db.execute(query, params).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
@token_required
def update_task(current_user, task_id):
    data = request.json or {}
    updates, params = [], []
    for key in ["status", "title", "description", "assignedTo", "dueDate"]:
        if key in data:
            updates.append(f"{key} = ?")
            params.append(data[key])
    if not updates:
        return jsonify({"success": True})
    params.append(task_id)
    with get_db() as db:
        db.execute(f"UPDATE tasks SET {', '.join(updates)} WHERE id=?", params)
        db.commit()
        if "status" in data:
            assignee = data.get("assignedTo")
            if assignee:
                add_notification(assignee, f'Task "{data.get("title","Updated")}" status updated to {data["status"]}.')
    return jsonify({"success": True})

@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@token_required
def delete_task(current_user, task_id):
    with get_db() as db:
        db.execute("DELETE FROM tasks WHERE id=?", (task_id,))
        db.commit()
    return jsonify({"success": True})

# ==================== MESSAGES ====================
@app.route("/api/projects/<int:project_id>/messages", methods=["POST"])
@token_required
def create_message(current_user, project_id):
    if not is_member(current_user["id"], project_id):
        return jsonify({"error": "Not a project member"}), 403
    data = request.json
    content = data.get("content")
    if not content:
        return jsonify({"error": "Message content required"}), 400
    with get_db() as db:
        cur = db.execute("INSERT INTO messages (projectId, senderId, content) VALUES (?, ?, ?)",
                         (project_id, current_user["id"], content))
        db.commit()
        msg_id = cur.lastrowid
    return jsonify({"id": msg_id, "projectId": project_id, "senderId": current_user["id"], "content": content})

@app.route("/api/projects/<int:project_id>/messages", methods=["GET"])
@token_required
def get_messages(current_user, project_id):
    if not is_member(current_user["id"], project_id):
        return jsonify({"error": "Not a project member"}), 403
    with get_db() as db:
        rows = db.execute("""
            SELECT m.*, u.username AS senderName
            FROM messages m
            JOIN users u ON u.id=m.senderId
            WHERE m.projectId=?
            ORDER BY m.timestamp ASC
        """, (project_id,)).fetchall()
    return jsonify([dict(r) for r in rows])

# ==================== NOTIFICATIONS ====================
def add_notification(user_id, message):
    with get_db() as db:
        db.execute("INSERT INTO notifications (userId, message) VALUES (?, ?)", (user_id, message))
        db.commit()

@app.route("/api/notifications", methods=["GET"])
@token_required
def get_notifications(current_user):
    with get_db() as db:
        rows = db.execute("SELECT * FROM notifications WHERE userId=?", (current_user["id"],)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/notifications/<int:notification_id>/read", methods=["PUT"])
@token_required
def mark_notification_read(current_user, notification_id):
    with get_db() as db:
        db.execute("UPDATE notifications SET read=1 WHERE id=? AND userId=?", (notification_id, current_user["id"]))
        db.commit()
    return jsonify({"success": True})

# ==================== FRONTEND ROUTES ====================
@app.route("/")
def index():
    return render_template("homepage.html")

@app.route("/homepage")
def homepage():
    return render_template("homepage.html")

@app.route("/allprojects")
def allprojects():
    return render_template("allprojects.html")

@app.route("/schedule")
def schedule():
    return render_template("schedule.html")

@app.route("/messages")
def messages():
    return render_template("messages.html")

@app.route("/aboutus")
def aboutus():
    return render_template("aboutus.html")

# ==================== RUN APP ====================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
