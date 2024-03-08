import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../model/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent implements OnInit{
  todolist = signal<TodoModel[]>([]);

  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()));
    });
  }
  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage));
    }
  }


  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }

  addTodo() {
    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prev_todos) => {
        return [
          ...prev_todos,
          { id: Date.now(), title: newTodoTitle, completed: false },
        ];
      });
      this.newTodo.reset();
    } else {
      this.newTodo.reset();
    }
  }
  toggleTodo(todoId: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, completed: !todo.completed };
        }
        return { ...todo, editing: false };
      })
    );
  }

  removeTodo(todoId: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.filter((todo) => todo.id !== todoId)
    );
  }
  updateTodoEditingMode(todoId: number) {
    return this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, editing: true };
        }
        return { ...todo, editing: false };
      })
    );
  }
  saveTitleTodo(todoId: number, event: Event) {
    const title = (event.target as HTMLInputElement).value.trim();
    return this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, title: title, editing: false };
        }
        return todo;
      })
    );
  }
}
