import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';



export const createProject = async ({
    name,
    userId
}) => {
    if (!name || !userId) {  
        throw new Error('Name and user ID are required');
    }


    let project;
    try{
        project = await projectModel.create({
            name,
            users: [userId]
        });
    }
    catch(error){
        if(error.code === 11000){
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;
};


export const getAllProjectByUserId = async ({userId}) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    const allUserProjects = await projectModel.find({ users: userId });

    return allUserProjects;
}


export const addUsersToProject = async ({projectId, users, userId}) => {
    if (!projectId) {
        throw new Error('Project ID are required');
    }
    if(!users) {
        throw new Error('Users is required');
    }
    if(!userId) {
        throw new Error('User ID is required');
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error('Invalid Project ID');
    }

    if(!Array.isArray(users) || users.some(userId =>
        !mongoose.Types.ObjectId.isValid(userId))){
            throw new Error('Invalid user IDs');
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error('Invalid User ID');
    }
    
    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    });

    
    if(!project){
        throw new Error('User is not a member of this project');
    }
    
    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId},
        {
            $addToSet: {
                users: {
                    $each: users
                }
            }
        },
        {
            new: true
        });


    return updatedProject;
}


export const getProjectById = async ({projectId}) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error('Invalid Project ID');
    }

    const project = await projectModel.findById({
        _id: projectId
    }).populate('users');

    // if(!project){
    //     throw new Error('Project not found');
    // }
    return project;
}

