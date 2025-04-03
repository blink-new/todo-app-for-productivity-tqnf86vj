
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoStore, Todo } from './types';

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      focusMode: false,
      currentTodo: null,
      timer: {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      },
      timerInterval: null,
    }),
    {
      name: 'todo-storage',
    }
  )
);

export const todoActions = {
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      focusHistory: [],
    };
    
    useTodoStore.setState((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },
  
  toggleTodo: (id: string) => {
    const state = useTodoStore.getState();
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const newTodos = state.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    const updates: Partial<TodoStore> = {
      todos: newTodos,
    };

    if (state.currentTodo?.id === id && !todo.completed) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      updates.focusMode = false;
      updates.currentTodo = null;
      updates.timer = {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      };
      updates.timerInterval = null;
    }

    useTodoStore.setState(updates);
  },

  deleteTodo: (id: string) => {
    const state = useTodoStore.getState();
    const updates: Partial<TodoStore> = {
      todos: state.todos.filter((todo) => todo.id !== id),
    };

    if (state.currentTodo?.id === id) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      updates.focusMode = false;
      updates.currentTodo = null;
      updates.timer = {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      };
      updates.timerInterval = null;
    }

    useTodoStore.setState(updates);
  },

  toggleFocusMode: (todoId?: string) => {
    const state = useTodoStore.getState();
    
    if (!state.focusMode) {
      const targetTodo = todoId 
        ? state.todos.find(t => t.id === todoId && !t.completed)
        : state.todos.find(t => !t.completed);
      
      if (!targetTodo) return;
      
      useTodoStore.setState({
        focusMode: true,
        currentTodo: targetTodo,
        timer: {
          isRunning: false,
          timeLeft: 25 * 60,
          duration: 25 * 60,
        },
      });
    } else {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      useTodoStore.setState({
        focusMode: false,
        currentTodo: null,
        timer: {
          isRunning: false,
          timeLeft: 25 * 60,
          duration: 25 * 60,
        },
        timerInterval: null,
      });
    }
  },

  startTimer: () => {
    const state = useTodoStore.getState();
    if (!state.currentTodo || state.timer.isRunning || state.timer.timeLeft === 0) return;
    
    const interval = setInterval(() => {
      const currentState = useTodoStore.getState();
      if (!currentState.timer.isRunning || currentState.timer.timeLeft <= 0) {
        if (currentState.timerInterval) {
          clearInterval(currentState.timerInterval);
        }
        useTodoStore.setState({ timerInterval: null });
        return;
      }

      const newTimeLeft = currentState.timer.timeLeft - 1;
      const updates: Partial<TodoStore> = {
        timer: {
          ...currentState.timer,
          timeLeft: newTimeLeft,
        },
      };

      if (newTimeLeft === 0 && currentState.currentTodo) {
        const updatedTodos = currentState.todos.map(todo => {
          if (todo.id === currentState.currentTodo?.id) {
            return {
              ...todo,
              focusHistory: [
                ...(todo.focusHistory || []),
                {
                  startTime: new Date(Date.now() - currentState.timer.duration * 1000).toISOString(),
                  duration: currentState.timer.duration / 60,
                },
              ],
            };
          }
          return todo;
        });
        
        updates.todos = updatedTodos;
        updates.timer = {
          ...currentState.timer,
          isRunning: false,
          timeLeft: newTimeLeft,
        };
        clearInterval(currentState.timerInterval);
        updates.timerInterval = null;
      }
      
      useTodoStore.setState(updates);
    }, 1000);

    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: true,
      },
      timerInterval: interval,
    });
  },

  pauseTimer: () => {
    const state = useTodoStore.getState();
    if (!state.timer.isRunning) return;
    
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: false,
      },
      timerInterval: null,
    });
  },

  resetTimer: () => {
    const state = useTodoStore.getState();
    if (state.timer.timeLeft === state.timer.duration) return;
    
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: false,
        timeLeft: state.timer.duration,
      },
      timerInterval: null,
    });
  },

  setTimerDuration: (minutes: number) => {
    const state = useTodoStore.getState();
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }
    
    useTodoStore.setState({
      timer: {
        isRunning: false,
        timeLeft: minutes * 60,
        duration: minutes * 60,
      },
      timerInterval: null,
    });
  },
};