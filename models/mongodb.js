const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/drifter');

let bottleModel = mongoose.model('Bottle', new mongoose.Schema({
	bottle: Array,
	message: Array
},{
	collection: 'bottles'
}));

// 存储飘流瓶
exports.save = function (picker, _bottle, cb){
	let bottle = {bottle: [], message: []};
	bottle.bottle.push(picker);
	bottle.message.push([
		_bottle.owner,
		_bottle.time,
		_bottle.content
	]);
	bottle = new bottleModel(bottle);
	bottle.save(function (err){
		cb(err);
	});
};

// 获取某用户所有飘流瓶
exports.getAll = function (user, cb){
	bottleModel.find({"bottle": user}, function (err, bottles){
		if(err){
			return cb({
				code: 0,
				msg: '获取飘流瓶列表失败'
			});
		}
		cb({
			code: 1,
			msg: bottles
		});
	});
};

// 根据id获取飘流瓶内容
exports.getOne = function (_id, cb){
	bottleModel.findById( _id, function (err, bottle){
		if(err){
			return cb({
				code: 0,
				msg: '获取飘流瓶失败'
			});
		}
		cb({
			code: 1,
			msg: bottle
		});
	});
};

// 回复某个 id 的飘流瓶
exports.reply = function (_id, reply, cb){
	reply.time = reply.time || Date.now();
	bottleModel.findById(_id, function (err, _bottle){
		if(err){
			return cb({
				code: 0,
				msg: '回复飘流瓶失败'
			});
		}
		var newBottle = {};
		newBottle.bottle = _bottle.bottle;
		newBottle.message = _bottle.message;
		if(newBottle.bottle.length === 1){
			newBottle.bottle.push(_bottle.message[0][0]);
		}
		newBottle.message.push([
			reply.user,
			reply.time,
			reply.content
		]);
		bottleModel.findByIdAndUpdate(_id, newBottle, function (err, bottle){
			if(err){
				return cb({
					code: 0,
					msg: '回复飘流瓶失败'
				});
			}
			cb({
				code: 1,
				msg: bottle
			});
		});
	});
};

// 根据id删除飘流瓶
exports.delete = function (_id, cb){
	bottleModel.findByIdAndRemove( _id, function (err){
		if(err){
			return cb({
				code: 0,
				msg: '删除飘流瓶失败'
			});
		}
		cb({
			code: 1,
			msg: '删除飘流瓶成功'
		});
	});
};
