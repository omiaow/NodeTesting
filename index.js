import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv"
import user from "./routes/user.route.js"
import feedback from "./routes/feedback.route.js"
import route from "./routes/route.js"

const app = express()

dotenv.config()

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(cors())
app.use("/user", user)
app.use("/feedback", feedback)
app.use("/", route)

// to check if backend is not crashed
app.get("/", (req, res) => {
  res.send(`Server launched perfectly on ${req.protocol}://${req.get('host')}${req.originalUrl}`)
});

const PORT = process.env.PORT || 8080

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`))