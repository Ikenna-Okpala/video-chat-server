const express = require("express")
const { ExpressPeerServer } = require("peer")
const { v4: uuidv4 } = require("uuid")
const cors = require("cors")

//CORS fr axios same-origin policy unless browser will block

// HTTP Long Polling - server sending data to client without asking

// Access control mechanism CORS

const app = express()


const http = require("http")

const server = http.Server(app)
const peerServer = http.Server(app)

const io = require("socket.io")(server, {
    cors: {
        origin: "*"
    },
})

const options = {
    debug: true
}

app.use("/peerjs", ExpressPeerServer(peerServer, options))

app.use(cors())
app.get("/create-room", (req, res, next) => {
    res.status(200).json({
        status: "success",
        data: {
            roomId: uuidv4()
        }
    })
})

io.on("connection", (socket) => {

    socket.on("join-room", (roomId, userName, userId) => {
        socket.join(roomId)

        setTimeout(() => {
            socket.in(roomId).emit("user-connected", userName, userId)
        }, 1000)

        socket.on("video-state", (isVideoOn, isMicOn) => {
            socket.in(roomId).emit("video-state", isVideoOn, isMicOn)
        })

        socket.on("user-name", (userName) => {
            socket.in(roomId).emit("user-name", userName)
        })

    })

    socket.on("message", (message, sender, roomId) => {
        io.in(roomId).emit("createMessage", message, sender)
    })




})


peerServer.listen(3002, () => {
    console.log("Peer server running on port 3002")
})

server.listen(8000, () => {
    console.log("server running on port 8000")
})


