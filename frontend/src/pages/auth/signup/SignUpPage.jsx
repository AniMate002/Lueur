import React, { useState } from 'react'
import logo from '../../../../public/logo.png'
import { MdOutlineMailOutline } from "react-icons/md";
import { GoPerson } from "react-icons/go";
import { IoPencil } from "react-icons/io5";
import { MdOutlinePassword } from "react-icons/md";
import { NavLink } from 'react-router-dom';



const SignUpPage = () => {

    const [formData, setFormData] = useState({
        email: "",
        username: "",
        fullname: "",
        password: ""
    })


    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(formData)
    }

    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }


    return (
        <div className='w-[100vw] bg-black min-h-[100vh] flex flex-col items-center justify-center'>
            <img src={logo} alt='logo' className='w-[300px]'/>
            <h2 className='tracking-widest text-3xl mb-10'>Let us get started</h2>
            <form onSubmit={handleSubmit} className='w-[350px]'>
                <label className="input input-bordered w-full flex items-center gap-2 mb-4">
                    <MdOutlineMailOutline />
                    <input name='email' value={formData.email} onChange={handleInputChange} type="email" className="w-full" placeholder="Email" />
                </label>
                <label className="input input-bordered w-full flex items-center gap-2 mb-4">
                    <GoPerson />
                    <input name='username' value={formData.username} onChange={handleInputChange} type="text" className="w-full" placeholder="Username" />
                </label>
                <label className="input input-bordered w-full flex items-center gap-2 mb-4">
                    <IoPencil />
                    <input name='fullname' value={formData.fullname} onChange={handleInputChange} type="text" className="w-full" placeholder="Full Name" />
                </label>
                <label className="input input-bordered w-full flex items-center gap-2 mb-4">
                    <MdOutlinePassword />
                    <input name='password' value={formData.password} onChange={handleInputChange} type="password" className="w-full" placeholder="Password" />
                </label>
                <button className="btn w-full rounded-full">Sign up</button>
            </form>
            <h4 className='mt-6 text-slate-400 mb-2'>Already have an account?</h4>
            <NavLink to={'/login'} className="btn btn-primary rounded-full w-[350px]">Log in</NavLink>
        </div>
    )
}

export default SignUpPage