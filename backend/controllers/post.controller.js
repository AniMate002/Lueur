import { Notification } from "../models/notification.model.js"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"

export const createPost = async (req, res) => {
    try{
        const { text } = req.body
        let { img } = req.body
        const user = await User.findById(req.user._id)

        if(!user) return res.status(404).json({error: "User was not found"})

        if(!text && !img) return res.status(400).json({error: "Provide text or image"})

        const newPost = new Post()
        // newPost.img = img || ""
        if(img){
            const res = await cloudinary.uploader.upload(img)
            img = res.secure_url
        }
        newPost.text = text || ""
        newPost.likes = []
        newPost.comments = []
        newPost.user = user._id
        await newPost.save()

        return res.status(201).json(newPost)
    }catch(e){
        console.log("Error in createPost controller: ", e.message)
        return res.status(500).json({error: "Internal server error in creating post"})
    }
}


export const deletePost = async (req, res) => {
    try{
        
        const user = await User.findById(req.user._id)
        if(!user) return res.status(404).json({error: "User not found"})

        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({error: "Post not found"})

        if(post.user.toString() !== user._id.toString()){
            return res.status(404).json({error: "You can not delete this post"})
        }

        if(post.img){
            await cloudinary.uploader.destroy(post.img.split('/').pop().split('.')[0])
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({message: "Post deleted successfully"})
    }catch(e){
        console.log("Error in deletePost controller: ", e.message)
        return res.status(500).json({error: "Internal server error in deleting post"})
    }
}


export const commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id
        const { text } = req.body
        const post = await Post.findById(postId)
        const user = await User.findById(req.user._id)
        
        if(!post) return res.status(404).json({error: "Post not found"})
        
        if(!user) return res.status(404).json({error: "User not found"})
        
        if(!text) return res.status(400).json({error: "Provide text for comment"})

        post.comments.push({text, user: user._id})

        await post.save()
        
        return res.status(200).json(post)
    } catch (e) {
        console.log("Error in commentOnPost controller: ", e.message)
        return res.status(500).json({error: "Internal server error commenting post"})
    }
}



export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.user._id

        const post = await Post.findById(postId)
        const user = await User.findById(userId)
        
        if(!post) return res.status(404).json({error: "Post not found"})
        
        if(!user) return res.status(404).json({error: "User not found"})

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost){
            // UNLIKE
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId }})
            await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId}})
            return res.status(200).json({message: 'Post has been unliked successfully'})
        }else{
            // LIKE
            await Post.findByIdAndUpdate(postId, { $push: { likes: userId }})
            await User.findByIdAndUpdate(userId, { $push: { likedPosts: postId}})


            // ADD CONDITION NOT SEND NOTIFICATION IF I LIKE MY OWN POSTS
            const notification = Notification.create({
                from: userId,
                to: post.user,
                type: "like"
            })
            return res.status(200).json({message: 'Post has been liked successfully'})
        }

    } catch (e) {
        console.log("Error in likeUnlikePost controller: ", e.message)
        return res.status(500).json({error: "Internal server error in like/unlike post"})
    }
}


export const getAllPosts = async (req, res) => {
    try {
        
        const posts = await Post.find().sort({createdAt: -1})
        .populate({
            path: 'user'
        })
        .populate({
            path: 'comments.user'
        })

        if(posts.length === 0) return res.status(200).json([])

        
        return res.status(200).json(posts)
    } catch (e) {
        console.log("Error in getAllPosts controller: ", e.message)
        return res.status(500).json({error: "Internal server error in fetching posts"})
    }
}



export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id

        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})
        
        const likedPosts = await Post.find({_id: { $in: user.likedPosts}})
        .populate({
            path: 'comments.user'
        })
        .populate({
            path: 'user'
        })

        if(likedPosts.length === 0) return res.status(200).json([])

        return res.status(200).json(likedPosts)
    } catch (e) {
        console.log("Error in getLikedPosts controller: ", e.message)
        return res.status(500).json({error: "Internal server error in fetching liked posts"})
    }
}


export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})

        const followingPosts = await Post.find({user: { $in: user.following}})
        .sort({ createdAt: -1})
        .populate({
            path: 'comments.user'
        })
        .populate({
            path: 'user'
        })

        if(followingPosts.length === 0) return res.status(200).json([])

        return res.status(200).json(followingPosts)

    } catch (e) {
        console.log("Error in getFollowingPosts controller: ", e.message)
        return res.status(500).json({error: "Internal server error in fetching following posts"}) 
    }
}


export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username
        
        const user = await User.findOne({username})

        if(!user) return res.status(404).json({error: "User not found"})

        const userPosts = await Post.find({user: user._id})
        .sort({createdAt: -1})
        .populate({
            path: 'comments.user'
        })
        .populate({
            path: 'user'
        })

        if(userPosts.length === 0) return res.status(200).json([])

        return res.status(200).json(userPosts)

    } catch (e) {
        console.log("Error in getUserPosts controller: ", e.message)
        return res.status(500).json({error: "Internal server error in fetching user posts"})
    }
}