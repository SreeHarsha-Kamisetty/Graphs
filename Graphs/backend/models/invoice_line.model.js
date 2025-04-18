const mongoose = require("mongoose");

const InvoiceLineSchema = mongoose.Schema({
  invoice_line_id: {
    type: Buffer, // Binary data
    required: true,
  },
  order_line_id: {
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
  tax_code: {
    type: String,
    required: true,
  },
  taxes: {
    type: Array,
    default: [],
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
  has_packs: {
    type: Boolean,
    required: true,
  },
  mrp: {
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
  invoice_line_unit_allocation: {
    type: Array,
    default: [],
  },
  is_weighed_item: {
    type: Boolean,
    required: true,
  },
});

const InvoiceLineModel = mongoose.model("invoice_line", InvoiceLineSchema);

module.exports = {
  InvoiceLineModel,
};
