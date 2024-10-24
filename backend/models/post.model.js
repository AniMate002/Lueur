import { model, Schema } from "mongoose";



const postSchema = new Schema({
    text: { type:String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
    img: { type: String },
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [
        {
            text: { 
                type: String,
                required: true
            },
            user: {
                type: Schema.Types.ObjectId, ref: 'User', required: true
            }
        }
    ]
}, {
    timestamps: true
})


export const Post = model("Post", postSchema)