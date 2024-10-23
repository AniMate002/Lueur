import express from "express"
import authRoutes  from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import dotenv from 'dotenv'
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"
import { v2 as cloudinary} from "cloudinary" // api for image hosting

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json()) // helps to get data from req.body from POST method
app.use(express.urlencoded({ extended: true })) //to parse form data(urlencoded)
app.use(cookieParser())
// add here cookieParser middleware

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

// app.get('/', (req, res) => {
//     res.send("Hello app")
// })

app.listen(PORT, () => {
    console.log(`_______Server is running on port: ${PORT} url: http://localhost:${PORT}/ ________`)
    // console.log(process.env.MONGO_URI)
    connectMongoDB()
})
