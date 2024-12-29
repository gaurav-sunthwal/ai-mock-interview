import { Server } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY");

export default function SocketHandler(req: any, res: any) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("audioChunk", async (chunk) => {
      try {
        const audioBuffer = Buffer.from(chunk, "base64");
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
          .generateContent({
            contents: [{ role: "user", parts: [{ audio: { data: audioBuffer, mimeType: "audio/mp3" } }] }]
          });

        const transcript = result?.response || "Transcription failed";
        socket.emit("transcription", transcript);
      } catch (error) {
        console.error("Error in transcription:", error);
        socket.emit("transcription", "Error during transcription");
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  res.end();
}