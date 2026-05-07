# Privacy

The app has no analytics and no backend.

Camera and microphone streams are requested only after pressing Start. They are processed locally in the browser with WebGPU, Canvas, Web Audio, Web Workers, and ONNX Runtime Web. The project does not upload media or store recordings.

Loading a RIFE ONNX model uses a local file selected by the user. The model stays in browser memory for the session.
