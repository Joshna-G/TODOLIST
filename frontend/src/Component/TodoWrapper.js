import React, { useState, useEffect } from "react";
import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { v4 as uuidv4 } from "uuid";
import { EditTodoForm } from "./EditTodoForm";

export const TodoWrapper = ({ useBackend = false }) => {
  const [todos, setTodos] = useState([]);

  // Fetch todos from backend/localStorage on mount
  useEffect(() => {
    if (useBackend) {
      fetchTodos();
    } else {
      const savedTodos = localStorage.getItem("todos");
      if (savedTodos) setTodos(JSON.parse(savedTodos));
    }
  }, [useBackend]);

  // Fetch todos from backend
  const fetchTodos = async () => {
    try {
      const response = await fetch("http://localhost:5000/tasks");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add todo
  const addTodo = async (task) => {
    if (!task.trim()) return;

    try {
        const response = await fetch("http://localhost:5000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task }),
        });

        const addedTodo = await response.json();
        setTodos([...todos, addedTodo]);
    } catch (error) {
        console.error("Error adding todo:", error);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await fetch(`http://localhost:5000/tasks/${id}`, { method: "DELETE" });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Toggle completion
  const toggleComplete = async (id) => {
    const updatedTodo = todos.find((todo) => todo.id === id);
    if (!updatedTodo) return;

    const newTodo = { ...updatedTodo, completed: !updatedTodo.completed };

    try {
        await fetch(`http://localhost:5000/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
        });

        setTodos(todos.map((todo) => (todo.id === id ? newTodo : todo)));
    } catch (error) {
        console.error("Error updating todo:", error);
    }
  };

  // Edit todo
  const editTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  const editTask = async (task, id) => {
    if (!task.trim()) return;
    const updatedTodo = { ...todos.find((todo) => todo.id === id), task, isEditing: false };

    try {
        await fetch(`http://localhost:5000/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTodo),
        });

        setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
        console.error("Error updating todo:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10"></div>
          <h1 className="text-3xl font-bold relative z-10 flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              Get Things Done!
            </span>
          </h1>
          <p className="text-sm text-purple-100 mt-1 relative z-10">
            {todos.filter(t => !t.completed).length} pending tasks
          </p>
        </div>
  
        <div className="p-6">
          <TodoForm addTodo={addTodo} />
          
          <div className="mt-6 space-y-3">
            {todos.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-5xl mb-2">📝</div>
                <p>Your todo list is empty!</p>
                <p className="text-sm mt-1">Add your first task above</p>
              </div>
            )}
  
            {todos.map((todo) => (
              <div 
                key={todo.id}
                className={`relative group transition-all duration-200 ${
                  todo.isEditing 
                    ? 'bg-indigo-50 border-l-4 border-indigo-400' 
                    : todo.completed 
                      ? 'bg-green-50/80 border-l-4 border-green-400'
                      : 'bg-white border-l-4 border-blue-400 hover:bg-gray-50'
                } rounded-lg p-4 shadow-sm hover:shadow-md`}
              >
                {todo.isEditing ? (
                  <EditTodoForm editTodo={editTask} task={todo} />
                ) : (
                  <Todo
                    task={todo}
                    deleteTodo={deleteTodo}
                    editTodo={editTodo}
                    toggleComplete={toggleComplete}
                  />
                )}
  
                <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ${
                  todo.isEditing ? '' : 'group-hover:bg-black/5'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
  
        <div className="bg-white/50 border-t border-white/30 p-4 text-center text-xs text-gray-500 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <span>
              {todos.length} total • {todos.filter(t => t.completed).length} completed
            </span>
            <span className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-1 ${
                useBackend ? 'bg-green-500' : 'bg-blue-500'
              }`}></span>
              {useBackend ? 'Cloud Mode' : 'Local Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}