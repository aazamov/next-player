import React, { useEffect, useRef } from "react";
import axios from "axios";
import Hls from "hls.js";

const Player = ({ videoUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(videoUrl);
        const playlistContent = response.data;

        const modifiedPlaylist = addNewLinesToPlaylist(playlistContent);

        if (modifiedPlaylist) {
          console.log("Modified playlist:", modifiedPlaylist);

          const video = videoRef.current;
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(modifiedPlaylist);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
              console.log("Playlist of segments:", data.levels);
            });
            return () => {
              hls.destroy();
            };
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = modifiedPlaylist;
          }
        } else {
          console.error("Failed to add new lines to playlist");
        }
      } catch (error) {
        console.error("Error fetching or playing the playlist:", error);
      }
    };

    fetchPlaylist();
  }, [videoUrl]);

  const addNewLinesToPlaylist = (playlistContent) => {
    try {
      // Split the playlist content into lines
      const lines = playlistContent.split("\n");
      // Insert the new line as the second line
      lines.splice(
        1,
        0,
        '#EXT-X-KEY:METHOD=AES-128,URI="http://192.168.0.133:8000/media/nf_grow_up_2/master.m3u8.key",IV=0x65653262353237323238616562303535'
      );
      // Join the lines back together
      return lines.join("\n");
    } catch (error) {
      return null;
    }
  };

  return <video controls ref={videoRef} />;
};

export default Player;
