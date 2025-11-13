import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const clientId = "1310abe9c6e04627940ad3476bc0f256";
  // const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
  ].join(" ");

  const redirectUri = "http://127.0.0.1:3000";

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  console.log(clientId, redirectUri, spotifyAuthUrl);
  const handleLogin = () => {
    window.location.href = spotifyAuthUrl;
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Side - Image */}
      <div className="w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-green-400 to-green-500">
          {/* Decorative image placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80"
                alt="Music"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/50 to-transparent" />
            </div>
          </div>

          {/* Spotify Logo */}
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <span className="text-black font-bold text-xl">Spotify</span>
          </div>

          {/* Bottom Text */}
          <div className="absolute bottom-8 left-8 max-w-md">
            <h2 className="text-4xl font-bold text-black mb-2">
              Your Music Journey Continues
            </h2>
            <p className="text-black/80 text-lg">
              Ready to feel the rhythm again?
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-green-950">
        <div className="w-full max-w-md px-8">
          <h1 className="text-5xl font-bold mb-12">Welcome Back!</h1>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@1234.com"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button className="text-sm text-gray-400 hover:text-white transition underline">
                Forgot Password?
              </button>
            </div>

            {/* Log In Button */}
            <button
              onClick={handleLogin}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-full transition transform hover:scale-105 active:scale-95"
            >
              Log In
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-400">Or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>

              <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-8 text-sm text-gray-400">
              Do not have an account?{" "}
              <button className="text-white font-semibold hover:text-green-500 transition underline">
                Sign Up Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
