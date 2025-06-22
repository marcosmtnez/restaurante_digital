import React, { useEffect, useRef, useState, useCallback } from "react";
import './Barstyle.css';

const ProgressBar = ({ videoRef, isActive }) => {
  const [progress, setProgress] = useState(0);
  const barRef = useRef(null);
  const animationRef = useRef(null);
  const isScrubbing = useRef(false);

  // Función para actualizar progreso visual
  const updateProgress = useCallback(() => {
    if (!isScrubbing.current && videoRef?.current && videoRef.current.duration > 0) {
      const { currentTime, duration } = videoRef.current;
      const newProgress = (currentTime / duration) * 100;
      setProgress((prev) => (Math.abs(prev - newProgress) > 0.5 ? newProgress : prev)); // throttle visual
    }

    animationRef.current = requestAnimationFrame(updateProgress);
  }, [videoRef]);

  // Manejo del ciclo de vida
  useEffect(() => {
    if (isActive && videoRef?.current) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, updateProgress, videoRef]);

  const handleSeek = (clientX) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || !videoRef?.current || !videoRef.current.duration) return;

    const clickX = clientX - rect.left;
    const width = rect.width;
    const percent = Math.min(Math.max(clickX / width, 0), 1);
    videoRef.current.currentTime = percent * videoRef.current.duration;
    setProgress(percent * 100);
  };

  const startScrubbing = (clientX) => {
    isScrubbing.current = true;
    handleSeek(clientX);
  };

  const stopScrubbing = () => {
    isScrubbing.current = false;
  };

  const handleMouseDown = (e) => {
    startScrubbing(e.clientX);

    const handleMouseMove = (moveEvent) => handleSeek(moveEvent.clientX);
    const handleMouseUp = () => {
      stopScrubbing();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startScrubbing(touch.clientX);

    const handleTouchMove = (moveEvent) => handleSeek(moveEvent.touches[0].clientX);
    const handleTouchEnd = () => {
      stopScrubbing();
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  return (
    <div
      className="progress-bar-container"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      ref={barRef}
    >
      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      <div
  className={`progress-bar-thumb ${isScrubbing.current ? "scrubbing" : ""}`}
  style={{ left: `${progress}%` }}
/>
    </div>
  );
};

export default ProgressBar;























