import { useState, useEffect } from 'react'
import './App.css'

type Priority = 'High' | 'Medium' | 'Low' | 'None'
type ViewMode = 'tasks' | 'today' | 'week' | 'calendar'

type Schedule = {
    id: number
    date: string
    time: string
    endtime: string
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
        const aHasDate = a.date !== ''
        const bHasDate = b.date !== ''

        const aHasDateTime = a.date !== '' && a.time !== ''
        const bHasDateTime = b.date !== '' && b.time !== ''

        if (aHasDate && !bHasDate) {
            return -1
        }

        if (!aHasDate && bHasDate) {
            return 1
        }

        if (aHasDate && bHasDate) {
            const dateCompare = a.date.localeCompare(b.date)

            if (dateCompare !== 0) {
                return dateCompare
            }

            if (aHasDateTime && !bHasDateTime) {
                return -1
            }

            if (!aHasDateTime && bHasDateTime) {
                return 1
            }

            if (aHasDateTime && bHasDateTime) {
                const timeCompare = a.time.localeCompare(b.time)

                if (timeCompare !== 0) {
                    return timeCompare
                }
            }

            return priorityOrder[a.priority] - priorityOrder[b.priority]
        }

        return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
}

const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)

    return hour * 60 + minute
}

function App() {
    const todayDate = formatDate(new Date())
    const weekDates = getWeekDates()

    const [time, setTime] = useState('')
    const [endtime, setEndtime] = useState('')
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
    const todayTimedSchedules = todaySchedules.filter(
        (schedule) => schedule.time !== '' && schedule.endtime !== ''
    )
    const currentSchedule = todaySchedules[0]

    useEffect(() => {
        localStorage.setItem('schedules', JSON.stringify(schedules))
    }, [schedules])

    useEffect(() => {
        localStorage.setItem('clearedSchedules', JSON.stringify(clearedSchedules))
    }, [clearedSchedules])

    const addSchedule = () => {
        if (title === '') return

        const hasDate = date !== ''
        const hasTime = time !== ''
        const hasEndtime = endtime !== ''

        if (hasTime !== hasEndtime) return

        if (hasTime && hasEndtime) {
            const startMinutes = timeToMinutes(time)
            const endMinutes = timeToMinutes(endtime)

            if (endMinutes <= startMinutes) return
        }

        const newSchedule: Schedule = {
            id: Date.now(),
            date: hasDate ? date : '',
            time: hasTime ? time : '',
            endtime: hasEndtime ? endtime : '',
            title,
            done: false,
            priority,
        }

        setSchedules(sortSchedules([...schedules, newSchedule]))

        setDate(todayDate)
        setTime('')
        setEndtime('')
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

                {showDate && (
                    <span className="date">
                        {schedule.date || ''}
                    </span>
                )}

                <span className="time">
                    {schedule.time && schedule.endtime
                        ? `${schedule.time} - ${schedule.endtime}`
                        : ''}
                </span>

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

                <button onClick={() => setViewMode('today')}>
                    Today
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
                    type="time"
                    value={endtime}
                    onChange={(e) => setEndtime(e.target.value)}
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
                        {schedules.length === 0 ? (
                            <p className="empty-day">予定はありません</p>
                        ) : (
                            schedules.map((schedule) =>
                                renderScheduleItem(schedule, true)
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
                                    <span className="time">{schedule.time} - {schedule.endtime}</span>
                                    <span className="title">{schedule.title}</span>
                                    <span className="priority">{schedule.priority}</span>
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}

            {viewMode === 'today' && (
                <section className="today-timeline">
                    {Array.from({ length: 24 }, (_, hour) => (
                        <div className="timeline-hour" key={hour}>
                            <div className="timeline-time">
                                {String(hour).padStart(2, '0')}:00
                            </div>

                            <div className="timeline-line" />
                        </div>
                    ))}

                    {todayTimedSchedules.map((schedule) => {
                        const startMinutes = timeToMinutes(schedule.time)
                        const endMinutes = timeToMinutes(schedule.endtime)

                        const hourHeight = 40

                        const top = (startMinutes / 60) * hourHeight
                        const height = ((endMinutes - startMinutes) / 60) * hourHeight

                        return (
                            <div
                                className={`timeline-task priority-${schedule.priority}`}
                                key={schedule.id}
                                style={{
                                    top: `${top}px`,
                                    height: `${height}px`,
                                }}
                            >
                                <span className="timeline-task-time">
                                    {schedule.time} - {schedule.endtime}
                                </span>

                                <span className="timeline-task-title">
                                    {schedule.title}
                                </span>
                            </div>
                        )
                    })}
                </section>
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