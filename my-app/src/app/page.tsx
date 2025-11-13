"use client";
import { useSpotifyToken } from "@/hooks/useSpotifyToken";
import { PlayListResponse } from "@/types/playList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Play,
  Pause,
  Clock,
  Heart,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

// Types
interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  uri: string;
}

interface PlaylistTrack {
  added_at: string;
  track: Track;
}

interface PlaylistDetails {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  owner: { display_name: string };
  tracks: {
    items: PlaylistTrack[];
    total: number;
  };
  uri: string;
}

export default function Home() {
  const { token } = useSpotifyToken();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  // Fetch playlists
  const getMyPlaylists = async () => {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  };

  const { data, isLoading } = useQuery<PlayListResponse>({
    queryKey: ["myPlaylists"],
    queryFn: getMyPlaylists,
    enabled: !!token,
  });

  // Fetch playlist details
  const getPlaylistDetails = async (playlistId: string) => {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };

  const { data: playlistDetails, isLoading: isLoadingDetails } =
    useQuery<PlaylistDetails>({
      queryKey: ["playlistDetails", selectedPlaylist],
      queryFn: () => getPlaylistDetails(selectedPlaylist!),
      enabled: !!token && !!selectedPlaylist,
    });

  // Player state
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPremium, setIsPremium] = useState(false);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Web Playback SDK Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener("initialization_error", ({ message }: any) => {
        console.error("Initialization Error:", message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }: any) => {
        console.error("Authentication Error:", message);
      });

      spotifyPlayer.addListener("account_error", ({ message }: any) => {
        console.error("Account Error:", message);
      });

      spotifyPlayer.addListener("playback_error", ({ message }: any) => {
        console.error("Playback Error:", message);
      });

      spotifyPlayer.addListener("ready", ({ device_id }: any) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsPremium(true);
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }: any) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPlaying(!state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  // Update position
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1000, duration));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Play track or playlist
  const handlePlay = async (uri: string, contextUri?: string) => {
    if (!token || !deviceId) {
      alert("Player not ready. Please wait...");
      return;
    }

    try {
      const body: any = contextUri
        ? { context_uri: contextUri }
        : { uris: [uri] };

      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error("Error playing:", error);
      if (error.response?.status === 403) {
        alert("Spotify Premium required!");
      }
    }
  };

  const togglePlayPause = () => {
    if (!player) return;
    player.togglePlay();
  };

  const handleNext = () => {
    if (!player) return;
    player.nextTrack();
  };

  const handlePrevious = () => {
    if (!player) return;
    player.previousTrack();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player) return;
    const progressBar = e.currentTarget;
    const clickX = e.nativeEvent.offsetX;
    const width = progressBar.offsetWidth;
    const newPosition = (clickX / width) * duration;
    player.seek(newPosition);
    setPosition(newPosition);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
  };

  // Calculate total duration
  const getTotalDuration = () => {
    if (!playlistDetails?.tracks.items) return "0 min";
    const total = playlistDetails.tracks.items.reduce(
      (acc, item) => acc + item.track?.duration_ms,
      0
    );
    const hours = Math.floor(total / 3600000);
    const mins = Math.floor((total % 3600000) / 60000);
    return hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
  };

  // Show playlist list view
  if (!selectedPlaylist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-gray-900 to-black pb-24">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <svg
                className="w-8 h-8 text-green-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <nav className="hidden md:flex gap-6">
                <a
                  href="#"
                  className="text-white hover:text-green-500 transition font-semibold"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Search
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition"
                >
                  Your Library
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {isPremium ? (
                <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">
                  ✓ Premium Active
                </div>
              ) : (
                <div className="px-4 py-2 bg-yellow-600 text-white rounded-full text-sm font-bold">
                  Connecting...
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                Your Playlists
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Click any playlist to view songs
              </p>
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-800 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-800 rounded mb-2"></div>
                    <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            )}

            {data?.data?.items && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {data.data.items.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group bg-gray-900/40 hover:bg-gray-800/60 rounded-lg p-4 transition-all duration-300 cursor-pointer relative"
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-2xl">
                      {playlist.images && playlist.images[0] ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-white/50"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-green-400 transition-all">
                          <Play className="w-6 h-6 text-black fill-black ml-1" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white truncate group-hover:text-green-500 transition">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                        {playlist.description ||
                          `By ${playlist.owner.display_name}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{playlist.tracks.total} songs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Player Bar */}
        <PlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          volume={volume}
          togglePlayPause={togglePlayPause}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          handleSeek={handleSeek}
          handleVolumeChange={handleVolumeChange}
          formatTime={formatTime}
        />
      </div>
    );
  }

  // Show playlist detail view
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setSelectedPlaylist(null)}
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <svg
              className="w-8 h-8 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <div className="flex items-center gap-4">
            {isPremium && (
              <div className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold">
                ✓ Premium Active
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {isLoadingDetails ? (
          <div className="px-6 py-12">
            <div className="animate-pulse flex gap-6 mb-8">
              <div className="w-60 h-60 bg-gray-800 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-800 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : (
          playlistDetails && (
            <>
              {/* Playlist Header */}
              <div
                className="px-6 py-12"
                style={{
                  background: `linear-gradient(180deg, rgba(91, 87, 115, 0.8) 0%, rgba(0, 0, 0, 0) 100%)`,
                }}
              >
                <div className="max-w-7xl mx-auto flex gap-6 items-end">
                  <div className="w-60 h-60 bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex-shrink-0">
                    {playlistDetails.images?.[0] ? (
                      <img
                        src={playlistDetails.images[0].url}
                        alt={playlistDetails.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <svg
                          className="w-24 h-24 text-white/50"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-2">
                      PLAYLIST
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-6 tracking-tight">
                      {playlistDetails.name}
                    </h1>
                    {playlistDetails.description && (
                      <p className="text-gray-300 mb-4 text-sm">
                        {playlistDetails.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-white">
                      <span className="font-bold">
                        {playlistDetails.owner.display_name}
                      </span>
                      <span>•</span>
                      <span>{playlistDetails.tracks.total} songs</span>
                      <span>•</span>
                      <span className="text-gray-400">
                        {getTotalDuration()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="px-6 py-6 bg-gradient-to-b from-black/40 to-black">
                <div className="max-w-7xl mx-auto flex items-center gap-8">
                  <button
                    onClick={() => handlePlay("", playlistDetails.uri)}
                    className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-green-400 transition-all"
                  >
                    <Play className="w-7 h-7 text-black fill-black ml-1" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition">
                    <Heart className="w-8 h-8" />
                  </button>
                  <button className="text-gray-400 hover:text-white transition">
                    <MoreHorizontal className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Track List */}
              <div className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                  {/* Table Header */}
                  <div className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 border-b border-white/10 text-sm text-gray-400 mb-2">
                    <div className="text-center">#</div>
                    <div>TITLE</div>
                    <div>ALBUM</div>
                    <div className="text-right">
                      <Clock className="w-4 h-4 inline" />
                    </div>
                  </div>

                  {/* Tracks */}
                  {playlistDetails.tracks.items.map((item, index) => (
                    <div
                      key={item.track?.id + index}
                      onClick={() => handlePlay(item.track.uri)}
                      className="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 rounded hover:bg-white/10 transition group cursor-pointer items-center"
                    >
                      <div className="text-center text-gray-400 group-hover:hidden text-sm">
                        {index + 1}
                      </div>
                      <div className="hidden group-hover:block text-center">
                        <Play className="w-4 h-4 text-white inline" />
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                          {item.track?.album?.images?.[0] && (
                            <img
                              src={item.track.album.images[0].url}
                              alt={item.track.album.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">
                            {item.track?.name}
                          </p>
                          <p className="text-gray-400 text-sm truncate">
                            {item.track?.artists.map((a) => a.name).join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm truncate">
                        {item.track?.album.name}
                      </div>
                      <div className="text-right text-gray-400 text-sm">
                        {formatTime(item.track?.duration_ms)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )
        )}
      </main>

      {/* Player Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        position={position}
        duration={duration}
        volume={volume}
        togglePlayPause={togglePlayPause}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleSeek={handleSeek}
        handleVolumeChange={handleVolumeChange}
        formatTime={formatTime}
      />
    </div>
  );
}

// Player Bar Component
function PlayerBar({
  currentTrack,
  isPlaying,
  position,
  duration,
  volume,
  togglePlayPause,
  handleNext,
  handlePrevious,
  handleSeek,
  handleVolumeChange,
  formatTime,
}: any) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-white/10 px-4 py-3 shadow-2xl z-50">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Current Track */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {currentTrack ? (
              <>
                <div className="w-14 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                  {currentTrack.album?.images?.[0]?.url && (
                    <img
                      src={currentTrack.album.images[0].url}
                      alt={currentTrack.album.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-semibold truncate">
                    {currentTrack.name}
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    {currentTrack.artists?.map((a: any) => a.name).join(", ")}
                  </div>
                </div>
                <button className="flex-shrink-0">
                  <Heart className="w-5 h-5 text-gray-400 hover:text-green-500 transition" />
                </button>
              </>
            ) : (
              <div className="text-gray-500 text-sm">No track playing</div>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button className="text-gray-400 hover:text-white transition">
                <Shuffle className="w-4 h-4" />
              </button>
              <button
                className="text-gray-400 hover:text-white transition"
                onClick={handlePrevious}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition"
                onClick={togglePlayPause}
                disabled={!currentTrack}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-black fill-black" />
                ) : (
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                )}
              </button>
              <button
                className="text-gray-400 hover:text-white transition"
                onClick={handleNext}
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-white transition">
                <Repeat className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-10 text-right">{formatTime(position)}</span>
              <div
                className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-white group-hover:bg-green-500 transition-colors relative"
                  style={{
                    width: `${duration ? (position / duration) * 100 : 0}%`,
                  }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${volume}%, rgb(55, 65, 81) ${volume}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
