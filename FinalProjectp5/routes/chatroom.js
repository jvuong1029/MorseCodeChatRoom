var express = require("express");
var router = express.Router();

/* GET chatroom page. */
router.get("/", function (req, res, next) {
	res.render("chatroom", { page: "Chatroom", menuId: "chatroom" });
});

module.exports = router;
