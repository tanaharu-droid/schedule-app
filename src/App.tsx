import { useState } from 'react'
import './App.css'

function App() {

    const [time, setTime] = useState('')
    const [title, setTitle] = useState('')

    const addSchedule = () => {
        if (title === '') return

        const newSchedule = {
            time: time,
            title: title,
        }

        setSchedules([...schedules, newSchedule])

        setTime('')
        setTitle('')
    }

    const [schedules, setSchedules] = useState([
        { time: '10:00', title: '研究' },
        { time: '12:00', title: '昼食' },
        { time: '19:00', title: '楽器練習' },
    ])

    return (
        <main className="app">
            <h1>今日の予定</h1>

            <section className="now-playing">
                <p>Now Playing</p>
                <h2>研究</h2>
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
                    < div className="schedule-item" key={`${schedule.time}-${schedule.title}`}>
                        <span className="time">{schedule.time}</span>
                        <span className="title">{schedule.title}</span>
                    </div>
                ))}
            </section>
        </main >
    )
}

export default App