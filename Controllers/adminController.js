const cloudinary = require("cloudinary").v2;
const DB = require("../config/dbConfig");
const bcrypt = require("bcryptjs");

let sql;

// * ADMIN LOGIN PAGE  : GET
const adminLogin = (req, res) => {
	res.status(200).render("login", {
		title: "Admin Login",
		display: "none",
		action: "/admin/login",
	});
};
// * ADMIN LOGIN PAGE  : POST
const adminLoginPost = (req, res) => {
	const { username, password } = req.body;
	sql = "SELECT * FROM CartIt.Workers WHERE userName = ?";

	DB.query(sql, username, async function (err, worker) {
		if (err) {
			res.status(500).send("INTERNAL ERROR!!");
		}
		if (worker.length <= 0) {
			req.flash("login", "No user with this account was found");
			res.redirect("back");
		}
		if (await bcrypt.compare(password, worker[0].password)) {
			req.session.admin = worker[0];
			res.redirect("/admin/");
		} else {
			req.flash("login", "Invalid password");
			res.redirect("back");
		}
	});
};

// * @ DESC : DISPLAY ADMIN DASHBOARD HANDLER
const displayDashboard = (req, res) => {
	sql = " SELECT count(productId) as numberofproduct FROM CartIt.Products";
	DB.query(sql, function (err, count) {
		if (err) throw err;

		// * SELECT DISTINCT USER ORDERS
		const sql3 =
			"SELECT  Customers_email,status,price,productPhoto,productName,productId FROM orders JOIN Products USING(productId) HAVING status='New' ORDER BY orderId DESC LIMIT 4";
		DB.query(sql3, function (err, order) {
			if (err) {
				throw err;
			}
			const recentorders = [order[0]];
			order.forEach(function (order) {
				recentorders.forEach((item) => {
					if (!item.Customers_email.includes(order.Customers_email)) {
						recentorders.push(order);
					}
				});
			});

			res.render("adminDashboard", {
				test: true,
				numberofproduct: count[0].numberofproduct,
				recentorders,
			});
		});
	});
};
// * @DESC ADD NEW CATEGORY: GET
const createCategory = (req, res) => {
	res.render("adminDashboard", {
		category: true,
		message: req.flash("success"),
	});
};
// * @desc add new category: POST
const createCategoryPost = (req, res) => {
	const category = { category: req.body.category };
	DB.query(
		"INSERT INTO CartIt.Categories SET ?",
		category,
		function (err, rows) {
			if (err) throw err;
		}
	);

	req.flash("success", "Category created");
	res.redirect("/admin/add/newcategory");
};
// * EDIT CATEGORY:GET
const editCategory = (req, res) => {
	const head = ["ID", "Category"];
	DB.query("SELECT * FROM CartIt.Categories", function (err, categorydata) {
		if (err) throw err;

		res.render("adminDashboard", { editcategory: true, head, categorydata });
	});
};
// * UPDATE CATEGORY: GET
const updateCategory = (req, res) => {
	sql = "SELECT * FROM CartIt.Categories WHERE categoryId = ?";

	DB.query(sql, Number(req.query.categoryId), function (err, categoryItem) {
		if (err) throw err;

		res.render("adminDashboard", { updatecategory: true, categoryItem });
	});
};
// * UPDATE CATEGORY : POST
const updateCategoryPost = (req, res) => {
	sql = "UPDATE CartIt.Categories SET ? WHERE categoryId=?";
	DB.query(sql, [req.body, Number(req.query.categoryid)], (err, result) => {
		if (err) throw err;
		req.flash("category", "Category updated ....");
		res.redirect("/admin/category/edit/editcategory");
	});
};

// * DELETE Category:GET
const deleteCategory = (req, res) => {
	sql = "DELETE FROM CartIt.Categories WHERE categoryId=?";
	DB.query(sql, Number(req.query.categoryId), (err, result) => {
		if (err) throw err;
		res.redirect("/admin/category/edit/editcategory");
	});
};
// * @DESC ADD NEW PRODUCT GET
const addNewProduct = (req, res) => {
	DB.query("SELECT * FROM CartIt.Categories", function (err, Categories) {
		if (err) throw err;
		res.render("adminDashboard", {
			product: true,
			Categories,
			message: req.flash("product"),
		});
	});
};

// * @DESC ADD NEW PRODUCT POST
const addNewProductPost = (req, res) => {
	const product = {
		productName: req.body.productname,
		price: req.body.price,
		description: req.body.description,
		Categories_categoryId: req.body.category,
	};
	cloudinary.uploader.upload(req.files.photo.tempFilePath, (err, photo) => {
		if (err) throw err;
		product.productPhoto = photo.url;

		DB.query("INSERT INTO CartIt.Products SET ?", product, (err, result) => {
			if (err) throw err;

			req.flash("product", "Product added...");

			res.redirect("/admin/add/newproduct");
		});
	});
};

// * DESC EDIT PRODUCT : GET
const editProduct = (req, res) => {
	const head = ["Id", "Photo", "Product Name", "price", "", ""];
	DB.query(
		"SELECT productId,ProductName,price,productPhoto FROM CartIt.Products",
		function (err, row) {
			if (err) throw err;
			const productsize = row.length;
			res.render("adminDashboard", { editproduct: true, head, row });
		}
	);
};

// * UPDATE PRODUCT : GET
const updateproduct = (req, res) => {
	const productId = parseInt(req.query.product);
	sql =
		"SELECT productId,productName,price,productPhoto,description FROM CartIt.Products WHERE productId = ?";
	DB.query(sql, productId, function (err, product) {
		if (err) throw err;

		item = product;
		DB.query("SELECT * FROM CartIt.Categories", function (err, category) {
			if (err) throw err;

			let cart = category;

			res.render("adminDashboard", { updateproduct: true, item, cart });
		});
	});
};

// * UPDATE PRODUCT POST : POST
const updateproductPost = (req, res) => {
	const productId = parseInt(req.query.product);
	const product = {
		productName: req.body.productname,
		price: req.body.price,
		description: req.body.description,
		Categories_categoryId: req.body.category,
	};

	if (req.files == null) {
		product.productPhoto = req.query.photo;
		DB.query(
			"UPDATE CartIt.Products SET ? WHERE productId=? ",
			[product, productId],
			(err, newproduct) => {
				if (err) throw err;
				res.redirect("/admin/product/edit/editproduct");
			}
		);
	} else {
		const absolutePath = req.query.photo.split("/");
		const public_id = absolutePath[absolutePath.length - 1]
			.toString()
			.split(".")[0];
		console.log(public_id);
		cloudinary.uploader.destroy(public_id, (err, photo) => {
			if (err) throw err;
		});

		cloudinary.uploader.upload(
			req.files.photo.tempFilePath,
			(err, newphoto) => {
				if (err) throw err;
				product.productPhoto = newphoto.url;

				DB.query(
					"UPDATE CartIt.Products SET ? WHERE productId =?",
					[product, productId],
					(err, newproduct) => {
						if (err) throw err;
						res.redirect("/admin/product/edit/editproduct");
					}
				);
			}
		);
	}
};

// * DELETE PRODUCT : GET
const deleteProduct = (req, res) => {
	const productId = parseInt(req.query.product);
	const absolutePath = req.query.photourl.split("/");
	const public_id = absolutePath[absolutePath.length - 1]
		.toString()
		.split(".")[0];
	sql = "DELETE FROM CartIt.Products WHERE productId=?";

	cloudinary.uploader.destroy(public_id, function (err, item) {
		if (err) throw err;
	});

	DB.query(sql, productId, function (err, row) {
		if (err) throw err;
		res.redirect("/admin/product/edit/editproduct");
	});
};

// * ADD EXTRA PHOTO : GET
const addExtraPhoto = (req, res) => {
	sql = "SELECT photo FROM CartIt.ProductPhotos WHERE productId=?";

	console.log(req.query.product);
	DB.query(sql, Number(req.query.product), function (err, extraphotos) {
		if (err) throw err;
		console.log(extraphotos);

		res.render("adminDashboard", {
			extraphoto: true,
			productId: req.query.product,
			extraphotos,
		});
	});
};

// * ADD EXTRA PHOTO : POST
const addExtraPhotoPost = (req, res) => {
	sql = "INSERT INTO CartIt.ProductPhotos SET ?";

	let extraphoto = { Products_productId: Number(req.query.productid) };
	cloudinary.uploader.upload(
		req.files.photo.tempFilePath,
		function (err, photo) {
			if (err) throw err;
			extraphoto.photo = photo.url;

			DB.query(sql, extraphoto, function (err, row) {
				if (err) throw err;
			});
		}
	);
	res.redirect("back");
};
// * CREATE WORKER : GET
const createWorker = (req, res) => {
	res.render("adminDashboard", { createEmployee: true });
};
// * CREATE WORKER : POST
const createWorkerPost = async (req, res) => {
	sql = "INSERT INTO CartIt.Workers SET ?";
	const worker = { userName: req.body.username, role: req.body.role };
	worker.password = await bcrypt.hash(req.body.password, 10);

	DB.query(sql, worker, function (err, row) {
		if (err) {
			console.log(err);
			res.status(500).send("Couldn't create Worker");
		} else {
			res.redirect("back");
		}
	});
};

// * EDIT WORKER PAGE
const editWorkers = (req, res) => {
	DB.query("SELECT * FROM CartIt.Workers", function (err, workers) {
		if (err) {
			console.log(err);
			res.status(500).send("INTERNAL ERROR, TRY AGAIN");
		}
		res.render("adminDashboard", { editEmployee: true, workers });
	});
};

const deleteWorker = (req, res) => {
	const workerId = req.query.employee;
	DB.query(
		"DELETE FROM CartIt.Workers WHERE idWorkers=?",
		workerId,
		function (err, row) {
			if (err) {
				console.log(err);
				res.send("FAIL TO DELETE WORKER");
			}
			res.redirect("back");
		}
	);
};
// * VIEW ORDERS
const viewOrders = (req, res) => {
	sql =
		"SELECT  Customers_email,status,price,productPhoto,productName,productId FROM orders JOIN Products USING(productId) HAVING status='New' ORDER BY orderId DESC";
	DB.query(sql, function (err, order) {
		if (err) {
			throw err;
		}
		const recentorders = [order[0]];

		order.forEach(function (order) {
			recentorders.forEach((item) => {
				if (!item.Customers_email.includes(order.Customers_email)) {
					recentorders.push(order);
				}
			});
		});

		res.render("adminDashboard", { orders: true, recentorders });
	});
};
// * VIEW ORDERS DETAIL PAGE
const OrderDetails = (req, res) => {
	sql =
		"SELECT orderId,quantity,price,productPhoto,productName,productId,Address,Telephone,Date,Customers_email FROM CartIt.orders JOIN Products USING(productId) WHERE Customers_email =? AND status =? ";
	DB.query(sql, [req.params.client, "New"], (err, products) => {
		if (err) {
			console.error(err);
			res.send("INTERNAL ERROR");
		} else {
			res.render("adminDashboard", {
				orderdetails: true,
				products,
				email: products[0].Customers_email,
			});
		}
	});
};
// *DELIVER PRODUCT
const deliverOrder = (req, res) => {
	const { productid, orderid } = req.params;
	sql = "UPDATE orders SET status = ? WHERE productId=? AND orderId=?";

	DB.query(sql, ["Delivered", productid, orderid], (err, row) => {
		if (err) {
			console.log(err);
			res.send("INTERNAL ERROR");
		} else {
			res.redirect("back");
		}
	});
};
module.exports = {
	displayDashboard,
	createCategory,
	createCategoryPost,
	addNewProduct,
	addNewProductPost,
	editProduct,
	updateproduct,
	updateproductPost,
	deleteProduct,
	addExtraPhoto,
	addExtraPhotoPost,
	editCategory,
	updateCategory,
	updateCategoryPost,
	deleteCategory,
	adminLogin,
	adminLoginPost,
	createWorker,
	createWorkerPost,
	editWorkers,
	deleteWorker,
	viewOrders,
	OrderDetails,
	deliverOrder,
};
