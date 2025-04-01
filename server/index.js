import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Poornima@24",
    database: "dummy",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Initialize Database
async function initializeDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id VARCHAR(36) PRIMARY KEY,
                task VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                isEditing BOOLEAN DEFAULT FALSE
            )
        `);
        console.log(" Database initialized");
    } catch (err) {
        console.error(" Database initialization failed:", err);
    }
}
initializeDB();

// Get all tasks
app.get("/tasks", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM tasks");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new task
app.post("/tasks", async (req, res) => {
    const { task } = req.body;
    if (!task?.trim()) return res.status(400).json({ error: "Task cannot be empty" });

    const id = uuidv4();
    try {
        await pool.query(
            "INSERT INTO tasks (id, task, completed, isEditing) VALUES (?, ?, ?, ?)",
            [id, task, false, false]
        );
        res.json({ id, task, completed: false, isEditing: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update task
app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { task, completed, isEditing } = req.body;

    console.log(" Update Request Received for ID:", id);
    console.log("🔹 Updated Data:", { task, completed, isEditing });

    try {
        const [result] = await pool.query(
            "UPDATE tasks SET task = ?, completed = ?, isEditing = ? WHERE id = ?",
            [task, completed, isEditing, id]
        );

        if (result.affectedRows === 0) {
            console.log(" Task not found in DB");
            return res.status(404).json({ error: "Task not found" });
        }

        console.log(" Task Updated Successfully");
        res.json({ message: "Task updated" });
    } catch (err) {
        console.error(" Update Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
