import React, { useState, useEffect } from "react";
import axios from "../axios.js";

export default function StudentVideos() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios.get("/resources/videos/student")
      .then(res => setVideos(res.data))
      .catch(err => console.error("Failed to fetch videos", err));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>My Videos</h1>
        <ul className="video-list">
          {videos.map(video => (
            <li key={video._id}>
              <video
                src={video.url}
                controls
                className="video-player"
              />
              <p>{video.filename}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}