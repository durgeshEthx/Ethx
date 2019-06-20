var express = require('express');
var router = express.Router();
var User = require('../models/user');
var upload = require('./upload');
const PDF2Pic = require("pdf2pic");
var watermark = require('dynamic-watermark');
var path = require('path');
var PDFImage = require("pdf-image").PDFImage;
var converter = require('office-converter')();
var md5 = require('md5');
var sizeOf = require('image-size');
const image2base64 = require('image-to-base64');
const fs = require('fs');
var request = require('request');
var nodemailer = require("nodemailer");
var Recaptcha = require('express-recaptcha').RecaptchaV3;

var recaptcha = new Recaptcha('6LegEqkUAAAAAM26uqgIyMEXH5ujQDY53okuRKgB', '6LegEqkUAAAAAC3G_m7NXeWTCIOPH0Gfk2CmVUbo', { callback: 'cb' });

/*
	Here we are configuring our SMTP Server details.
	STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: "durgeshkmr4u@gmail.com",
		pass: "rnsqimcuthkawmnx"
	}
});
var rand, mailOptions, host, link;
/*------------------SMTP Over-----------------------------*/

router.get('/', function (req, res, next) {
	return res.render('index0.ejs', { captcha: recaptcha.render() });
});


router.post('/', function (req, res) {



	var personInfo = req.body;

	//res.send({"Success":"password is not matched"});
	//!personInfo.username ||
	if (!personInfo.email || !personInfo.password || !personInfo.passwordConf) {

		res.send();
	} else {

		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({ email: personInfo.email }, function (err, data) {
				if (!data) {

					var c;
					User.findOne({}, function (err, data) {
						console.log('err ' + err);
						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						} else {
							console.log('test2');
							c = 1;
						}

						var newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							//fullname: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function (err, Person) {
							if (err) {

								console.log('test0');
								console.log(err);
							}
							else
								console.log('Success');
						});

					}).sort({ _id: -1 }).limit(1);

					//var request = require('request');

					// request.post(
					// 	'https://www.google.com/recaptcha/api/siteverify',
					// 	{ json: { key: 'value' } },
					// 	function (error, response, body) {
					// 		if (!error && response.statusCode == 200) {
					// 			console.log(body);
					// 		}
					// 	}
					// );
					//res.send({"Success":"You are regestered,You can login now."});

					// g-recaptcha-response is the key that browser will generate upon form submit.
					//	if its blank or null means user has not selected the captcha, so return the error.
					// console.log('req.body ' + personInfo.passwordConf);
					// console.log(req.body['g-recaptcha-response-v3']);
					//       if(req.body['g-recaptcha-response-v3'] === undefined || req.body['g-recaptcha-response-v3'] === '' || req.body['g-recaptcha-response-v3'] === null) {
					//         return res.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
					//       }
					//       // Put your secret key here.	
					//       var secretKey = "6LegEqkUAAAAAC3G_m7NXeWTCIOPH0Gfk2CmVUbo​";
					//       // req.connection.remoteAddress will provide IP address of connected user.
					//       var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response-v3'] + "&remoteip=" + req.connection.remoteAddress;
					//       // Hitting GET request to the URL, Google will respond with success or error scenario.
					//       request(verificationUrl,function(error,response,body) {
					//         body = JSON.parse(body);
					//         console.log(body);
					//         // Success will be true or false depending upon captcha validation.
					//         if(body.success !== undefined && !body.success) {
					//           return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
					//         }

					//         console.log("ReCaptcha score: " + body.score);

					//         if(body.score >= 0.5) {
					//           console.log("body score"+body.score);
					//          // chaptcha_v3 = false;
					//           // Reload code here
					// 		 // res.sendFile(__dirname + '/index_v2.html');
					// 		 res.redirect('/login');
					// 		}
					// 		else{
					// 			console.log("body score"+body.score);
					// 		}
					// });


					// First I want to read the file
					// fs.readFile(appRoot+'/views/ui/email_activate.html', function read(err, data) {
					// 	if (err) {
					// 		throw err;
					// 	}

					const fp = appRoot + '/views/ui/email_activate.html';
					var data = fs.readFileSync(fp, 'utf8');
					var rand;

					// Invoke the next step here however you like
					//console.log('text' + text);   // Put all of the code here (not the best solution)
					const crypto = require('crypto');

					// crypto.randomBytes(64, (err, buf) => {
					// 	if (err) throw err;
					// 	console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
					// 	random = buf.toString('hex');
						
					// });
                   
					rand = crypto.randomBytes(64).toString('hex');;//Math.floor((Math.random() * 100) + 54);
					host = req.get('host');
					link = "http://" + req.get('host') + "/verify?id=" + rand;
					console.log('rand'+rand);
					var result = data.replace(/replacemee/g, link);
                    result = result.replace(/replacename/g, personInfo.username);
					// fs.writeFile(fp, result, 'utf8', function (err) {
					// 	if (err) return console.log(err);
					// });

					// fs.readFile(fp, 'utf8', function (err, data) {
					// 	if (err) {
					// 		return console.log(err);
					// 	} else {
					// 		text = data;
					// 	}
					// });
					//var text = fs.readFileSync(appRoot+'/views/ui/email_activate.html','utf8')
					mailOptions = {
						to: personInfo.email,
						subject: "Please confirm your Email account",
						html: "" + result + "<br>or<a href=" + link + ">Click here to verify</a>"
					}
					console.log(mailOptions);
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
							res.end("error");
						} else {
							console.log("Message sent: " + response.message);
							//res.end("sent");
							res.redirect('/login');
						}
					});
                    

					//res.redirect('/');
					//res.render(('emailver.ejs'))
				} else {
					console.log('test1');
					res.send({ "Success": "Email is already used." });
				}

			});
		} else {
			res.send({ "Success": "password is not matched" });
		}
	}
});
router.get('/verify', function (req, res) {
	console.log(req.protocol + ":/" + req.get('host'));
	if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
		console.log("Domain is matched. Information is from Authentic email");
		if (req.query.id == rand) {
			console.log("email is verified");
			res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
		}
		else {
			console.log("email is not verified");
			res.end("<h1>Bad Request</h1>");
		}
	}
	else {
		res.end("<h1>Request is from unknown source");
	}
});
router.get('/login', function (req, res, next) {
	return res.render('login0.ejs');
});

router.post('/login', function (req, res, next) {
	console.log(req.body);

	User.findOne({ email: req.body.email }, function (err, data) {
		if (data) {

			if (data.password == req.body.password) {
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				//console.log(req.session.userId);
				res.send({ "Success": "Success!" });

			} else {
				res.send({ "Success": "Wrong password!" });
			}
		} else {
			res.send({ "Success": "This Email Is not regestered!" });
		}
	});
});

router.get('/profile', function (req, res, next) {
	//console.log("profile");
	User.findOne({ unique_id: req.session.userId }, function (err, data) {
		//	console.log("data");
		//	console.log(data);
		if (!data) {
			res.redirect('/');
		} else {
			//console.log("found");
			return res.render('data.ejs', { "name": data.username, "email": data.email });
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
	res.render("forget0.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({ email: req.body.email }, function (err, data) {
		console.log(data);
		if (!data) {
			res.send({ "Success": "This Email Is not regestered!" });
		} else {
			// res.send({"Success":"Success!"});
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save(function (err, Person) {
					if (err)
						console.log(err);
					else
						console.log('Success');
					res.send({ "Success": "Password changed!" });
				});
			} else {
				res.send({ "Success": "Password does not matched! Both Password should be same." });
			}
		}
	});

});
// router.get('/signd', function (req, res) {
// 	// res.send('clicked');
// 	//	 res.send(req.body.parkName);
// 	res.render('signd.ejs');
// });

router.post('/signd', function (req, res) {
	var name = req.body.name;
	console.log("MYname : " + name);
	//random strings
	const crypto = require('crypto');

	crypto.randomBytes(64, (err, buf) => {
		if (err) throw err;
		console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
	});

	//list of dir
	// const directoryPath = path.join(appRoot, 'images');
	// //passsing directoryPath and callback function
	// fs.readdir(directoryPath, function (err, files) {
	// 	//handling error
	// 	if (err) {
	// 		return console.log('Unable to scan directory: ' + err);
	// 	}
	// 	//listing all files using forEach
	// 	files.forEach(function (file) {
	// 		// Do whatever you want to do with the file
	// 		// console.log(file); 
	// 	});
	// });




	const tmpimg = imgname + '_1.png';
	console.log('tmpimg'+tmpimg);
	var paths = path.join(appRoot, 'images', tmpimg);
	const despath = path.join(appRoot, 'views', 'images', imgname);
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
			logoX: dimensions.width - 220,
			logoY: dimensions.height - 60,
			logoHeight: 100,
			logoWidth: 100
		},
		textOption: {
			fontSize: 10, //In px default : 20
			color: '#AAF122' // Text color in hex default: #000000
		}
	};

	//optionsImageWatermark or optionsTextWatermark
	watermark.embed(optionsTextWatermark, function (status) {
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


	var imgpath = path.join('images', imgname);
	imgpath = imgpath + '.png';
	console.log('imgpath '+imgpath);
	res.render('signd.ejs',{imgpath:imgpath, name :name});
});

//any format -> pdf -> png
router.post('/upload', function (req, res) {
	console.log('approot' + appRoot);

	upload(req, res, (error) => {
		if (error) {
			//  console.log('ERROR '+error);
			// res.redirect('/profile');
			//  res.render('sign_document.ejs');
		} else {
			if (req.file == undefined) {
				//	  console.log(here);
				//res.redirect('/profile');
				//res.render('sign_document.ejs');

			} else {
				var filename = path.basename(path.join(appRoot, 'public', 'files', req.file.originalname), path.extname(req.file.originalname));
				global.imgname = filename;
					console.log(imgname);
				//	   console.log(req.file.originalname);
				const pdf2pic = new PDF2Pic({
					density: 100,           // output pixels per inch
					savename: filename,   // output file name
					savedir: "./images",    // output file location
					format: "png",          // output file format
					size: 600               // output size in pixels
				});



				pdf2pic.convertBulk(path.join(appRoot, 'public', 'files', req.file.originalname), -1).then((resolve) => {
							console.log("image converter successfully!");

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
	//res.redirect('back');
});


module.exports = router;