class Model {
    constructor() {
        this.todoS = [];
        this.filter = 0;
    }

    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback;
    }

    _commit(todoS) {
        this.onTodoListChanged(todoS);
    }

    addTodo(todoText) {
        const todo = {
            id:
                this.todoS.length > 0
                    ? this.todoS[this.todoS.length - 1].id + 1
                    : 0,
            text: todoText,
            complete: false
        };

        this.todoS.push(todo);

        this._commit(this.todoS);
    }

    deleteTodo(id) {
        this.todoS = this.todoS.filter(todo => todo.id !== id);

        this._commit(this.todoS);
    }

    editTodo(id, updatedText) {
        this.todoS = this.todoS.map(todo =>
            todo.id === id
                ? {
                      id: todo.id,
                      text: updatedText,
                      complete: todo.complete
                  }
                : todo
        );

        this._commit(this.todoS);
    }

    toggleTodo(id) {
        this.todoS = this.todoS.map(todo =>
            todo.id === id
                ? {
                      id: todo.id,
                      text: todo.text,
                      complete: !todo.complete
                  }
                : todo
        );

        this._commit(this.todoS);
    }

    filterTodo(filter) {
        this.todoS.filter(todo => {
            if (filter === 0) return true;
            return filter === 1 ? !todo.complete : todo.complete;
        });
    }
}

class View {
    constructor() {
        this.form = document.querySelector("#taskForm");
        this.input = document.getElementById("taskInput");
        this.list = document.querySelector("#taskList");
        this.filter = document.getElementById("filterButtons");

        this._temporaryTodoText = "";
        this._initLocalListeners();
    }

    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);

        return element;
    }

    getElement(selector) {
        const element = document.querySelector(selector);

        return element;
    }

    set _value(value) {
        this.input.value = value;
    }

    get _todoText() {
        return this.input.value;
    }

    _resetInput() {
        this.input.value = "";
    }

    displayTodoS(todoS) {
        while (this.list.firstChild) {
            this.list.removeChild(this.list.firstChild);
        }

        if (todoS.length !== 0) {
            todoS.forEach(todo => {
                var li = this.createElement("li", "task"),
                    span = this.createElement("span"),
                    remove = this.createElement("button", "remove");

                li.id = todo.id;
                span.textContent = todo.text;
                span.contentEditable = true;
                span.classList.add("span");
                remove.textContent = "delete";

                const checkbox = this.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = todo.complete;

                if (todo.complete) {
                    const strike = this.createElement("s");
                    strike.textContent = todo.text;
                    span.innerHTML = "";
                    span.contentEditable = false;
                    span.classList.remove("span");
                    span.classList.add("completed");
                    span.append(strike);
                } else {
                    span.textContent = todo.text;
                }

                li.append(checkbox, span, remove);

                this.list.append(li);
            });
        }
    }

    bindAddTodo(handler) {
        this.form.addEventListener("submit", e => {
            e.preventDefault();

            if (this._todoText) {
                handler(this._todoText);
                this._resetInput();
            } else {
                return alert("Please enter a task");
            }
        });
    }

    bindDeleteTodo(handler) {
        this.list.addEventListener("click", e => {
            if (e.target.classList.contains("remove")) {
                const id = +e.target.parentElement.id;

                handler(id);
            }
        });
    }

    _initLocalListeners() {
        this.list.addEventListener("input", e => {
            if (e.target.className == "span") {
                this._temporaryTodoText = e.target.innerHTML;
            }
        });
    }

    bindEditTodo(handler) {
        this.list.addEventListener("focusout", event => {
            if (this._temporaryTodoText) {
                const id = +event.target.parentElement.id;

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = "";
            }
        });
    }

    bindToggleTodo(handler) {
        this.list.addEventListener("change", event => {
            if (event.target.type === "checkbox") {
                const id = +event.target.parentElement.id;

                handler(id);
            }
        });
    }

    bindFilterTodo(handler) {
        this.filter.addEventListener("click", e => {
            var filter = +e.target.getAttribute("value");
            handler(filter);
            this.changePage(filter);
        });
    }

    changePage(event) {
        switch (event) {
            case 0:
                document.querySelectorAll(".span").forEach(el => {
                    el.parentElement.style.display = "flex";
                });
                document.querySelectorAll(".completed").forEach(el => {
                    el.parentElement.style.display = "flex";
                });
                break;
            case 1:
                document.querySelectorAll(".span").forEach(el => {
                    el.parentElement.style.display = "flex";
                });
                document.querySelectorAll(".completed").forEach(el => {
                    el.parentElement.style.display = "none";
                });
                break;
            case 2:
                document.querySelectorAll(".span").forEach(el => {
                    el.parentElement.style.display = "none";
                });
                document.querySelectorAll(".completed").forEach(el => {
                    el.parentElement.style.display = "flex";
                });
                break;
        }
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.model.bindTodoListChanged(this.onTodoListChanged);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindEditTodo(this.handleEditTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindFilterTodo(this.handleFilterTodo);

        this.onTodoListChanged(this.model.todoS);
    }

    onTodoListChanged = todoS => {
        this.view.displayTodoS(todoS);
    };

    handleAddTodo = todoText => {
        this.model.addTodo(todoText);
    };

    handleDeleteTodo = id => {
        this.model.deleteTodo(id);
    };

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText);
    };

    handleToggleTodo = id => {
        this.model.toggleTodo(id);
    };

    handleFilterTodo = filter => {
        this.model.filterTodo(filter);
    };
}

const app = new Controller(new Model(), new View());
