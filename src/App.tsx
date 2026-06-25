import { useState } from 'react'
import './App.css'

type Schedule = {//予定データの設計図
    id: number
    time: string
    title: string
    done: boolean
}

function App() {

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [schedules, setSchedules] = useState<Schedule[]>([//Schedule型の配列が入る
        { id: 1, time: '10:00', title: '研究', done: false },
        { id: 2, time: '12:00', title: '昼食', done: false },
        { id: 3, time: '19:00', title: '楽器練習', done: false },
    ])
    const currentSchedule = schedules.find((schedule) => !schedule.done)//findで，条件に合う最初の1件を探す

    const addSchedule = () => {
        if (title === '') return

        const newSchedule: Schedule = {
            id: Date.now(),//1970年1月1日 00:00:00 UTC から、今までに経過したミリ秒
            time: time,
            title: title,
            done: false,
        }

        const sortedSchedules = [...schedules, newSchedule].sort((a, b) => {//newScheduleを含めた配列全体でソート（-→+）
            return a.time.localeCompare(b.time)//aがbより前ならマイナス，aがbより後ならプラス
        })

        setSchedules(sortedSchedules)

        setTime('')
        setTitle('')
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

                <button onClick={addSchedule}>追加</button>

            </section>

            <section className="playlist">
                {schedules.map((schedule) => (
                    <div
                        className={`schedule-item ${schedule.done ? 'done' : ''}`}//doneがtrueのとき，classNameにdoneが加わる
                        key={schedule.id}
                    >
                        <span className="time">{schedule.time}</span>
                        <span className="title">{schedule.title}</span>

                        <button onClick={() => toggleDone(schedule.id)}>
                            {schedule.done ? '戻す' : '完了'}
                        </button>
                    </div>
                ))}
            </section>
        </main >
    )
}

export default App