import React, { useEffect, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";

const Player = ({ videoUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchAndLogStreamFile = async (url) => {
      try {
        const response = await axios.get(url);
        const streamUrls = parseMasterPlaylist(response.data);
        if (streamUrls.length > 0) {
          // Fetch the first stream URL as an example
          const streamResponse = await axios.get(streamUrls[0]);
          const modifiedContent = addEncryptionKeyToStreamContent(
            streamResponse.data
          );
          console.log("Modified Stream .m3u8 file content:\n", modifiedContent);
        } else {
          console.log("No stream URLs found in master playlist.");
        }
      } catch (error) {
        console.error("Error fetching playlist file:", error);
      }
    };

    const parseMasterPlaylist = (masterPlaylist) => {
      const lines = masterPlaylist.split("\n");
      const streamUrls = [];
      lines.forEach((line) => {
        if (line.endsWith(".m3u8")) {
          const url = new URL(line, videoUrl).toString();
          streamUrls.push(url);
        }
      });
      return streamUrls;
    };

    const addEncryptionKeyToStreamContent = (streamContent) => {
      const encryptionKeyLine =
        '#EXT-X-KEY:METHOD=AES-128,URI="http://192.168.0.133:8000/media/nf_grow_up_2/master.m3u8.key",IV=0x65653262353237323238616562303535';
      const lines = streamContent.split("\n");
      const indexOfFirstStreamInfo = lines.findIndex((line) =>
        line.startsWith("#EXTINF:")
      );
      if (indexOfFirstStreamInfo !== -1) {
        // Insert the encryption key line before the first stream segment
        lines.splice(indexOfFirstStreamInfo, 0, encryptionKeyLine);
      } else {
        // If no stream info is found, add the encryption key line at the end as a fallback
        lines.push(encryptionKeyLine);
      }
      return lines.join("\n");
    };

    fetchAndLogStreamFile(videoUrl);
  }, [videoUrl]);

  const handlePlayButtonClick = () => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  return (
    <div>
      <video controls ref={videoRef} />
      <button onClick={handlePlayButtonClick}>Play</button>
    </div>
  );
};

export default Player;
