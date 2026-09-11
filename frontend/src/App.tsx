import { useState } from "react";
import LandingScreen from "./components/LandingScreen.tsx";
import ChatScreen from "./components/ChatScreen.tsx";

function App() {
  const [videoId, setVideoId] = useState<string | null>(null);

  if (videoId) {
    return <ChatScreen videoId={videoId} onReset={() => setVideoId(null)} />;
  }

  return <LandingScreen onReady={setVideoId} />;
}

export default App;
