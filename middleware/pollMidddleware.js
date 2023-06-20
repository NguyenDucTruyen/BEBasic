const jsonwebtoken = require('jsonwebtoken')
const query = require('../database/query')
const db = require('../database/connection')

const checkAuthor = async (req,res,next)=>{

    const idPoll = req.params.idPoll;
    const pollExisted = await query.getOne({
        db: db,
        query: db('polls').select().where('id', idPoll).toQuery()
    });
    if (!pollExisted) {
           return res.status(400).json({ message: 'This poll does not exist!' });
    }   
    else 
    {   
        if (req.user.id == pollExisted.createdBy) 
        {
            next();
        }
        else 
            res.status(400).json({message:'This user did not create this poll!'})
    }
}
module.exports ={checkAuthor}
