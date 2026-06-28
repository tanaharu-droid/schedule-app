import { useState, useEffect } from 'react'
import './App.css'

type Priority = 'High' | 'Medium' | 'Low' | 'None'
type ViewMode = 'tasks' | 'week' | 'calendar'

type Schedule = {
    id: number
    date: string
    time: string
    title: string
    done: boolean
    priority: Priority
}

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getWeekDates = () => {
    const today = new Date()

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today)
        date.setDate(today.getDate() + index)

        return formatDate(date)
    })
}

const priorityOrder: Record<Priority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
    None: 3,
}

const sortSchedules = (schedules: Schedule[]) => {
    return [...schedules].sort((a, b) => {
        const dateTimeCompare = `${a.date} ${a.time}`.localeCompare(
            `${b.date} ${b.time}`
        )

        if (dateTimeCompare !== 0) {
            return dateTimeCompare
        }

        return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
}

function App() {
    const todayDate = formatDate(new Date())
    const weekDates = getWeekDates()

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(todayDate)
    const [priority, setPriority] = useState<Priority>('None')
    const [viewMode, setViewMode] = useState<ViewMode>('tasks')

    const [schedules, setSchedules] = useState<Schedule[]>(() => {
        const savedSchedules = localStorage.getItem('schedules')

        if (savedSchedules) {
            return JSON.parse(savedSchedules)
        }

        return []
    })

    const [clearedSchedules, setClearedSchedules] = useState<Schedule[]>(() => {
        const savedClearedSchedules = localStorage.getItem('clearedSchedules')

        if (savedClearedSchedules) {
            return JSON.parse(savedClearedSchedules)
        }

        return []
    })

    const todaySchedules = schedules.filter((schedule) => schedule.date === todayDate)
    const currentSchedule = todaySchedules[0]

    useEffect(() => {
        localStorage.setItem('schedules', JSON.stringify(schedules))
    }, [schedules])

    useEffect(() => {
        localStorage.setItem('clearedSchedules', JSON.stringify(clearedSchedules))
    }, [clearedSchedules])

    const addSchedule = () => {
        if (title === '') return
        if (date === '') return
        if (time === '') return

        const newSchedule: Schedule = {
            id: Date.now(),
            date,
            time,
            title,
            done: false,
            priority,
        }

        setSchedules(sortSchedules([...schedules, newSchedule]))

        setDate(todayDate)
        setTime('')
        setTitle('')
        setPriority('None')
    }

    const updatePriority = (id: number, newPriority: Priority) => {
        const newSchedules = schedules.map((schedule) => {
            if (schedule.id === id) {
                return {
                    ...schedule,
                    priority: newPriority,
                }
            }

            return schedule
        })

        setSchedules(sortSchedules(newSchedules))
    }

    const clearSchedule = (id: number) => {
        const targetSchedule = schedules.find((schedule) => schedule.id === id)

        if (!targetSchedule) return

        const newSchedules = schedules.filter((schedule) => schedule.id !== id)

        setSchedules(newSchedules)
        setClearedSchedules([...clearedSchedules, targetSchedule])
    }

    const restoreSchedule = (id: number) => {
        const targetSchedule = clearedSchedules.find((schedule) => schedule.id === id)

        if (!targetSchedule) return

        const newClearedSchedules = clearedSchedules.filter(
            (schedule) => schedule.id !== id
        )

        setClearedSchedules(newClearedSchedules)
        setSchedules(sortSchedules([...schedules, targetSchedule]))
    }

    const renderScheduleItem = (schedule: Schedule, showDate: boolean) => {
        return (
            <div
                className={`schedule-item priority-${schedule.priority}`}
                key={schedule.id}
            >
                <label className="task-check">
                    <input
                        type="checkbox"
                        onChange={() => clearSchedule(schedule.id)}
                    />
                </label>

                {showDate && <span className="date">{schedule.date}</span>}

                <span className="time">{schedule.time}</span>
                <span className="title">{schedule.title}</span>

                <select
                    className="priority-select"
                    value={schedule.priority}
                    onChange={(e) =>
                        updatePriority(schedule.id, e.target.value as Priority)
                    }
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="None">None</option>
                </select>
            </div>
        )
    }

    return (
        <main className="app">
            <h1>今日の予定</h1>

            <section className="now-playing">
                <p>Now Playing</p>
                {currentSchedule ? (
                    <h2>{currentSchedule.title}</h2>
                ) : (
                    <h2>Call it a day!</h2>
                )}
            </section>

            <section className="view-switch">
                <button onClick={() => setViewMode('tasks')}>
                    Tasks
                </button>

                <button onClick={() => setViewMode('week')}>
                    Week
                </button>

                <button onClick={() => setViewMode('calendar')}>
                    Calendar
                </button>
            </section>

            <section className="form">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="予定を入力"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="None">None</option>
                </select>

                <button onClick={addSchedule}>追加</button>
            </section>

            {viewMode === 'tasks' && (
                <>
                    <section className="playlist">
                        {todaySchedules.length === 0 ? (
                            <p className="empty-day">今日の予定はありません</p>
                        ) : (
                            todaySchedules.map((schedule) =>
                                renderScheduleItem(schedule, false)
                            )
                        )}
                    </section>

                    <section className="killed-list">
                        <h2>Cleared Tasks</h2>

                        {clearedSchedules.length === 0 ? (
                            <p>完了したタスクはありません</p>
                        ) : (
                            clearedSchedules.map((schedule) => (
                                <div className="killed-item" key={schedule.id}>
                                    <label className="task-check">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => restoreSchedule(schedule.id)}
                                        />
                                    </label>
                                    <span className="date">{schedule.date}</span>
                                    <span className="time">{schedule.time}</span>
                                    <span className="title">{schedule.title}</span>
                                    <span className="priority">{schedule.priority}</span>
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}

            {viewMode === 'week' && (
                <section className="week-view">
                    {weekDates.map((weekDate) => {
                        const schedulesForDate = schedules.filter(
                            (schedule) => schedule.date === weekDate
                        )

                        return (
                            <section className="day-section" key={weekDate}>
                                <h2>{weekDate}</h2>

                                {schedulesForDate.length === 0 ? (
                                    <p className="empty-day">予定なし</p>
                                ) : (
                                    <div className="playlist">
                                        {schedulesForDate.map((schedule) =>
                                            renderScheduleItem(schedule, false)
                                        )}
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </section>
            )}

            {viewMode === 'calendar' && (
                <section className="calendar-view">
                    {weekDates.map((weekDate) => {
                        const schedulesForDate = schedules.filter(
                            (schedule) => schedule.date === weekDate
                        )

                        return (
                            <div className="calendar-day" key={weekDate}>
                                <h2>{weekDate}</h2>

                                {schedulesForDate.length === 0 ? (
                                    <p className="calendar-empty">予定なし</p>
                                ) : (
                                    schedulesForDate.map((schedule) => (
                                        <div className="calendar-task" key={schedule.id}>
                                            <span>{schedule.time}</span>
                                            <span>{schedule.title}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )
                    })}
                </section>
            )}

        </main>
    )
}

export default App
//localStorage.removeItem('schedules')予定データ削除用
//localStorage.removeItem('killedSchedules')キルした予定データ削除用（旧）
//localStorage.removeItem('clearedSchedules')キルした予定データ削除用