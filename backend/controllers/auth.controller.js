import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'

export const signup = async (req, res) => {
    try{
        const {username, fullname, password, email} = req.body

        if(password.length < 6){
            return res.status(401).json({error: "Password is too short."})
        }

        let foundUser = await User.findOne({username})
        if(foundUser){
            return res.status(400).json({error: "This username is already taken."})
        }

        foundUser = await User.findOne({email})
        if(foundUser){
            return res.status(400).json({error: "User with this email already exists"})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({username, fullname, password: hashedPassword, email})
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            return res.status(201).json(newUser)
        }else{
            return res.status(401).json({error: "Invalid user data."})
        }


    }catch(e){
        console.log("Error in sign up controller: ", e.message)
        return res.status(500).json({error: "Internal server error in signup."})

    }
}

export const login = async (req, res) => {
    try{
        const {username, password} = req.body
        const user = await User.findOne({username})
        if(!user){
            return res.status(401).json({error: "User was not found."})
        }

        const isPasswordCorrrect = await bcrypt.compare(password, user?.password || "") //user?.password || "" - this condition is compulsary otherwaise bcryptjs with throw error
        if(isPasswordCorrrect){
            generateTokenAndSetCookie(user._id, res)
        }else{
            return res.status(401).json({error: "Password is incorrect."})
        }

        return res.status(200).json(user)
    }catch(e){
        console.log("Error in login controller: ", e.message)
        return res.status(500).json({error: "Internal server error in login."})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", '', {maxAge:0})
        return res.status(200).json({message: "Logged out successfully."})
    } catch (e) {
        console.log("Error in logout controller: ", e.message)
        return res.status(500).json({error: "Internal server error in logout."})
    }
}


export const getMe = async (req, res) => {
    try{
        const user = await User.findById(req.user._id)
        res.status(200).json(user)
    }catch(e){
        console.log("Error in getMe controller: ", e.message)
        return res.status(500).json({error: "Internal server error in getMe."})
    }
}