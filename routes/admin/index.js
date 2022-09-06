const router = require("express").Router();
const User = require("../../model/User");
const History = require("../../model/History");
const { ensureAdmin } = require("../../config/auth");
const sendEmail = require("../../tools/sendEmail2");

router.get("/", ensureAdmin, async (req, res) => {
    try {
        const customers = await User.find({ isAdmin: false });
        const history = await History.find({});
        const total_bal = customers.reduce((prev, cur) => prev + Number(cur.balance), 0);
        return res.render("admin/index", { layout: "admin/layout", pageTitle: "Welcome", customers, history, total_bal, req });
    }
    catch (err) {
        return res.redirect("/admin");
    }
});

router.get("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await User.findOne({ _id: id });
        return res.render("admin/editUser", { layout: "admin/layout", pageTitle: "Welcome", customer, req });
    }
    catch (err) {
        return res.redirect("/admin");
    }
});

router.post("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { balance, pending, pin, total_deposit, active_deposit, total_withdraw, account_plan, upgraded } = req.body;
        const customer = await User.findOne({ _id: id }).limit(10)
        if (!balance || !pin || !pending || !total_deposit || !upgraded || !active_deposit || !total_withdraw || !account_plan) {
            req.flash("error_msg", "Please fill all fields");
            return res.render("admin/editUser", { layout: "admin/layout", pageTitle: "Welcome", customer, req });
        }
        await User.updateOne({ _id: id }, { ...req.body });
        req.flash("success_msg", "account updated");
        return res.redirect("/admin/edit-user/" + id);
    }
    catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
});

router.get("/delete-account/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.redirect("/admin");
        }
        await User.deleteOne({ _id: id });
        return res.redirect("/admin");
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.get("/deposit", ensureAdmin, async (req, res) => {
    try {
        const customers = await User.find({});
        return res.render("admin/deposit", { layout: "admin/layout", pageTitle: "Deposit", customers, req });
    } catch (err) {
        return res.redirect("/admin")
    }
});

router.post("/deposit", ensureAdmin, async (req, res) => {
    try {
        const { amount, userID, debt } = req.body;
        if (!amount || !userID || !debt) {
            req.flash("error_msg", "Please provide all fields");
            return res.redirect("/admin/deposit");
        }
        const customer = await User.findOne({ _id: userID });
        const newHistData = {
            type: "Credit",
            userID,
            amount,
            account: customer.email
        }
        const newHist = new History(newHistData);
        await newHist.save();

        await User.updateOne({ _id: userID }, {
            balance: Number(customer.balance) + Number(amount),
            active_deposit: amount,
            debt,
            total_deposit: Number(customer.total_deposit) + Number(amount)
        });

        req.flash("success_msg", "Deposit successful");
        return res.redirect("/admin/deposit");

    } catch (err) {
        console.log(err);
        return res.redirect("/admin");
    }
})


router.get("/approve/:id", ensureAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const exists = await History.findOne({ _id: id });
        const user = await User.findOne({ email: exists.userID });
        if (exists) {
            await History.updateOne({ _id: exists.id }, {
                status: "approved"
            });
            await User.updateOne({ email: exists.userID }, {
                pending: Number(user.pending) - Number(exists.amount),
                total_withdraw: Number(user.total_withdraw) + Number(exists.amount)
            });
            sendEmail(exists.amount, user.email)
            req.flash("success_msg", "Transaction approved successfully.");
            res.redirect("/admin");
        }
    } catch (err) {
        console.log(err)
        return res.redirect("/admin")
    }
});

module.exports = router;