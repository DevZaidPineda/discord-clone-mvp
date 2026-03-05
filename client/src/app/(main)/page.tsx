"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center bg-discord-bg">
      <div className="text-center max-w-md px-4">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-discord-channel/20 flex items-center justify-center">
          <svg width="48" height="34" viewBox="0 0 28 20" fill="#5865f2">
            <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0292 1.4184C10.8251 0.934541 10.5765 0.461744 10.3242 0C8.47279 0.321129 6.66955 0.88384 4.95932 1.68235C0.713277 8.04649 -0.437326 14.2505 0.138032 20.3686C2.12398 21.8431 4.37986 22.9094 6.77608 23.5002C7.31059 22.7834 7.7833 22.0195 8.17968 21.2168C7.41832 20.9346 6.68448 20.5873 5.98781 20.1782C6.17484 20.0435 6.35739 19.9038 6.53281 19.7641C11.4628 22.0621 16.8318 22.0621 21.6965 19.7641C21.8748 19.9095 22.0574 20.0492 22.2387 20.1782C21.5398 20.5895 20.8036 20.9389 20.0398 21.2225C20.4387 22.0274 20.9087 22.7884 21.4456 23.5059C23.8446 22.9173 26.1015 21.8511 28.0862 20.3744C28.7663 13.2152 27.1754 7.07022 23.0212 1.67671Z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {user ? `Hey, ${user.username}!` : "Welcome!"}
        </h2>
        <p className="text-discord-text-muted">
          Select a server from the sidebar to start chatting, or create a new one with the + button.
        </p>
      </div>
    </div>
  );
}
