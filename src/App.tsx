import { useState } from 'react'
import './App.css'

type Priority = 'High' | 'Medium' | 'Low' | 'None'
type Schedule = {//予定データの設計図
    id: number
    time: string
    title: string
    done: boolean
    priority: Priority
}

function App() {

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [priority, setPriority] = useState<Priority>('None')
    const [schedules, setSchedules] = useState<Schedule[]>([//Schedule型の配列が入る
        { id: 1, time: '10:00', title: '研究', done: false, priority: 'High' },
        { id: 2, time: '12:00', title: '昼食', done: false, priority: 'Medium' },
        { id: 3, time: '19:00', title: '楽器練習', done: false, priority: 'Low' },
    ])
    const [killedSchedules, setKilledSchedules] = useState<Schedule[]>([])//キルしたスケジュールリスト
    const currentSchedule = schedules.find((schedule) => !schedule.done)//findで，条件に合う最初の1件を探す

    const addSchedule = () => {
        if (title === '') return

        const newSchedule: Schedule = {
            id: Date.now(),//1970年1月1日 00:00:00 UTC から、今までに経過したミリ秒
            time: time,
            title: title,
            done: false,
            priority: priority
        }

        const sortedSchedules = [...schedules, newSchedule].sort((a, b) => {//newScheduleを含めた配列全体でソート（-→+）
            return a.time.localeCompare(b.time)//aがbより前ならマイナス，aがbより後ならプラス
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
            return a.time.localeCompare(b.time)
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

            <section className="form">
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

            <section className="playlist">
                {schedules.map((schedule) => (
                    <div
                        className={`schedule-item ${schedule.done ? 'done' : ''} priority-${schedule.priority}`}//doneがtrueのとき，classNameにdoneが加わる,Priority
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
            </section>

            <section className="killed-list">
                <h2>Killed Tasks</h2>

                {killedSchedules.length === 0 ? (
                    <p>キルしたタスクはありません</p>
                ) : (
                    killedSchedules.map((schedule) => (
                        <div className="killed-item" key={schedule.id}>
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