import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../services/api";

interface Todo {
  _id: string;
  text: string;
  scheduledTime: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

export default function TodoPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [now, setNow] = useState(new Date());

  // Live clock (for countdown)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load todos
  const loadTodos = async () => {
    try {
      const res = await API.get("/todo/list");

      const sorted = res.data.sort(
        (a: Todo, b: Todo) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      );

      setTodos(sorted);
    } catch {
      console.log("Failed to load todos");
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  // Create todo
  const createTodo = async () => {
    if (!text.trim() || !date || !timeInput) return;

    try {
      const scheduledTime = `${date}T${timeInput}`;

      await API.post("/todo/create", {
        text,
        scheduledTime,
        priority,
      });

      setText("");
      setDate("");
      setTimeInput("");
      setPriority("medium");

      loadTodos();
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  // Toggle
  const toggleTodo = async (id: string) => {
    const previous = [...todos];

    setTodos((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, completed: !t.completed } : t
      )
    );

    try {
      const res = await API.patch(`/todo/${id}/toggle`);
      const updated = res.data;

      setTodos((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, completed: updated.completed } : t
        )
      );
    } catch {
      setTodos(previous);
    }
  };

  // Delete
  const deleteTodo = async (id: string) => {
    await API.delete(`/todo/${id}`);
    loadTodos();
  };

  // Grouping (FIXED)
  const groupTodos = () => {
    const todayStr = now.toDateString();

    const overdue: Todo[] = [];
    const today: Todo[] = [];
    const upcoming: Todo[] = [];

    todos.forEach((todo) => {
      if (todo.completed) return;

      const taskDate = new Date(todo.scheduledTime);
      const isToday = taskDate.toDateString() === todayStr;

      if (isToday) {
        today.push(todo);
      } else if (taskDate < now) {
        overdue.push(todo);
      } else {
        upcoming.push(todo);
      }
    });

    return { overdue, today, upcoming };
  };

  const { overdue, today, upcoming } = groupTodos();

  return (
    <div className="space-y-8 text-neutral-100">

      {/* Header */}
      <div>
        <button 
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        <h1 className="text-2xl font-bold text-white">To-Do List</h1>
      </div>

      {/* ADD TASK */}
      <div className="bg-neutral-900 border border-neutral-700 p-6 space-y-4">

        <input
          type="text"
          placeholder="What do you want to do?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm"
        />

        <div className="flex gap-4">

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm"
          />

          <input
            type="time"
            value={timeInput}
            onChange={(e) => setTimeInput(e.target.value)}
            className="flex-1 bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "low" | "medium" | "high")
            }
            className="bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

        </div>

        <button
          onClick={createTodo}
          disabled={!text.trim() || !date || !timeInput}
          className={`px-6 py-2 text-sm ${
            !text.trim() || !date || !timeInput
              ? "bg-neutral-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Add Task
        </button>

      </div>

      {/* LIST */}
      <div className="space-y-4">

        {overdue.length > 0 && (
          <Section
            title="🔥 Overdue"
            color="text-red-400"
            todos={overdue}
            {...{ toggleTodo, deleteTodo, now }}
          />
        )}

        {today.length > 0 && (
          <Section
            title="📅 Today"
            color="text-blue-400"
            todos={today}
            {...{ toggleTodo, deleteTodo, now }}
          />
        )}

        {upcoming.length > 0 && (
          <Section
            title="⏳ Upcoming"
            color="text-neutral-300"
            todos={upcoming}
            {...{ toggleTodo, deleteTodo, now }}
          />
        )}

        {todos.some((t) => t.completed) && (
          <Section
            title="✅ Completed"
            color="text-green-400"
            todos={todos.filter((t) => t.completed)}
            {...{ toggleTodo, deleteTodo, now }}
          />
        )}

      </div>
    </div>
  );
}

// SECTION
function Section({
  title,
  color,
  todos,
  toggleTodo,
  deleteTodo,
  now,
}: {
  title: string;
  color: string;
  todos: Todo[];
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  now: Date;
}) {
  const sorted = [...todos].sort(
    (a, b) =>
      new Date(a.scheduledTime).getTime() -
      new Date(b.scheduledTime).getTime()
  );

  return (
    <div className="space-y-3">
      <h2 className={`text-sm ${color}`}>{title}</h2>

      {sorted.map((todo) => (
        <TodoItem
          key={todo._id}
          {...{ todo, toggleTodo, deleteTodo, now }}
        />
      ))}
    </div>
  );
}

// ITEM
function TodoItem({
  todo,
  toggleTodo,
  deleteTodo,
  now,
}: {
  todo: Todo;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  now: Date;
}) {
  const taskDate = new Date(todo.scheduledTime);
  const diff = taskDate.getTime() - now.getTime();

  let timeText =
    diff <= 0
      ? "Overdue"
      : diff < 3600000
      ? `Due in ${Math.floor(diff / 60000)}m`
      : `Due in ${Math.floor(diff / 3600000)}h`;

  const isUrgent = !todo.completed && diff < 2 * 60 * 60 * 1000;
  const isVeryUrgent = !todo.completed && diff < 30 * 60 * 1000;

  return (
    <div className="flex justify-between bg-neutral-900 border border-neutral-700 px-4 py-3 hover:border-neutral-500 transition">

      <div className="flex gap-4">

        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo._id)}
          className="w-4 h-4 accent-blue-600"
        />

        <div>

          {/* PRIORITY */}
          <div className="text-xs font-medium">
            {todo.priority === "high" && <span className="text-red-400">● High</span>}
            {todo.priority === "medium" && <span className="text-yellow-400">● Medium</span>}
            {todo.priority === "low" && <span className="text-gray-400">● Low</span>}
          </div>

          <div
            className={`text-sm ${
              todo.completed
                ? "line-through text-neutral-500 opacity-60"
                : isUrgent
                ? "text-red-400"
                : "text-neutral-200"
            }`}
          >
            {todo.text}
          </div>

          <div className="text-xs text-neutral-400 flex gap-2">
            <span>{taskDate.toLocaleString()}</span>

            {!todo.completed && (
              <span
                className={
                  timeText === "Overdue"
                    ? "text-red-500"
                    : isVeryUrgent
                    ? "text-red-400 font-semibold"
                    : "text-yellow-400"
                }
              >
                • {timeText}
              </span>
            )}
          </div>

        </div>
      </div>

      <button
        onClick={() => {
          if (window.confirm("Delete this task?")) {
            deleteTodo(todo._id);
          }
        }}
        className="text-red-400 text-xs hover:text-red-600"
      >
        Delete
      </button>
    </div>
  );
}