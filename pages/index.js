import Player from "@/components/Player";
import React from "react";

const App = () => {
  const playlistUrl =
    "http://192.168.0.133:8000/media/nf_grow_up_2/master.m3u8";

  return (
    <div>
      <h1>HLS Player</h1>
      <Player videoUrl={playlistUrl} />
    </div>
  );
};

export default App;
