const mongoose = require("mongoose");

const InvoiceLineSchema = mongoose.Schema({
  invoice_line_id: {
    type: Buffer, // Binary data
    required: true,
  },
  sku_code: {
    type: String,
    required: true,
  },
  quantity: {
    quantity_uom: {
      type: String,
      required: true,
    },
    quantity_number: {
      type: Number,
      required: true,
    },
  },
  unit_price: {
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
  invoice_id: {
    type: Buffer, // Binary data
    required: true,
  },
  sku_title: {
    type: String,
    required: true,
  },
});

const InvoiceLineModel = mongoose.model("invoice_line", InvoiceLineSchema);

module.exports = {
  InvoiceLineModel,
};
