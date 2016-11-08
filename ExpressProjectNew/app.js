
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bp = require('body-parser');

var _ = require('underscore');

var app = express();

var db;

var MongoClient = require('mongodb');

MongoClient.connect('mongodb://admin:admin@ds143707.mlab.com:43707/nkotharidb',function (err,database) {
	if(err){console.log('Error in database');}
	db = database;
	
});


var mytask=[
	{
		"description":"Watch Movie",
		"Completed":true
	},
	{
		"description":"Talk Mom",
		"Completed":false
	}];

var mytaskforpost=[];
var taskid = 1;
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bp.json());
app.use(express.static(path.join(__dirname, 'public')));

//Get requests
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/about', function(req,res){
	res.send('Welcome to about page');
});
app.get('/getmytasks', function(req,res){
	res.json(mytask);
});

app.get('/getmytaskid/:id', function(req,res){
	var todoId = parseInt(req.params.id, 10);
	var matchedItem;
	//Use underscore library instead of below if check
/*	mytaskforpost.forEach(function(item){
		if(todoId === item.id){
			matchedItem = item;
		}
	});*/
	matchedItem = _.findWhere(mytaskforpost,{id:todoId});
	if(matchedItem){
		res.json(matchedItem);
	}else{
		res.status(404).send();
	}
});

//Post Requests
app.post('/postmytasks', function(req,res){
	var body = req.body;
	body.id = taskid++;
	mytaskforpost.push(body);
	res.json(mytaskforpost);
});

app.post('/addrecord', function(req,res){
	db.collection('nkotharidb').save(req.body, function(err, result){
		if(err){return console.log(err);}
		console.log('saved to database');
		
		res.redirect('/');
	});
});

app.get('/getmyrecord', function(req,res){
	db.collection('nkotharidb').find().toArray(function(err, result){
		if(err){return console.log(err);}
		res.json(result);
	});
});

//Delete Requests
app.delete('/deletemytask/:id', function(req,res){
	var idToDelete = parseInt(req.params.id, 10);
	var matchedItem = _.findWhere(mytaskforpost,{id:idToDelete});
	if(matchedItem){
		mytaskforpost=_.without(mytaskforpost,matchedItem);
		res.json(mytaskforpost);
	}else{
		res.status(404).json({"error":"id not found"});
	}
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
