// Type declarations for the Video Frame Callback API
// Spec: https://wicg.github.io/video-rvfc/
// Not yet in lib.dom.d.ts — added here to avoid TypeScript errors

interface VideoFrameCallbackMetadata {
  /** Presentation timestamp of the frame in seconds. */
  presentationTime: DOMHighResTimeStamp;
  /** Expected display time in seconds. */
  expectedDisplayTime: DOMHighResTimeStamp;
  /** Video stream width in CSS pixels. */
  width: number;
  /** Video stream height in CSS pixels. */
  height: number;
  /** Media presentation timestamp (PTS) of the frame in seconds. */
  mediaTime: number;
  /** Number of frames presented since requestVideoFrameCallback() was first called. */
  presentedFrames: number;
  /** Time elapsed in seconds between each frame presentation. */
  processingDuration?: number;
  /** Capture time in seconds (only available for getUserMedia streams). */
  captureTime?: DOMHighResTimeStamp;
  /** Receive time in seconds (only available for RTCPeerConnection streams). */
  receiveTime?: DOMHighResTimeStamp;
  /** RTP timestamp of the frame (only available for RTCPeerConnection streams). */
  rtpTimestamp?: number;
}

type VideoFrameRequestCallback = (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void;

interface HTMLVideoElement {
  requestVideoFrameCallback(callback: VideoFrameRequestCallback): number;
  cancelVideoFrameCallback(handle: number): void;
}
