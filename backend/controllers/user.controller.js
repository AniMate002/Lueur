import { Notification } from "../models/notification.model.js"
import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"

export const getUserProfile = async (req, res) => {
    try{
        const { username } = req.params // params contains dynamic /:username value
        const user = await User.findOne({username})
        if(!user){
            return res.status(401).json({error: "User was not found."})
        }
        return res.status(200).json(user)
    }catch(e){
        console.log("Error in getUserProfile: ", e.message)
        return res.status(500).json({error: "Internal server error in getting user profile"})
    }
} 


export const followUnfollowUser = async (req, res) => {
    try{
        const { id } = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if(id.toString() === req.user._id.toString()) return res.status(401).json({error: "You can not follow/unfollow yourself."})
        
        if(!userToModify || !currentUser) return res.status(401).json({error: "User was not found"})

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing){
            // UNFOLLOW
            await User.findByIdAndUpdate(id, { $pull: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            
            return res.status(200).json({message: "User unfollowed successfully"})
        }else{
            // FOLLOW
            await User.findByIdAndUpdate(id, { $push: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            
            // Here we send the notification to the user
            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: "follow"
            })
            await newNotification.save()

            return res.status(200).json({message: "User followed successfully"})


        }

    }catch(e){
        console.log("Error in followUnfollowUser: ", e.message)
        return res.status(500).json({error: "Internal server error in following logic"})
    }
}



export const getSuggestedUsers = async (req, res) => {
    try{
        const userId = req.user._id
        const usersFollowedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId}
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0, 4)

        return res.status(200).json(suggestedUsers)
    }catch(e){
        console.log("Error in getSuggestedUsers: ", e.message)
        return res.status(500).json({error: "Internal server error in getting suggested users"})
    }
}


export const updateUser = async (req, res) => {
    try{
        const { fullname, username, currentPassword, newPassword, bio, link, email } = req.body
        let { profileImg, coverImg } = req.body
        const userId = req.user._id

        const user = await User.findById(userId)
        if(!user) return res.status(401).json({error: "User was not found"})
        
        // if(currentPassword === newPassword) return res.status(400).json({error: "Old and new passwords are identical"})
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch) return res.status(400).json({error: "Current password is incorrect"})
            
            if(newPassword.length < 6) return res.status(400).json({error: "New passord is too short"})

            if(newPassword === currentPassword) return res.status(400).json({error: "Old and new passwords are the same"})

            const salt = await bcrypt.salt(10)
            const hashedNewPassword = await bcrypt.hash(newPassword, salt)
            user.password = hashedNewPassword
        }else if((currentPassword && !newPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Please, provide both current and new password"})
        }


        if(profileImg){
            if(user.profileImg){
                // removes the previos image from the cloudinary
                // this method requies not full href but only the ID of the image
                // and this is how we can extract it
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }

        user.fullname = fullname || user.fullname
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        await user.save()

        return res.status(200).json(user)
        
    }catch(e){
        console.log("Error in updateUser: ", e.message)
        return res.status(500).json({error: "Internal server error in updating user"})
    }
}