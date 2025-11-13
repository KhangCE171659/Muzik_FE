/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";

export const useSpotifyToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      // Gửi code về backend để đổi lấy access token
      axios
        .post("http://localhost:3001/auth/spotify/token", { code })
        .then((res) => {
          setToken(res.data.access_token);
          localStorage.setItem("spotify_token", res.data.access_token);
          window.history.replaceState(null, "", window.location.pathname);
        })
        .catch((err) => console.error("Token exchange failed", err));
    } else {
      const saved = localStorage.getItem("spotify_token");
      if (saved) setToken(saved);
    }
  }, []);

  return { token };
};
