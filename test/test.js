const request = require('request');
for(var i = 1; i <= 100; i++){
	(function (i){
		request.post({
			url: 'http://127.0.0.1:8989',
			json: {
				"owner": 'bottle' + i,
				"type": 'male',
				"content": 'content' + i
			}
		});
	})(i);
}

for(var i = 101; i <= 200; i++){
	(function (i){
		request.post({
			url: 'http://127.0.0.1:8989',
			json: {
				"owner": 'bottle' + i,
				"type": 'female',
				"content": 'content' + i
			}
		});
	})(i);
}







