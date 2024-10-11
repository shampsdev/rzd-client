import { uploadVoice } from "@/api/post.send.ts";
import { useRecorder } from "@/hooks/useRecorder";
import { useEffect, useRef, useState } from "react";

export const HomePage = () => {
  const [time, setTime] = useState<number | null>(null); // Время в миллисекундах
  const [isActive, setIsActive] = useState(false);
  const { startRecording, stopRecording, audioBlob } = useRecorder();

  const startRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioBlob) {
      console.log("sending");
      uploadVoice(audioBlob);
    }
  }, [audioBlob]);

  const updateTimer = (currentTime: number) => {
    if (startRef.current !== null) {
      setTime(currentTime - startRef.current);
    }
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleClick = async () => {
    if (!isActive) {
      setIsActive(true);
      startRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updateTimer);
      startRecording();
    } else {
      setIsActive(false);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      stopRecording();
    }
  };

  const formatTime = (time: number) => {
    const seconds = Math.floor(time / 1000);
    const milliseconds = Math.floor(time % 1000);
    return `${seconds < 10 ? `0${seconds}` : seconds}:${
      milliseconds < 100 ? `0${milliseconds}` : milliseconds
    }`;
  };

  return (
    <div className='w-full pt-[20%] flex flex-col items-center justify-center'>
      <p className='text-muted-foreground md:text-lg max-w-[90%] md:max-w-[70%] text-center mb-5'>
        Для старта записи нажмите на кнопку
      </p>
      <div
        onClick={handleClick}
        className='inline-block bg-black text-white text-lg py-3 px-10 rounded-full text-center cursor-pointer'
      >
        {isActive ? "[ Остановить запись ]" : "[ Начать запись ]"}
      </div>
      {time !== null && (
        <p className='mt-5 text-lg'>Таймер: {formatTime(time)}</p>
      )}
    </div>
  );
};
