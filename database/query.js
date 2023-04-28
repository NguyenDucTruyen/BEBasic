
const excuteQuery=({db,query,params})=>{
	return new Promise((resolve,reject)=>{
		db.query(query,params,(err,rows)=>{
			if(err){
				reject(err);
			}
			resolve(rows);
		});
	});
};

const getOne = async ({db,query,params})=>{
	const records = await excuteQuery({db,query,params});
	if(records.length>0){
		return records[0];
	}
	return null;
};

const create = async({db,query,params})=>{
	const result = await excuteQuery({db,query,params});
	return result.params
}
const update = async({db,query,params})=>{
	const result = await excuteQuery({db,query,params});
	return result.params;
}

module.exports ={
    excuteQuery,
    getOne,
    create,
	update
}