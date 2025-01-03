import { useState, useRef, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import '../bootstrap/css/bootstrap.min.css';

import { Calendar } from 'primereact/calendar';
import { FloatLabel } from 'primereact/floatlabel';

import './App.css';
import { loadFromLocalStorage, clearLocalStorage, updateLocalStorage } from './LocalStorage.jsx';

AOS.init();

function App() {
    const [todos, setTodos] = useState([])
    const [categories, setCategories] = useState([])
    const [labels, setLabels] = useState(['work', 'personal', 'groceries'])
    const [date, setDate] = useState(null);

    useEffect(() => {
        const parser = loadFromLocalStorage('all')
        if (!parser) return console.log('Tasks list is empty.')
        setTodos(parser)
    }, [])

    useEffect(() => {
        updateLocalStorage(todos, categories)
    }, [todos])

    return (
        <>
            <div className="todo-card">
                <div className="app">
                    <div className="main">
                        <Tabs>
                            <TabList>
                                <Tab>All</Tab>
                                {labels.map((label) => (
                                    <Tab key={Math.random()}>{label.replace(label.charAt(0), label.charAt(0).toUpperCase())}</Tab>
                                ))}
                            </TabList>
                            <Form setTodos={setTodos} categories={categories} setCategories={setCategories} labels={labels} date={date} setDate={setDate} />
                            <TabPanel>
                                <Tasks setTodos={setTodos} todos={todos} filter_category='all' labels={labels} />
                            </TabPanel>
                            {labels.map((label) =>
                                <TabPanel key={Math.random()}>
                                    <Tasks setTodos={setTodos} todos={todos} filter_category={label} labels={labels} />
                                </TabPanel>
                            )}
                        </Tabs>
                    </div>
                    <div className="status-card">
                        <CountAndClearTasks todos={todos} setTodos={setTodos} />
                    </div>
                </div>

            </div>


        </>
    )
}

function Tasks({ setTodos, todos, filter_category, labels }) {
    function toggleTodoStatus(id) {
        setTodos((prevTodos) => prevTodos.map((todo) => todo.id === id ? { ...todo, checked: !todo.checked } : todo))
    }

    function deleteTodo(id) {
        setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
        if (todos.length == 1) return clearLocalStorage('todos');
    }

    function toggleCategory(id, label) {
        setTodos((prevTodos) =>
            prevTodos.map((todo) => {
                if (todo.id !== id) return todo;

                if (todo.categories.includes(label)) {
                    return { ...todo, categories: todo.categories.filter((category) => category !== label) };
                } else {
                    return { ...todo, categories: [...todo.categories, label] };
                }
            })
        );
    }

    const [activeButtonId, setActiveButtonId] = useState(null)


    function handleButtonClick(id) {
        setActiveButtonId((prevId) => prevId == id ? null : id)
    }

    const filter_todos = filter_category === 'all' ? todos : todos.filter((todo) => todo.categories.includes(filter_category))

    return (
        <>
            <ul>
                {filter_todos.length == 0 ? <div className='empty-task-list'>No tasks here, let's get productive!</div> :
                    filter_todos.map((todo) => (
                        <li key={todo.id} className='task'>
                            <div className="task-container">
                                <input type="checkbox" checked={todo.checked} onChange={() => toggleTodoStatus(todo.id)} />
                                <span className={todo.checked ? 'completed' : ''} >{todo.todo_text}</span>
                                <div className='task-deadline'>{todo.deadline ? <i className="fa-regular fa-calendar"></i> : ''}{todo.deadline}</div>
                            </div>
                            <div className="task-labels">

                                <button key={todo.id} onClick={() => handleButtonClick(todo.id)} className={activeButtonId === todo.id ? 'fa-solid fa-chevron-right chevron-active' : 'fa-solid fa-chevron-right'}></button>
                                <div className={activeButtonId == todo.id ? 'label-selection' : 'label-selection-hidden'}>
                                    {labels.map((label) => <button
                                        key={Math.random()}
                                        onClick={() => toggleCategory(todo.id, label)}
                                        className={activeButtonId == todo.id ? 'label-selection-button' : 'label-selection-hidden'}>
                                        <i key={Math.random()} className={'fa-solid fa-tag'} id={label} style={{ border: 'none' }}></i>{label}</button>)}
                                </div>

                                {labels.map((label) => (
                                    todo.categories.includes(label) ?
                                        <i key={label} className={'fa-solid fa-tag'} id={label} style={{ border: 'none' }} /> : ''
                                ))}
                                <button className='del-button fa-solid fa-trash' type='button' onClick={() => deleteTodo(todo.id)}></button>
                            </div>
                        </li>
                    ))}
            </ul>
        </>
    )
}

function Form({ setTodos, categories, setCategories, labels, date, setDate }) {
    const input_reference = useRef();

    function handleSubmit(event) {
        event.preventDefault();

        const input_element = input_reference.current;
        if (input_element.value) {
            addTodoToList(input_element.value.trim());
            input_element.value = '';
        }
    }

    function setTodoCategories(event) {
        event.preventDefault();

        const target = event.target.id;
        if (!target) return;
        setCategories((prevCategories) => prevCategories.includes(target) ? prevCategories.filter((category) => category !== target) : [...prevCategories, target]);
    }

    function addTodoToList(todo_text) {
        setTodos((prevTodos) => {
            const new_todo = { deadline: !date ? '' : date.toDateString(), id: Date.now(), todo_text, checked: false, categories: [...categories, 'all'] };
            const updated_todos = [...prevTodos, new_todo]

            updateLocalStorage(updated_todos, categories)

            return updated_todos;
        })
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input className='todo-input' type="text" name="todo" placeholder="Add a new task..." ref={input_reference} />
                <div className="card flex justify-content-center">
                    <FloatLabel>
                        <Calendar className='calendar' inputId="set_deadline" value={date} onChange={(e) => setDate(e.value)} />
                        <label className='deadline-calendar' htmlFor="set_deadline">Set Deadline</label>
                    </FloatLabel>
                </div>
                <button className='add-button button' type="submit">ADD</button>
            </form >
            <FloatLabel>
                <Calendar className='calendar-compact' inputId="set_deadline_compact" value={date} onChange={(e) => setDate(e.value)} />
                <label className='deadline-calendar-compact' htmlFor="set_deadline_compact">Set Deadline</label>
            </FloatLabel>
            <div className='filters' onClick={setTodoCategories}>
                {labels.map((label) => (
                    <button
                        key={labels.indexOf(label)}
                        id={label}
                        className={categories.includes(label) ? 'filter selected-filters' : 'filter'}
                    >
                        {label}<i className="fa-solid fa-tag"></i></button>
                ))}
            </div>
        </>
    )
}

function CountAndClearTasks({ todos, setTodos }) {

    const counter = todos.filter((todo) => !todo.checked);

    function clearAllTodos() {
        setTodos([]);
        clearLocalStorage();
    }

    return (
        <div className="bottom">
            <div className="counter-container">
                <ProgressBar variant='info' now={todos.length - counter.length} max={todos.length || 1} />
                <p className='counter'>{counter.length > 0 ? `Still ${counter.length} tasks to go!` : `Plan your life!`}</p>
            </div>
            <button onClick={clearAllTodos} className='clear-all button' type='button'>CLEAR ALL</button>
        </div>
    )
}

export default App;