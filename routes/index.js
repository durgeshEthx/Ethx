var express = require('express');
var router = express.Router();
var User = require('../models/user');
var upload = require('./upload');
const PDF2Pic = require("pdf2pic");
var watermark = require('dynamic-watermark');
var path = require('path');
var PDFImage = require("pdf-image").PDFImage;
var converter = require('office-converter')( );
var md5 = require('md5');
var sizeOf = require('image-size');
const image2base64 = require('image-to-base64');
const fs = require('fs');


router.get('/', function (req, res, next) {
	return res.render('index.ejs');
});


router.post('/', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;

//!personInfo.username ||
	if(!personInfo.email ||  !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							// username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);

	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	//console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('data.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

router.get('/sign_document',function(req,res){
	 
	console.log('url : '+req.body.name);
	//random strings
	const crypto = require('crypto');

	crypto.randomBytes(64, (err, buf) => {
		if (err) throw err;
		//console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
	});

//list of dir
const directoryPath = path.join(appRoot, 'images');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
       // console.log(file); 
    });
});




const tmpimg = imgname +'_1.png';
//console.log('tmpimg'+tmpimg);
var paths = path.join(appRoot,'images',tmpimg);
const despath = path.join(appRoot,'views','images',imgname);
var dimensions = sizeOf(paths);
//console.log(dimensions.width, dimensions.height);
//console.log(md5('smlabs' + Date.now() + 'ethx'));
//create watermark in image
//console.log(__dirname);
var optionsTextWatermark = {
	type: "text",
	text: md5('smlabs' + Date.now() + 'ethx'), // This is optional if you have provided text Watermark
	destination: despath + '.png',
	source: paths,
	position: {
			logoX : dimensions.width - 220,
			logoY : dimensions.height - 60,
			logoHeight: 100,
			logoWidth: 100
	},
	textOption: {
			fontSize: 10, //In px default : 20
			color: '#AAF122' // Text color in hex default: #000000
	}
};

//optionsImageWatermark or optionsTextWatermark
watermark.embed(optionsTextWatermark, function(status) {
	//Do what you want to do here
	//console.log(status);
});


// image2base64('output.png') // you can also to use url
//     .then(
//         (response) => {
// 			//global.imgbase64 = response;
// 		//	app.locals.b64 = response;
//           //  console.log(response); //cGF0aC90by9maWxlLmpwZw==
//         }
//     )
//     .catch(
//         (error) => {
//             console.log(error); //Exepection error....
//         }
//     )
vccxcz

	var imgpath = path.join('images',imgname);
	imgpath = imgpath +'.png';
	//console.log('imgpath '+imgpath);
     res.render('sign_document.ejs',{imgname:imgpath});
});

//any format -> pdf -> png
router.post('/upload', function(req, res) {
console.log('approot'+appRoot);

	upload(req, res,(error) => {
		if(error){
		//  console.log('ERROR '+error);
		 // res.redirect('/profile');
		//  res.render('sign_document.ejs');
		}else{
		  if(req.file == undefined){
		//	  console.log(here);
			//res.redirect('/profile');
				//res.render('sign_document.ejs');
  
		  }else{
			var filename = path.basename(path.join(appRoot,'public','files',req.file.originalname), path.extname(req.file.originalname));
		     global.imgname = filename;
			//	console.log(filename);
		//	   console.log(req.file.originalname);
			   const pdf2pic = new PDF2Pic({
				density: 100,           // output pixels per inch
				savename:filename,   // output file name
				savedir: "./images",    // output file location
				format: "png",          // output file format
				size: 600               // output size in pixels
			});
			 
			
			
			pdf2pic.convertBulk(path.join(appRoot,'public','files',req.file.originalname),-1).then((resolve) => {
		//		console.log("image converter successfully!");
			   
				return resolve;
			  });

	


		

			  /**
			   * Create new record in mongoDB
			   */
			//   var fullPath = "files/"+req.file.filename;
			  
			//   var d = {
			// 	path:     fullPath
				
			//   };
			 
			// var doc = new Document(d); 
		  
			// doc.save(function(error){
			//   if(error){ 
			// 	throw error;
			//   } 
			// 	res.render('sign_document.ejs');
		  //  });
			}
		 
			}
	});    
  });
  
  
module.exports = router;