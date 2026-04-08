const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const extractAudio = (videoPath) => {
  return new Promise((resolve, reject) => {

    const audioPath =
      videoPath.replace(/\.[^/.]+$/, "") + ".mp3";

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .save(audioPath)
      .on("end", () => resolve(audioPath))
      .on("error", reject);
  });
};

module.exports = { extractAudio };