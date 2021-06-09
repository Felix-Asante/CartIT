const express = require("express");
const app = express();
const path = require("path");
const exphbs = require("express-handlebars");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const session = require("express-session");
const connectFlash = require("connect-flash");
const passport = require("passport");
const MYSQLStore = require("express-mysql-session")(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");

// * PRODUCTION ENVIRONMENT VARIABLES
const env = require("dotenv").config();

// * SEVER PORT
const PORT = process.env.PORT || 4000;
// * DB connection
const DB = require("./config/dbConfig");
// * static folder
app.use(express.static(path.join(__dirname, "/public/assets")));

// * body parser
app.use(bodyParser.urlencoded({ extended: true }));
// * template engine
const hbs = exphbs.create({
	helpers: {
		equal: function (arg1, arg2, options) {
			// console.log('arg1',arg1)
			// console.log('arg2',arg2)
			// console.log("output:",(arg1 == arg2) ? options.fn(this) : options.inverse(this))
			if (arg1 == arg2) return options.fn(this);
		},
		multiply: function (arg1, arg2) {
			return Number(arg1) * Number(arg2);
		},
	},
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// * express fileupload middleware
app.use(fileUpload({ useTempFiles: true }));

// * COOKIE PARSER
// app.use(cookieParser())

// // * CORS CONFIG
// app.use(cors({'credentials':true}))

// * CONNECT FLASH CONFIG
app.use(connectFlash());

// * STORE SESSION IN DATABASE
let DBCONFIG = {
	host: "localhost",
	user: "root",
	password: process.env.DB_LOCK,
	database: "CartIt",
};
// let sessionStore = new MYSQLStore(DBCONFIG)

// * express session config
app.use(
	session({
		name: "sid",
		path: "/",
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: new MYSQLStore(DBCONFIG),
		cookie: {
			maxAge: 1000 * 60 * 60 * 2,
			secure: false,
		},
	})
);

// * PASSPORT-google- config
const googleLogin = require("./config/passport-google-config");
googleLogin();

// * PASSPORT LOCAL AUTH
const LocalStrategy = require("./config/passport-local-config");
LocalStrategy();
app.use(passport.initialize());
app.use(passport.session());

// * Lanuch server
app.listen(PORT, () => {
	console.log("server ready");
});

// * MIDDLEWARE TO STORE CART ELEMENT
app.get("*", (req, res, next) => {
	res.locals.cart = req.session.cart;
	//   res.locals.admin = req.session.admin;
	next();
});
app.post("*", (req, res, next) => {
	res.locals.paypalCheckout = req.session.paypalCheckout;
	next();
});

// !======== Home page route ==============
app.get("/", (req, res) => {
	let user, email;
	DB.query(
		"SELECT productId,ProductName,price,productPhoto FROM CartIt.Products",
		function (err, products) {
			if (err) throw err;

			if (req.session.cart) {
				req.session.cart.forEach((item) => {
					products.forEach((product) => {
						if (product.ProductName == item.productName) {
							product.status = true;
						}
					});
				});
			}

			if (req.user) {
				user = req.user.firstName;
				email = req.user.email;
			}
			res.status(200).render("index", { products, user, email });
		}
	);
});

// * ========== ROUTES ============
app.use("/admin", require("./routes/admin"));
app.use("/user", require("./routes/clients"));
app.use("/cart", require("./routes/cart"));

// * =======404 routing========
app.get("*", (req, res) => {
	res.status(404).render("404", { errorMessage: "Page Not Found !" });
});
app.post("*", (req, res) => {
	res.status(404).render("404", { errorMessage: "Page Not Found !" });
});

// * ==========CLOUDINARY CONFIG ===============
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUDNAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});
