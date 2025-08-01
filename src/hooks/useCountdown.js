import { useState, useEffect } from 'react';

export const useCountdown = (initialSeconds) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
        }

        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const start = (duration) => {
        setSeconds(duration);
        setIsActive(true);
    };

    const stop = () => {
        setIsActive(false);
        setSeconds(0);
    };

    const reset = (duration) => {
        setSeconds(duration);
        setIsActive(true);
    };

    return { seconds, isActive, start, stop, reset };
}; 