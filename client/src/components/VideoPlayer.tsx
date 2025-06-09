import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('VideoPlayer received URL:', videoUrl);
    if (!videoUrl) {
      setError('No video URL provided');
      return;
    }

    // Ensure the video URL is properly formatted
    const formattedUrl = videoUrl.startsWith('http') ? videoUrl : `https://${videoUrl}`;
    console.log('Formatted video URL:', formattedUrl);

    if (videoRef.current) {
      videoRef.current.load(); // Reload the video when URL changes
    }
  }, [videoUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setError('Failed to play video');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    setError('Failed to load video');
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative group">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          controls={false}
          preload="metadata"
          poster={videoUrl.replace('.mp4', '.jpg')}
          onEnded={handleVideoEnded}
          onClick={handlePlayPause}
          onError={handleVideoError}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Progress Bar */}
          <div className="mb-2">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #7e22ce ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%)`
              }}
            />
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipBack size={24} />
              </button>
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                onClick={() => handleSkip(10)}
                className="text-white hover:text-purple-400 transition-colors"
              >
                <SkipForward size={24} />
              </button>
              <button
                onClick={handleMute}
                className="text-white hover:text-purple-400 transition-colors"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>
            <button
              onClick={handleFullscreen}
              className="text-white hover:text-purple-400 transition-colors"
            >
              <Maximize2 size={24} />
            </button>
          </div>
        </div>
      </div>

      {title && (
        <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      )}
    </div>
  );
};

export default VideoPlayer; 