import { io } from "../index.js";
import PlayerService from "../service/PlayerService.js";

export const connectToGameLobby = () => {
  let connectedPlayers = [];

  io.on("connection", async (socket) => {
    console.log("player connected");
    let savedUsername;
    socket.on("online-ping", async (username) => {
      savedUsername = username;

      let addedPlayer = await PlayerService.getPlayerByUsername(savedUsername);
      if (!addedPlayer) {
        addedPlayer = await PlayerService.addPlayer({
          username: savedUsername,
        });
      }

      // Online logic
      addedPlayer.socketId = socket.id;
      connectedPlayers.push(addedPlayer);

      console.log(
        `Online players after ${savedUsername} connected:`,
        connectedPlayers.map((player) => player.username)
      );
      socket.emit(
        "in-game-players",
        connectedPlayers
          .filter((player) => player.inGame)
          .map((player) => player.username)
      );

      // socket.broadcast.emit(`players-started-game`, savedUsername, true);
    });

    socket.on(
      "invite-to-play",
      async ({ senderUsername, receiverUsername }) => {
        const player = connectedPlayers.find(
          (p) => p.username === receiverUsername
        );
        console.log(senderUsername);
        if (player) {
          const receiverSocketId = player.socketId;
          io.to(receiverSocketId).emit("receive-game-invite", {
            senderUsername: senderUsername,
          });
        } else {
          console.log("Receiver not found in connected players.");
        }
      }
    );

    socket.on("disconnect", async () => {
      if (savedUsername) {
        connectedPlayers = connectedPlayers.filter(
          (player) => player.username !== savedUsername
        );
        console.log(
          `Online players after ${savedUsername} disconnected:`,
          connectedPlayers.map((player) => player.username)
        );

        socket.broadcast.emit("player-connection", savedUsername, false);
      }
    });
  });
};