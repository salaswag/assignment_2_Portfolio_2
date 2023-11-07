let nodemailer = require('nodemailer');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// POST route from contact form
app.post('/send', (req, res) => {
  // Basic security check
  if(req.body.securityCheck !== '4') {
    res.send("Security check failed.");
    return;
  }

  // Creates a SMTP transporter object
  let transporter = nodemailer.createTransport({
    service: 'Outlook', 
    auth: {
      user: process.env.EMAIL, // my hidden email for security purposes
      pass: process.env.EMAIL_PASSWORD // my hidden password for security purposes
    }
  });

  // Message object
  let message = {
    from: process.env.EMAIL, // my hidden email
    to: process.env.EMAIL, // my hidden email
    subject: 'New Message from ' + req.body.email, // Includes user's email in subject
    text: 'Name: ' + req.body.name + '\nEmail: ' + req.body.email + '\nMessage: ' + req.body.comments,
    html: '<p><b>Name:</b> ' + req.body.name + '</p><p><b>Email:</b> ' + req.body.email + '</p><p><b>Message:</b> ' + req.body.comments + '</p>'
  };

  // sends mail with defined transport object
  transporter.sendMail(message, (error, info) => {
    if (error) {
      res.send("Error occurred.");
      console.log('Error occurred. ' + error.message);
      return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    res.send("Message sent successfully!");
  });
});

// catches 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // sets locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // renders the error page
  res.status(err.status || 500);
  res.render('error', 
  {
    title: "Error"
  }
  );
});

module.exports = app;