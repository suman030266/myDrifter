const redis = require('redis');
let client = redis.createClient();
let clientThrowTimes = redis.createClient();
let clientPickTimes = redis.createClient();

// redis 链接错误
client.on('error', function(error) {
    console.log(error,'-=-=-=-=-=-=-=-=-=-=-=-=');
});
clientThrowTimes.on('error', function(error) {
    console.log(error,'------------------------');
});
clientPickTimes.on('error', function(error) {
    console.log(error,'========================');
});

// redis 验证 (reids.conf未开启验证，此项可不需要)
client.auth('123456');
clientThrowTimes.auth('123456');
clientPickTimes.auth('123456');

client.on('ready',function(err){
    console.log('ready');
});

//扔飘流瓶
exports.throw = function (data, cb){
	// 先去查看2号数据库次数
	clientThrowTimes.SELECT(2, function (){
		clientThrowTimes.GET(data.owner, function(err, result){
			if(err){
				return cb({
					code: 0,
					msg: '检查次数失败'
				});
			}
			if(result >= 10){
				return cb({
					code: 0,
					msg: '今天扔瓶子的机会已经用完了'
				});
			}
			//次数加1
			clientThrowTimes.INCR(data.owner, function(){
				clientThrowTimes.TTL(data.owner, function(err, ttl){
					if(ttl === -1){
						clientThrowTimes.EXPIRE(data.owner, 86400);
					}
				});
			});
			//开始扔
			data.time = data.time || Date.now();
			//随机升成 id
			let bottleId = Math.random().toString(16);
			let dbNum = data.type === 'male' ? 0 : 1;
			client.SELECT(dbNum, function (){
				// 用 hash 保存
				client.HMSET(bottleId, data, function(err, result){
					if(err){
						return cb({
							code: 0,
							msg: '过会儿再试试吧'
						});
					}
					cb({
						code: 1,
						msg: result
					});
					client.EXPIRE(bottleId, 86400);
				});
			});
		});
	});
	
}

//捡一个瓶子
exports.pick = function (info, cb){
	clientPickTimes.SELECT(3, function (){
		clientPickTimes.GET(info.user, function(err, result){
			if(err){
				return cb({
					code: 0,
					msg: '检查次数失败'
				});
			}
			if(result >= 10){
				return cb({
					code: 0,
					msg: '今天捡瓶子的机会已经用完了'
				});
			}
			//次数加1
			clientPickTimes.INCR(info.user, function(){
				clientPickTimes.TTL(info.user, function(err, ttl){
					if(ttl === -1){
						clientPickTimes.EXPIRE(info.user, 86400);
					}
				});
			});
			//开始捡
			//let n = 0.5;
			let n = 0;
			if(Math.random() <= n){
				return cb({
					code: 0,
					msg: '讨厌的星海'
				});
			}
			let type = {all: Math.round(Math.random()), male: 0, female: 1};
			info.type = info.type || 'all';
			client.SELECT(type[info.type], function (){
				client.RANDOMKEY(function(err, bottleId){
					if(!bottleId){
						return cb({
							code: 0,
							msg: '讨厌的星海'
						});
					}
					client.HGETALL(bottleId, function (err, bottle){
						if(err){
							return cb({
								code: 0,
								msg: '飘流瓶破损了。。。'
							});
						}
						cb({
							code: 1,
							msg: bottle
						});
						client.DEL(bottleId, 86400);
					});
				});
			});
		});
	});
	
};

//把捡到的瓶子扔回海里
exports.throwBack = function (data, cb){
	//随机升成 id
	let bottleId = Math.random().toString(16);
	let dbNum = data.type === 'male' ? 0 : 1;
	client.SELECT(dbNum, function (){
		// 用 hash 保存
		client.HMSET(bottleId, data, function(err, result){
			if(err){
				return cb({
					code: 0,
					msg: '过会儿再试试吧'
				});
			}
			cb({
				code: 1,
				msg: result
			});
			// 重新设置时间
			client.PEXPIRE(bottleId, bottle.time + 86400000 - Date.now());
		});
	})
}




