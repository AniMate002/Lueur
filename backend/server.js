import express from "express"
import authRoutes  from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // helps to get data from req.body from POST method
app.use(express.urlencoded({ extended: true })) //to parse form data(urlencoded)
app.use(cookieParser())
// add here cookieParser middleware

app.use('/api/auth', authRoutes)


// app.get('/', (req, res) => {
//     res.send("Hello app")
// })

app.listen(PORT, () => {
    console.log(`_______Server is running on port: ${PORT} url: http://localhost:${PORT}/ ________`)
    // console.log(process.env.MONGO_URI)
    connectMongoDB()
})
