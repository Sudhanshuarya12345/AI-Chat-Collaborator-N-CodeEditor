import { Error } from 'mongoose'
import userModel from '../models/user.model.js'

// Service used to create User in database
export const createUser = async ({ email, password }) => {

    if (!email || !password) {
        throw new Error('Email and password are required')
    }

    const hashedPassword = await userModel.hashPassword(password)

    const user = await userModel.create({
        email,
        password: hashedPassword
    })

    return user;
}


export const getAllUsers = async ( { userId } ) => {
    const users = await userModel.find({
        _id: { $ne: userId }  // Exclude the current user from the list
    })
    return users
}