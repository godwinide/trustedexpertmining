const { model, Schema } = require("mongoose");

const HistorySchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        required: false
    },
    date: {
        type: Date,
        required: false,
        default: Date.now()
    }
});

module.exports = History = model("History", HistorySchema);