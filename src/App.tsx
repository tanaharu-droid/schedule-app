import { useState } from 'react'
import './App.css'

function App() {

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')
    const [schedules, setSchedules] = useState([
        { time: '10:00', title: '研究', done: false },
        { time: '12:00', title: '昼食', done: false },
        { time: '19:00', title: '楽器練習', done: false },
    ])
    const currentSchedule = schedules.find((schedule) => !schedule.done)//findで，条件に合う最初の1件を探す

    const addSchedule = () => {
        if (title === '') return

        const newSchedule = {
            time: time,
            title: title,
            done: false,
        }

        setSchedules([...schedules, newSchedule])

        setTime('')
        setTitle('')
    }

    const toggleDone = (index: number) => {//index番目の予定を切り替える
        const newSchedules = schedules.map((schedule, i) => {//予定1件分のデータと番目を受け取り参照（map）
            if (i === index) {
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
                {schedules.map((schedule, index) => (
                    <div
                        className={`schedule-item ${schedule.done ? 'done' : ''}`}//doneがtrueのとき，classNameにdoneが加わる
                        key={`${schedule.time}-${schedule.title}`}
                    >
                        <span className="time">{schedule.time}</span>
                        <span className="title">{schedule.title}</span>

                        <button onClick={() => toggleDone(index)}>
                            {schedule.done ? '戻す' : '完了'}
                        </button>
                    </div>
                ))}
            </section>
        </main >
    )
}

export default App