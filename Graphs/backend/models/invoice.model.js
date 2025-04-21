const mongoose = require("mongoose");

const InvoiceSchema = mongoose.Schema({
  invoice_id: {
    type: Buffer, // Binary data
    required: true,
  },
  outlet_id: {
    type: String,
    required: true,
  },
  invoice_date: {
    type: Date,
    required: true,
  },
  invoice_amount: {
    currency: {
      type: String,
      required: true,
    },
    fraction: {
      type: Number,
      required: true,
    },
    cent_amount: {
      type: Number,
      required: true,
    },
  },
  created_at: {
    type: Date,
    required: true,
  },
  store_order: {
    type: Boolean,
    required: true,
  },
  customer: {
    type: Buffer, // Binary data
    required: true,
  },
});

const InvoiceModel = mongoose.model("invoice", InvoiceSchema);

module.exports = {
  InvoiceModel,
};
