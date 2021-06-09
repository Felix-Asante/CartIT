let sql;
const DB = require("../config/dbConfig");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("paypal-node-sdk");

// * CONFIGURE PAYPAL
paypal.configure({
	mode: "sandbox", //sandbox or live
	client_id: process.env.PAYPAL_CLIENT_ID,
	client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// * REQUIRE NEW PAYPAL PAYMENT CONFIG
const newPayment = require("../config/paypal-newPayment-config");
// * Calculate total amount in cart
const calculateTotalOrder = require("../config/calculateTotalOrder");

const addCart = (req, res) => {
	const productId = req.params.id;

	sql =
		"SELECT productName,price,productPhoto FROM CartIt.Products WHERE productId=?";
	DB.query(sql, productId, (err, product) => {
		product[0].productId = productId;
		product[0].qty = 1;

		if (typeof req.session.cart == "undefined") {
			req.session.cart = [];
			req.session.cart.push(product[0]);
			console.log("cokies:", req.session);
			req.session.save();
		} else {
			req.session.cart.push(product[0]);
			console.log("cokies:", req.session);
			req.session.save();
		}
	});
	res.redirect("back");
};

// * CHECKOUT PAGE
const viewCart = (req, res) => {
	let user,
		total = 0;
	const cartItems = req.session.cart;
	total = calculateTotalOrder(cartItems);
	if (req.user) {
		user = req.user.firstName;
	}
	res.render("checkOut", { total, user });
};

// * REMOVE FROM CART
const removeFromCart = (req, res) => {
	const product = req.params.product;
	const totalCart = req.session.cart.length;

	for (let index = 0; index < totalCart; index++) {
		if (req.session.cart[index].productName.includes(product)) {
			req.session.cart.splice(index, 1);

			if (req.session.cart.length == 0) {
				delete req.session.cart;
			}

			req.session.save();
			break;
		}
	}
	//  console.log(req.session.cart)
	res.redirect("back");
};
// * UPDATE CART
const updateCart = (req, res) => {
	const quantity = Number(req.params.quantity);
	// const subTotal = req.params.subtotal
	const product = req.params.product;

	req.session.cart.forEach((item) => {
		if (item.productName.includes(product)) {
			item.qty = quantity;
		}
	});
	res.redirect("back");
};
// * CHECKOUT PAGE POST
const checkOutPage = (req, res) => {
	let total = 0;
	total = calculateTotalOrder(req.session.cart);
	res.render("CheckOutPage", {
		total,
		user: req.user.firstName,
		email: req.user.email,
	});
};

// * checkout form post
const checkOutPagePost = async (req, res) => {
	let total = 0;
	let charges, customer;
	const { stripeToken, address, tel, email } = req.body;
	const order = {
		Address: address,
		Telephone: tel,
		Date: new Date(),
		Customers_email: req.user.email,
	};

	// * SAVE CUSTOMER ORDER INTO DB
	req.session.cart.forEach((item) => {
		order.quantity = item.qty;
		order.Products_productId = item.productId;
		// amount +=Number(item.qty) * Number(item.price)

		sql = "INSERT INTO CartIt.orders SET ?";
		DB.query(sql, order, function (err, order) {
			if (err) {
				throw err;
			}
		});
	});

	// * CALCULATE TOTAL PURCHASE
	total = calculateTotalOrder(req.session.cart);

	// * CREATE CHARGES : DEDUCT FROM CUSTOMER CARD
	try {
		// * CREATE CUSTOMER
		customer = await stripe.customers.create({
			name: req.user.firstName,
			// phone:tel,
			email: email,
		});

		charges = await stripe.charges.create({
			amount: parseInt(total * 100),
			currency: "mad",
			description: "Purchase made on CartIt",
			receipt_email: email,
			source: stripeToken,
		});

		// * DELETE CART ITEMS
		delete req.session.cart;

		// res.status(200).render('paymentSuccess',{address,transaction:charges.id,amount})
		res.status(200).render("paymentSuccess", {
			address,
			transaction: charges.id,
			amount: total,
			type: "Card",
		});
	} catch (e) {
		res.status(500).render("404", { errorMessage: "Payment Failed !" });
	}
};

//* Paypal CHECKOUT
const paypalCheckOut = async (req, res) => {
	let total = calculateTotalOrder(req.session.cart);
	total = (total / 8.84).toFixed(2);

	//  REQUESTED USER ORDER DETAILS TO THE REQ LOCAL VARIABLES SO
	// THAT THEY CAN BE CATCH AT THE SUCESS ROUTE TO REGISTER
	// THE CUSTOMER INTO OUR DB
	req.body.total = total;
	req.session.paypalCheckout = [];
	req.session.paypalCheckout.push(req.body);
	const cart = [];
	req.session.cart.forEach((item) => {
		const order = {
			name: item.productName,
			sku: item.productName,
			price: (item.price / 8.84).toFixed(2),
			currency: "USD",
			quantity: item.qty,
		};
		cart.push(order);
	});
	const transaction = newPayment(cart, total);

	paypal.payment.create(transaction, function (error, payment) {
		if (error) {
			res.status(500).send(`Paypal payment failed ${error}`);
		} else {
			// console.log(payment)

			for (let i = 0; i < payment.links.length; i++) {
				if (payment.links[i].rel === "approval_url") {
					res.redirect(payment.links[i].href);
				}
			}
		}
	});
};

// * PAYPAL CHECKOUT SUCCESS
const checkOutSucess = (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: "USD",
					total: req.session.paypalCheckout.total,
				},
			},
		],
	};

	paypal.payment.execute(
		paymentId,
		execute_payment_json,
		function (error, payment) {
			if (error) {
				console.log(error.response);
				res.status(500).send("Transaction failed!");
			} else {
				const { address, tel, total, email } = req.session.paypalCheckout;
				const order = {
					Address: address,
					Telephone: tel,
					Date: new Date(),
					Customers_email: email,
				};

				req.session.cart.forEach((item) => {
					order.quantity = item.qty;
					order.Products_productId = item.productId;
					// amount +=Number(item.qty) * Number(item.price)

					sql = "INSERT INTO CartIt.orders SET ?";
					DB.query(sql, order, function (err, order) {
						if (err) {
							console.log(err);
							res.status(500).send("Internal error");
						}
					});
				});
				// * DELETE CART ITEMS
				delete req.session.cart;
				delete req.session.paypalCheckout;
				res.status(200).render("paymentSuccess", {
					address,
					transaction: payment.id,
					amount: total * 8.84,
					type: "Paypal",
				});
			}
		}
	);
};
// * PAYPAL CHECKOUT CANCELLED
const checkOutCancel = (req, res) => {
	res.send("CHECKOUT CANCELLED");
};

// * PRODUUCT DETAILLED VIEW
const productDetailView = (req, res) => {
	sql =
		"SELECT productName,price,productPhoto,description FROM Products WHERE productId=?";
	DB.query(sql, Number(req.query.product), function (err, product) {
		if (err) throw err;

		product[0].productId = req.query.product;

		if (req.session.cart) {
			req.session.cart.forEach((item) => {
				if (item.productName == product[0].productName) {
					product[0].status = true;
				}
			});
		}

		DB.query(
			"SELECT photo FROM ProductPhotos WHERE productId=?",
			Number(req.query.product),
			function (err, photos) {
				if (err) throw err;

				res.render("productDetailView", { product, photos });
			}
		);
	});
};

module.exports = {
	addCart,
	viewCart,
	removeFromCart,
	checkOutPage,
	checkOutPagePost,
	updateCart,
	paypalCheckOut,
	checkOutCancel,
	checkOutSucess,
	productDetailView,
};
