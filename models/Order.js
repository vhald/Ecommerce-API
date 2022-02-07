const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        products: [
            {
                productId: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1
                },
            },
        ],
        amount: { type: Number, required: true },
        // to get line one address, l2 address...
        address: { type: Object, required: true },
        status: { type: String, default: "Pending" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);