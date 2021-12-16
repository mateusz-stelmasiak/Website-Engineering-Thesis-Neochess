import { useState, useRef } from 'react';


//timer wrapper for use in classes
export function timerWraper(Component) {
    return function WrappedComponent(props) {
        const hookValue = useTimer();
        return <Component {...props} hookValue={hookValue} />;
    }
}

//countdirection 1 for counting up, -1 for counting down
const useTimer = (initialState = 0,countDirection=1) => {
    const [timer, setTimer] = useState(initialState)
    const [isActive, setIsActive] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const countRef = useRef(null)

    const setTime = (time) => {
        setTimer(time);
    }

    const handleStart = () => {
        setIsActive(true)
        setIsPaused(true)
        countRef.current = setInterval(() => {
            setTimer((timer) => timer + countDirection)
        }, 1000)
    }

    const timerRestart = () => {
        clearInterval(countRef.current)
        setTimer(0)
        setIsActive(true)
        setIsPaused(true)
        countRef.current = setInterval(() => {
            setTimer((timer) => timer + countDirection)
        }, 1000)
    }

    const handlePause = () => {
        clearInterval(countRef.current)
        setIsPaused(false)
    }

    const handleResume = () => {
        setIsPaused(true)
        countRef.current = setInterval(() => {
            setTimer((timer) => timer + countDirection)
        }, 1000)
    }

    const handleReset = () => {
        clearInterval(countRef.current)
        setIsActive(false)
        setIsPaused(false)
        setTimer(0)
    }

    return { timer, isActive, isPaused, handleStart, handlePause, handleResume, handleReset,timerRestart,setTime }
}

export default useTimer
