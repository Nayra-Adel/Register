var express=require("express");
var bodyParser=require('body-parser');
var session = require('express-session');

var connection = require('./DB/config');

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

var authenticateController        =require('./Controller/authenticate');
var userRegisterController        =require('./Controller/user-register');
var hrRegisterController          =require('./Controller/hr-register');
var userController                =require('./Controller/userCV');
var userApprovedCVController      =require('./Controller/approvedCV');
var userRejectedCVController      =require('./Controller/rejectedCV');
var userExamController            =require('./Controller/userExam');
var userAnswersController         =require('./Controller/userAnswers');
var showUserAnswersController     =require('./Controller/showUserAnswers');
var hrSearchController            =require('./Controller/hr-search');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({secret:"nayraaaaaaaa", resave:false, saveUninitialized:true}));

app.get('/register_hr',   function (req, res) { res.render("register_hr.ejs"); }) 
app.get('/register_user', function (req, res) { res.render("register_user.ejs"); }) 
app.get('/login',         function (req, res) { res.render("login.ejs"); })  
app.get('/config.js',     function (req, res) { res.render("config.js"); })  

app.get('/See_all_cvs', function (req, res) {  
  ssn = req.session;
  if(ssn.email) {
       res.render("see_cv.ejs", {
          welcome: ssn.username,
          cv_and_names: ssn.cvs_names
       });  
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
}); 

app.get('/users_answers', function (req, res) {  
  ssn = req.session;
  if(ssn.email) {
       res.render("see_users_answers.ejs", {
          welcome: ssn.username,
          users_answers: ssn.show_users_answers
       });  
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
}); 

app.get('/show_exam', function (req, res) {  
  ssn = req.session;
  if(ssn.email) {
    var link = "exam";
    if(ssn.user_approval == 0){link = ""}
       res.render("show_exam.ejs", {
          welcome: ssn.username,
          exam_link: link
       });  
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
}); 

app.post("/answers/save", function(req,res){
  console.log('Post answers: ' + JSON.stringify(req.body));
  ssn = req.session;
  ssn.answer1 = req.body.answer1;
  ssn.answer2 = req.body.answer2;
  ssn.answer3 = req.body.answer3;

  var answers= {};
  return res.send(answers);
});

app.post("/checkname", function(req,res){
  console.log('Post name: ' + JSON.stringify(req.body));

  var check;
  ssn = req.session;
  ssn.username = req.body.name;
  ssn.phone = req.body.phone;
  ssn.email = req.body.email;
  ssn.password = req.body.pass;
  ssn.cv = req.body.cv;
   
  connection.query('SELECT * FROM user WHERE username = ?',[req.body.name], function (error, results) {
    if (error) {
        res.json({
          status:false,
          message:'there are some error with query'
          })  

    }else{
      if (results.length >0) {
          check = "true";
          return res.send(check);
      }else{
           check = "false";
          return res.send(check);       
      }
    }
  });
});

app.get('/exam', function (req, res) {  
  ssn = req.session;
  if(ssn.email) {
       res.render("exam.ejs", {
          welcome: ssn.username,
          questions: ssn.question_list,
          wrong_answers: ssn.wrong_answers
       });  
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
}); 

app.get('/HR-Home',function(req,res){
  ssn = req.session;
  if(ssn.email) {
       res.render("hr.ejs", {
          welcome: ssn.username
       } );  
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
});

app.get('/User-Home', function (req, res) {  
  ssn = req.session;
  if(ssn.email) {
       res.render("user.ejs", {
          welcome: ssn.username
       } ); 
  } else {
    res.write('<h1>login first.</h1>');
    res.end('<a href="/welcome">Login</a>');
  }
})  

app.get('/welcome',function(req,res){
  req.session.destroy(function(err) {
    if(err) { console.log(err); } 
    else { res.render("welcome.ejs"); }
  });
});

/* route to handle login and registration */
app.post('/api/userRegister',userRegisterController.candidateRegister);
app.post('/api/hrRegister'  ,hrRegisterController.hrRegister);
app.post('/api/authenticate',authenticateController.authenticate);

app.post('/api/userCV'               ,userController.see_user_cv);
app.post('/api/approvedCV'           ,userApprovedCVController.approved);
app.post('/api/rejectedCV'           ,userRejectedCVController.rejected);

app.post('/api/showUserAnswers'      ,showUserAnswersController.see_user_answers);
app.post('/api/hrSearch'             ,hrSearchController.search);
app.post('/api/userExam'             ,userExamController.show_exam);
app.post('/api/getAnswer'            ,userAnswersController.answers);
 
app.post('/Controller/user-register' ,userRegisterController.candidateRegister);
app.post('/Controller/hr-register'   ,hrRegisterController.hrRegister);
app.post('/Controller/authenticate'  ,authenticateController.authenticate);

app.post('/Controller/userCV'        ,userController.see_user_cv);
app.post('/Controller/approvedCV'    ,userApprovedCVController.approved);
app.post('/Controller/rejectedCV'    ,userRejectedCVController.rejected);

app.post('/Controller/showUserAnswers',showUserAnswersController.see_user_answers);
app.post('/Controller/hrSearch'       ,hrSearchController.search);
app.post('/Controller/userExam'       ,userExamController.show_exam);
app.post('/Controller/getAnswer'      ,userAnswersController.answers);

app.listen(8012);