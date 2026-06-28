import { useState, useEffect } from 'react'
import './App.css'

type Priority = 'High' | 'Medium' | 'Low' | 'None'
type ViewMode = 'tasks' | 'week'
type Schedule = {//予定データの設計図
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

function App() {
    const todayDate = formatDate(new Date())
    const weekDates = getWeekDates()

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(todayDate)
    const [priority, setPriority] = useState<Priority>('None')
    const [viewMode, setViewMode] = useState<ViewMode>('tasks')
    const [schedules, setSchedules] = useState<Schedule[]>(() => {//Schedule型の配列が入る
        const savedSchedules = localStorage.getItem('schedules')

        if (savedSchedules) {
            return JSON.parse(savedSchedules)
        }

        return []
    })

    const [killedSchedules, setKilledSchedules] = useState<Schedule[]>(() => {
        const savedKilledSchedules = localStorage.getItem('killedSchedules')

        if (savedKilledSchedules) {
            return JSON.parse(savedKilledSchedules)
        }

        return []
    })

    const currentSchedule = schedules.find(
        (schedule) => schedule.date === todayDate && !schedule.done)//findで，条件に合う最初の1件を探す

    useEffect(() => {
        localStorage.setItem('schedules', JSON.stringify(schedules))
    }, [schedules])
    useEffect(() => {
        localStorage.setItem('killedSchedules', JSON.stringify(killedSchedules))
    }, [killedSchedules])

    const addSchedule = () => {
        if (title === '') return

        const newSchedule: Schedule = {
            id: Date.now(),//1970年1月1日 00:00:00 UTC から、今までに経過したミリ秒
            date: date,
            time: time,
            title: title,
            done: false,
            priority: priority
        }

        const sortedSchedules = [...schedules, newSchedule].sort((a, b) => {
            return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        })

        setSchedules(sortedSchedules)

        setTime('')
        setTitle('')
        setPriority('None')
    }

    const toggleDone = (id: number) => {//あるidの予定を切り替える
        const newSchedules = schedules.map((schedule) => {//予定1件分のデータを受け取り参照（map）
            if (schedule.id === id) {
                return {
                    ...schedule,//現在参照している予定をコピー
                    done: !schedule.done,//doneのみ反転させる
                }
            }

            return schedule//クリックされた予定でないならそのまま返す
        })

        setSchedules(newSchedules)//更新されたnewSchedulesを代入する
    }

    const killSchedule = (id: number) => {
        const targetSchedule = schedules.find((schedule) => schedule.id === id)//キルする予定1件を探す

        if (!targetSchedule) return

        const newSchedules = schedules.filter((schedule) => schedule.id !== id)//配列から条件に合うものだけ残して新しい配列を作成

        setSchedules(newSchedules)
        setKilledSchedules([...killedSchedules, targetSchedule])
    }

    const restoreSchedule = (id: number) => {
        const targetSchedule = killedSchedules.find((schedule) => schedule.id === id)

        if (!targetSchedule) return

        const newKilledSchedules = killedSchedules.filter((schedule) => schedule.id !== id)

        const sortedSchedules = [...schedules, targetSchedule].sort((a, b) => {
            return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        })

        setKilledSchedules(newKilledSchedules)
        setSchedules(sortedSchedules)
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
                <button
                    className="tasks"
                    onClick={() => setViewMode('tasks')}>
                    Tasks
                </button>

                <button
                    className="week"
                    onClick={() => setViewMode('week')}>
                    Week
                </button>
            </section>

            <section className="form">
                <input type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />



                <input type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <input type="text"
                    placeholder="予定を入力"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}//selectからとれる値をPriority型として扱う
                >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="None">None</option>
                </select>

                <button onClick={addSchedule}>追加</button>

            </section>

            {viewMode === 'tasks' ? (
                <section className="playlist">
                    {schedules.map((schedule) => (
                        <div
                            className={`schedule-item ${schedule.done ? 'done' : ''} priority-${schedule.priority}`}//doneがtrueのとき，classNameにdoneが加わる,Priority
                            key={schedule.id}
                        >
                            <span className="date">{schedule.date}</span>
                            <span className="time">{schedule.time}</span>
                            <span className="title">{schedule.title}</span>
                            <span className="priority">{schedule.priority}</span>

                            <button onClick={() => toggleDone(schedule.id)}>
                                {schedule.done ? '戻す' : '完了'}
                            </button>

                            <button onClick={() => killSchedule(schedule.id)}>
                                Kill
                            </button>
                        </div>
                    ))}
                </section>
            ) : (
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
                                        {schedulesForDate.map((schedule) => (
                                            <div
                                                className={`schedule-item ${schedule.done ? 'done' : ''} priority-${schedule.priority}`}
                                                key={schedule.id}
                                            >
                                                <span className="time">{schedule.time}</span>
                                                <span className="title">{schedule.title}</span>
                                                <span className="priority">{schedule.priority}</span>

                                                <button onClick={() => toggleDone(schedule.id)}>
                                                    {schedule.done ? '戻す' : '完了'}
                                                </button>

                                                <button onClick={() => killSchedule(schedule.id)}>
                                                    Kill
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )
                    })}
                </section>
            )}
            <section className="killed-list">
                <h2>Killed Tasks</h2>

                {killedSchedules.length === 0 ? (
                    <p>キルしたタスクはありません</p>
                ) : (
                    killedSchedules.map((schedule) => (
                        <div className="killed-item" key={schedule.id}>
                            <span className="date">{schedule.date}</span>
                            <span className="time">{schedule.time}</span>
                            <span className="title">{schedule.title}</span>
                            <span className="priority">{schedule.priority}</span>
                            <button onClick={() => restoreSchedule(schedule.id)}>
                                Restore
                            </button>
                        </div>
                    ))
                )}
            </section>
        </main >
    )
}

export default App

//localStorage.removeItem('schedules')予定データ削除用
//localStorage.removeItem('killedSchedules')キルした予定データ削除用