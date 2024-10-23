import mongoose from 'mongoose'

const connectMongoDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected: ", connection.connection.host)
    }catch(e){
        console.log("Error connecting to mongoDB: ", e.message)
        process.exit(1)
    }
}

export default connectMongoDB