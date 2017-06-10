const express = require('express');
const redis = require('./models/redis.js');
const bodyParser = require('body-parser');
const mongodb = require('./models/mongodb.js');

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//扔一个飘流瓶
//POST owner=xxx&type=xxx&content=xxx[&type=xxx]
app.post('/', function (req, res){
	if(!(req.body.owner && req.body.type && req.body.content)){
		if(req.body.type && (['male', 'female'].indexOf(req.body.type) === -1)){
			return res.send({
				code :0,
				msg: '类型错误'
			});
		}
		return res.send({
			code :0,
			msg: '信息不完整'
		});
	}
	redis.throw(req.body, function (result){
		res.send(result);
	});
});

//捡一个飘流瓶
//GET /?user=xxx[type=xxx]
app.get('/', function (req, res){
	if(!req.query.user){
		return res.send({
			code :0,
			msg: '信息不完整'
		});
	}
	if(req.query.type && (['male', 'female'].indexOf(req.query.type) === -1)){
		return res.send({
			code :0,
			msg: '类型错误'
		});
	}
	redis.pick(req.query, function (result){
		if(result.code === 1){
			mongodb.save(req.query.user, result.msg, function (err){
				if(err){
					return res.send({
						code :0,
						msg: '获取飘流瓶失败'
					});
				}
				res.send(result);
			});
		}else{
			res.send(result);
		}
	});
});

//扔回一个飘流瓶
//POST owner=xxx&type=xxx&content=xxx&time=xxx
app.post('/back', function (req, res){
	redis.throwBack(req.body, function (result){
		res.send(result);
	});
});


//获取一个用户的所有飘流瓶
//GET /user/ss
app.get('/user/:username', function (req, res){
	mongodb.getAll(req.params.username, function(result){
		res.send(result);
	});
});

//获取一个飘流瓶内容
//GET /bottle/593a6be31a02fd0f841c9231
app.get('/bottle/:bottleId', function (req, res){
	mongodb.getOne(req.params.bottleId, function(result){
		res.send(result);
	});
});

//回复飘流瓶内容
//POST /reply/593a6be31a02fd0f841c9231
app.post('/reply/:_id', function (req, res){
	if(!(req.body.user && req.body.content)){
		return res.send({
			code :0,
			msg: '回复信息不完整'
		});
	}
	mongodb.reply(req.params._id, req.body, function (result){
		res.send(result);
	});
});

//删除飘流瓶
//GET /delete/593a6be31a02fd0f841c9231
app.get('/delete/:id', function (req, res){
	mongodb.delete(req.params._id, function (result){
		res.send(result);
	});
});


app.listen(8989);