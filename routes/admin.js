const express = require("express");
const router = express.Router();

// * IMPORT ADMIN CONTROLLER
const adminController = require("../Controllers/adminController");
const auth = require("../middleware/authentication");

//  * ADMIN LOGIN PAGE
router.get("/login", auth.checkAdminAuth, adminController.adminLogin);
router.post("/login", adminController.adminLoginPost);
//  * @DESC DISPLAY ADMIN DASHBOARD
//  * METHOD GET /admin/
router.get("/", auth.authenticateAdmin, adminController.displayDashboard);

//  * DISPLAY ADD NEW CATEGORY PAGE
//  * METHOD GET /admin/add/newcategory
router.get(
	"/add/newcategory",
	auth.authenticateAdmin,
	adminController.createCategory
);

//  * SAVE NEW CATEGORY
//  * METHOD POST /admin/add/newcategory
router.post("/add/newcategory", adminController.createCategoryPost);
// * EDIT CATEGORY PAGE: GET
router.get("/category/edit/editcategory", adminController.editCategory);
// * UPDATE CATEGORY : GET
router.get(
	"/category/edit/updatecategory",
	auth.authenticateAdmin,
	adminController.updateCategory
);
// * UPDATE CATEGORY : POST
router.post(
	"/category/edit/updatecategory",
	adminController.updateCategoryPost
);
// * DELETE Category
router.get(
	"/category/edit/deletecategory",
	auth.authenticateAdmin,
	adminController.deleteCategory
);
// * @DESC ADD NEW PRODUCT
// * METHOD GET admin/new/newproduct
router.get(
	"/add/newproduct",
	auth.authenticateAdmin,
	adminController.addNewProduct
);
// * @DESC ADD NEW PRODUCT
// * METHOD POST admin/new/newproduct
router.post("/add/newproduct", adminController.addNewProductPost);
// * @DESC EDIT  PRODUCT
// * METHOD GET product/edit/editproduct
router.get(
	"/product/edit/editproduct",
	auth.authenticateAdmin,
	adminController.editProduct
);
// * UPDATE PRODUCT : GET
router.get(
	"/product/edit/updateproduct",
	auth.authenticateAdmin,
	adminController.updateproduct
);
router.post("/product/edit/updateproduct", adminController.updateproductPost);
// * DELETE PRODUCT : GET
router.get(
	"/product/edit/deleteproduct",
	auth.authenticateAdmin,
	adminController.deleteProduct
);
// * ADD EXTRA PHOTOS : GET
router.get(
	"/product/edit/addextraphotos",
	auth.authenticateAdmin,
	adminController.addExtraPhoto
);
router.post("/product/edit/addextraphotos", adminController.addExtraPhotoPost);
// * CREATEADMIN : GET
router.get(
	"/add/employee",
	auth.authenticateAdmin,
	adminController.createWorker
);
router.post("/add/employee", adminController.createWorkerPost);
// * EDIT WORKER PAGE
router.get("/edit/employee", adminController.editWorkers);
// * DELETE WORKER
router.get("/employee/edit/deleteemployee", adminController.deleteWorker);
// * VIEW ALL ORDERS
router.get("/orders", adminController.viewOrders);
// * ORDER DETAILS
router.get("/view/order/:productid/:client", adminController.OrderDetails);
// * DELIVER ORDER
router.get(
	"/order/delivered/:productid/:orderid",
	adminController.deliverOrder
);
module.exports = router;
