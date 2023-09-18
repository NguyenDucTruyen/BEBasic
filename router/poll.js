const express = require('express');
const db = require('../database/connection');
const query = require('../database/query');
const route = express.Router();

const validate = require('../middleware/validateMiddleware');
const validatePoll = require('../middleware/pollMidddleware');
const e = require('express');
const permissionCode = require('../helper/allowPermission')
const {canAccessBy} = require('../middleware/verifyRole')

const checkAuthor = validatePoll.checkAuthor
const checkUser = validate.checkUser
const checkAdmin = validate.checkAdmin


//Create Poll
route.post('/create-poll', [checkUser,canAccessBy(permissionCode.CreatePoll)], async (req, res) => {

    let pollObject = req.body;
    let poll = pollObject.poll;
    let options = pollObject.options
    let user = req.user; /* user lay tu middleware checkUser */

    // Insert vào table `Polls`
    let PollNew = await query.create({
        db: db,
        query: db('polls').insert({
            name: poll.name,
            question: poll.question,
            createdBy: user.id
        }).toQuery()
    });
    //Insert cac option vao DB
    if (options.length > 0) {
        options.forEach(element => {
            element.pollId = PollNew.insertId;
        });

        await query.create({
            db: db,
            query: db('options').insert(options).toQuery()
        });
    }

    res.status(201).json({ message: 'Created poll successfully!' });

})

//Update Poll

route.put('/update-poll/:idPoll', [checkUser, checkAuthor,canAccessBy(permissionCode.UpdatePoll)], async (req, res) => {
    let pollTemp = req.body;
    pollTemp.id = req.params.idPoll;
    //Update name, question trong DB
    await query.update({
        db: db,
        query: db('polls').update({
            name: pollTemp.name,
            question: pollTemp.question
        }).where('id', pollTemp.id).toQuery()
    });
    res.status(200).json({ message: 'Updated poll successfully!' });

})

//Add options - insert option into table options
route.post('/update-poll/add-options/:idPoll', [checkUser, checkAuthor,canAccessBy(permissionCode.UpdatePoll)], async (req, res) => {
    //lay info tu body
    const idPoll = req.params.idPoll;
    let options = req.body;
    // Them key 'pollId' cho tung object -> moi object se la: {title:'ten option',pollId:req.params.idPoll}
    options.forEach(element => {
        element.pollId = idPoll;
    });
    //thuc hien cau lenh insert
    await query.create({
        db: db,
        query: db('options').insert(options).toQuery()
    });
    res.status(201).json({ message: 'Created options successfully!' });
})


//Edit options - update option in table options
/*
    Nhap idPoll tren url, req.body gom {id,title}
    Neu khong tim thay option co id = id -> thong bao
    nguoc lai: neu option thuoc poll co id la idPoll - lay tu URL
        -> update
            nguoc lai: thong bao : Option nay khong thuoc Poll co id la idPoll
*/
route.put('/update-poll/option-idpoll/:idPoll', [checkUser, checkAuthor,canAccessBy(permissionCode.UpdatePoll)], async (req, res) => {
    const option = {
        title: req.body.title
    }
    let optionFromDB = await query.getOne({
        db: db,
        query: db('options').select().where('id', req.body.id).toQuery()
    });
    if (!optionFromDB) {
        return res.status(400).json({ message: 'option not found' })
    }
    else if (optionFromDB.pollId == req.params.idPoll) {
        db('options')
            .where('id', req.body.id)
            .update(option)
            .then((result) => {
                if (result) {
                    return res.status(200).json({ message: 'update successed' })
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status.apply(400).json({ message: 'something wrong!' })
            })
    }
    else
        return res.status(400).json({ message: 'this poll does not include this option' });

})

// Remove Option -tuong tu update - kiem tra xem Poll request co chua option muuon xoa hay khong
route.delete('/update-poll/delete-option-idpoll/:idPoll', [checkUser, checkAuthor,canAccessBy(permissionCode.DeletePoll)], async (req, res) => {

    let optionFromDB = await query.getOne({
        db: db,
        query: db('options').select().where('id', req.body.id).toQuery()
    });
    if (!optionFromDB) {
        return res.status(400).json({ message: 'option not found' })
    }
    else if (optionFromDB.pollId == req.params.idPoll) {
        db('options')
            .where('id', req.body.id)
            .delete()
            .then((result) => {
                if (result) {
                    return res.status(200).json({ message: 'Deleted successfully' })
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status.apply(400).json({ message: 'something wrong!' })
            })
    }
    else
        return res.status(400).json({ message: 'this poll does not include this option' });

})

//View poll details - keyword: nestedArray
/** 
 Details cua 1 poll nhu sau: {
    "poll":{
        "id":2,
        "name": "abc",
        "question":"xyzABC"
    },
    "options":[
        {
            "id":2,
            "title":"co",
            "vote":[42,43,45] -> id cua user
        },
        {
            "id":3,
            "title":"khong",
            "vote":[42]
        }
    ]
}*/

route.get("/get-poll", [checkUser,canAccessBy(permissionCode.Viewpoll)], async (req, res) => {
    let pollDetails = {} /** -> Tao object de chua thong tin cua polls */
    //Lay thong tin cua polls tu table polls
    let pollFromDB = await query.getAll({
        db: db,
        query: db('polls').select().toQuery()
    });
    
    return res.status(200).json(pollFromDB)
    
})
route.get("/get-poll/:idPoll", [checkUser,canAccessBy(permissionCode.Viewpoll)], async (req, res) => {
    let pollId = req.params.idPoll;
    let pollDetails = {} /** -> Tao object de chua thong tin cua polls */
    //Lay thong tin cua polls tu table polls
    let pollFromDB = await query.getOne({
        db: db,
        query: db('polls').select().where('id', pollId).toQuery()
    });
    if (!pollFromDB) {
        res.status(400).json({ message: 'This poll does not exist' });
    }
    else {
        //Dua thong tin cua polls vao object pollDetails
        pollDetails.poll = {
            id: pollFromDB.id,
            name: pollFromDB.name,
            question: pollFromDB.question
        }
        pollDetails.options = []; //Tao mang chua cac options

        //Lay thong tin chi tiet cac option
        let options_users = await query.getAll({
            db: db,
            query: db('options').select('options.id', 'title', 'options_users.userId')
                .leftJoin('options_users', 'options.id', 'options_users.optionId')
                .where('pollId', pollId).toQuery()
        })
        if (options_users) {

            options_users.forEach(element => {
                // Tim vi tri cua element (options_user) trong pollDetails.options
                let index = pollDetails.options.findIndex(e => {
                    return e.id == element.id
                })
                if (index >= 0) {
                    /* Nếu đã tồn tại options details 
                    Nối tiếp userId vào list các user đã submit option này*/
                    pollDetails.options[index].userVoting = [...pollDetails.options[index].userVoting, element.userId];
                }
                else {
                    //Còn nếu chưa có options details thì tạo mới
                    pollDetails.options = [...pollDetails.options, {
                        id: element.id,
                        title: element.title,
                        userVoting: [element.userId]
                    }];
                }
            })
        }
        return res.status(200).json(pollDetails)
    }
})

// Delete poll
route.delete('/delete-poll/:idPoll', [checkUser,checkAuthor,canAccessBy(permissionCode.DeletePoll)], async (req, res) => {
    let idpoll = req.params.idPoll;
    //Lay poll tu table polls de di kiem tra
    //Neu chua co thi bao loi, neu co thi thuc hien xoa
    let pollFromDB = await query.getOne({
        db: db,
        query: db('polls').select().where('id', idpoll).toQuery()
    });
    if (!pollFromDB) {
        return res.status(400).json({ message: 'Polls not found' })
    }
    else if (req.user.isAdmin == 1 || pollFromDB.createdBy == req.user.id) {
        //Thuc hien cau lenh delete
        db('polls')
            .where('id', idpoll)
            .del()
            .then((result) => {
                if (result) {
                    return res.status(200).json({ message: 'Deleted successfully' })
                }
            })
            .catch((err) => {
                console.log(err);
                return res.status.apply(400).json({ message: 'something wrong!' })
            })
    }
    else
        return res.status(400).json({ message: 'You are not the author' });
})

// Submit & unsubmit options
route.post('/change-voting', [checkUser,canAccessBy(permissionCode.SubmitUnsubmit)], async (req, res) => {
    //Lay danh sach voteList tu body
    let voteList = req.body;
    let userReq=req.user.id;
    if (voteList.length > 0) {
        /*Lay danh cac cac submit cua user 
        (token user dat o authorization -> check user -> tra ve thong qua middleware)*/
        let submitExist = await query.getAll({
            db: db,
            query: db('options_users').select().where('userId', req.user.id).toQuery()
        });
        //Khoi tao danh sach insert (submit), danh sach delete(unsubmit)
        let listInsert = [], listDelete = []
        if (submitExist) {
            /*Duyet qua cac vote trong voteList
            Kiem tra vote do co ton tai trong DB hay khong (co ton tai submit hay khong)
            ->TH1: chua ton tai -> neu yeu cau submit (vote:true) -> duâ vao listInsert de them
            -> TH2: da ton tai -> neu yeu cau unsubmit (vote:faalse) -> dua vao listDelete de xoa
            */
            for (let i = 0; i < voteList.length; i++) {
                let exist = false;
                for (let j = 0; j < submitExist.length; j++) {
                    if (submitExist[j].optionId == voteList[i].optionId) {
                        exist = true;
                        if (voteList[i].vote == false)
                            listDelete = [...listDelete, submitExist[j].id]
                    }
                }

                if (!exist) {
                    if (voteList[i].vote == true)
                        listInsert = [...listInsert, {
                            optionId: voteList[i].optionId,
                            userId: req.user.id
                        }]
                }
            }

        }
        else {
             //Con neu nguoi dung chua co submit nao trong DB
            //thi chi can filter cac yeu cau submit, sau do insert
            console.log(voteList);
            voteList.forEach(e => {
                if (e.vote == true)
                    listInsert = [...listInsert, {
                        optionId: e.optionId,
                        userId: req.user.id
                    }]; 
            });
            console.log(listInsert);
        }
        // console.log(listInsert);
        //Thuc hien cau lenh insert va delete
        if (listInsert.length > 0) {
            await query.create({
                db: db,
                query: db('options_users').insert(listInsert).toQuery()
            })
        }
        if (listDelete.length > 0) {
            await query.update({
                db: db,
                query: db('options_users')
                    .whereIn('id', listDelete)
                    .del().toQuery()
            });
        }
        res.status(200).json("Done")
    }
    else {
        res.status(200).json({ message: 'You did not change anything!' });
    }
})

module.exports = route