import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Unauthorized: No Token Provided."})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)   

        if(!decoded){
            return res.status(401).json({error: "Unauthorized: Invalid Token Provided."})
        }

        const user = await User.findById(decoded.userId)

        if(!user){
            return res.status(401).json({error: "Unauthorized: User was not found."})
        }

        req.user = user
        next()
    }catch(e){
        console.log("Error in protectRoute middleware: ", e.message)
        return res.status(500).json({error: "Internal server error in protect route middleware."})
    }
}