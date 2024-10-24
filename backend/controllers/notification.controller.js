import { Notification } from "../models/notification.model.js"
import { User } from "../models/user.model.js"



export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})

        const notifications = await Notification.find({to: user._id})
        .sort({createdAt: -1})
        .populate({
            path: 'from',
        })

        await Notification.updateMany({to: user._id}, {read: true})

        return res.status(200).json(notifications)
    } catch (e) {
        console.log("Error in getNotifications controller: ", e.message)
        return res.status(500).json({error: "Internal server error in fetching notifications"})
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})

        await Notification.deleteMany({to: user._id})

        return res.status(200).json({message: "Notifications deleted successfully"})
    } catch (e) {
        console.log("Error in deleteNotifications controller: ", e.message)
        return res.status(500).json({error: "Internal server error in deleting notifications"})
    }
}