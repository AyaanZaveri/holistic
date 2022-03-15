import Webcam from "react-webcam";
import React, { useRef, useEffect, useState } from "react";
import {
  drawConnectors,
  drawLandmarks,
  lerp,
} from "@mediapipe/drawing_utils/drawing_utils";
import { Camera } from "@mediapipe/camera_utils/camera_utils";
import {
  // FACEMESH_TESSELATION,
  HAND_CONNECTIONS,
  Holistic,
  POSE_CONNECTIONS,
  POSE_LANDMARKS_LEFT,
  POSE_LANDMARKS_RIGHT,
} from "@mediapipe/holistic";

const Home = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [showVideo, setShowVideo] = useState(false);

  const loadModel = async () => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.3.1620694839/${file}`;
      },
    });
    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  };

  const onResults = async (results) => {
    canvasRef.current.width = webcamRef.current.video.videoWidth;
    canvasRef.current.height = webcamRef.current.video.videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    if (
      results.poseLandmarks ||
      results.rightHandLandmarks ||
      results.leftHandLandmarks
    ) {
      // Pose

      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "white",
      });
      drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_LEFT).map(
          (index) => results.poseLandmarks[index]
        ),
        { visibilityMin: 0.65, color: "white", fillColor: "rgb(255,138,0)" }
      );
      drawLandmarks(
        canvasCtx,
        Object.values(POSE_LANDMARKS_RIGHT).map(
          (index) => results.poseLandmarks[index]
        ),
        { visibilityMin: 0.65, color: "white", fillColor: "rgb(0,217,231)" }
      );

      // Face

      // drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
      //   color: "#C0C0C070",
      //   lineWidth: 1,
      // });

      // Hands

      drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: "white",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, results.leftHandLandmarks, {
        color: "white",
        fillColor: "rgb(255,138,0)",
        lineWidth: 2,
        radius: (data) => {
          return lerp(data.from.z, -0.15, 0.1, 10, 1);
        },
      });
      drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: "white",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, results.rightHandLandmarks, {
        color: "white",
        fillColor: "rgb(0,217,231)",
        lineWidth: 2,
        radius: (data) => {
          return lerp(data.from.z, -0.15, 0.1, 10, 1);
        },
      });
    }
    canvasCtx.restore();
  };

  useEffect(() => {
    loadModel();
  }, []);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-3">
      <div className="flex flex-row items-center justify-center flex-wrap gap-3">
        <Webcam
          ref={webcamRef}
          className={`rounded-xl shadow-xl border ${
            showVideo ? "block" : "hidden"
          } hover:ring-2 hover:ring-[rgb(0,217,231)] w-11/12 max-w-lg ring-offset-2 transition-all delay-300 ease-in-out`}
          mirrored={true}
        />

        <canvas
          ref={canvasRef}
          className="rounded-xl w-11/12 max-w-lg shadow-xl border hover:ring-2 hover:ring-[rgb(255,138,0)] ring-offset-2 transition-all delay-300 ease-in-out"
          style={{
            transform: "scaleX(-1)",
          }}
        />
      </div>

      <div className="inline-flex gap-2 items-center">
        <label>Show video?</label>
        <input
          value={showVideo}
          onClick={() => setShowVideo(!showVideo)}
          type="checkbox"
        />
      </div>

      {/* <h1 className="text-2xl">
        Predictions:{' '}
        {predictions.length ? predictions[0].handInVideoConfidence : null}
      </h1> */}
    </div>
  );
};

export default Home;
