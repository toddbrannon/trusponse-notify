require('dotenv').config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const User = require("./models/user")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const flash = require("connect-flash")
const passportLocalMongoose = require("passport-local-mongoose")
const methodOverride = require("method-override")
const createError = require('http-errors')
const logger = require('morgan');


const port = process.env.PORT || 3000;

app.use(logger('dev'));

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(methodOverride("_method"));
app.use(flash());

app.use(bodyParser.urlencoded({extended: true}));
    
//seedDB();
    
// Requiring Routes ============================================================
const prospectsRoutes = require("./routes/prospects")
const indexRoutes = require("./routes/index")
const expandRoutes = require("./routes/expand_demo")
//==============================================================================

// MongoDB Atlas Prod

const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@trusponse.ugdwe.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`   

// Map global promises
mongoose.Promise = global.Promise;

// mongoose.connect("mongodb://localhost/trusponse_notify");
// Below updated 3/17/2021
const connection = mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
     })
    .then(() => console.log('connected to the trusponse-notify-demo mongodbatlas collection...'))
    .catch(err => console.log(err)
);

//==============================================================================
// PASSPORT CONFIGURATION
//==============================================================================
app.use(require("express-session")({
    secret:"The four horsemen of the apocolypse cometh!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//=  Routes  ===================================================================

app.use("/", indexRoutes);
app.use("/prospects", prospectsRoutes);
app.use("/expand_demo", expandRoutes);

app.listen(port, () => {
    console.log(`The server is running on port ${port}...`);
});