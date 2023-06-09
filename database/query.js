
const excuteQuery =  ({ db, query }) => {
	return new Promise((resolve, reject) => {
		db.raw(query)
			.then((rows) => {
				// console.log(rows,'-----------------------------');
				resolve(rows[0]);
			})
			.catch((error) => {
				reject(error);
			});
	});
};
const getOne = async ({ db, query }) => {
	const records = await excuteQuery({ db, query });
	if (records.length > 0) {
		return records[0];
	}
	return null;
};
const getAll = async({db,query})=>{
	const records = await excuteQuery({ db, query });
	if (records.length > 0) {
		return records;
	}
	return null;
}
const create = async ({ db, query }) => {
	const result = await excuteQuery({ db, query });
	return result
}
const update = async ({ db, query }) => {
	const result = await excuteQuery({ db, query })
	return false
  }


module.exports = {
	excuteQuery,
	getOne,
	getAll,
	create,
	update
}