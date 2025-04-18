const mongoose = require("mongoose");

const InvoiceSchema = mongoose.Schema(
  {
    invoice_id: {
      type: Buffer, // Binary data
      required: true,
    },
    order_number: {
      type: String,
      required: true,
    },
    delivery_group_id: {
      type: Buffer, // Binary data
      required: true,
    },
    outlet_id: {
      type: String,
      required: true,
    },
    invoice_number: {
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
    status: {
      type: String,
      required: true,
    },
    custom_info: [
      {
        id: {
          type: String,
          required: true,
        },
        group: {
          type: String,
          required: true,
        },
        values: {
          type: [String],
          required: true,
        },
        additional_info: {
          type: Object,
          default: {},
        },
      },
    ],
    created_at: {
      type: Date,
      required: true,
    },
    invoice_terminal_number: {
      type: String,
      required: true,
    },
    order_source: {
      type: String,
      required: true,
    },
    customer: {
      audit: {
        created_at: {
          type: Date,
          required: true,
        },
        updated_at: {
          type: Date,
          required: true,
        },
      },
      fcm_id: {
        type: String,
        default: "",
      },
      gender: {
        type: String,
        default: "",
      },
      source: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      email_id: {
        type: String,
        default: "",
      },
      is_active: {
        type: Boolean,
        required: true,
      },
      custom_info: {
        type: Array,
        default: [],
      },
      customer_id: {
        type: String,
        required: true,
      },
      phone_number: {
        type: {
          type: String,
          required: true,
        },
        number: {
          type: String,
          required: true,
        },
        availability: {
          type: Boolean,
          required: true,
        },
        country_code: {
          type: String,
          required: true,
        },
      },
      customer_name: {
        type: String,
        required: true,
      },
      customer_type: {
        type: String,
        required: true,
      },
      date_of_birth: {
        type: String,
        default: "",
      },
      status_reason: {
        type: String,
        default: "",
      },
      customer_group: {
        type: String,
        required: true,
      },
      deactivated_at: {
        type: String,
        default: "",
      },
      is_b2b_customer: {
        type: Boolean,
        required: true,
      },
      is_proxy_number: {
        type: Boolean,
        required: true,
      },
      deactivated_reason_code: {
        type: String,
        default: "",
      },
      referred_customer_count: {
        type: Number,
        default: 0,
      },
    },
    payment: {
      total_amount: {
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
      payment_methods: [
        {
          amount: {
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
          psp_name: {
            type: String,
            required: true,
          },
          payment_method: {
            type: String,
            required: true,
          },
        },
      ],
    },
    consolidated_invoice_number: {
      type: String,
      required: true,
    },
    promo_discounts: {
      type: Array,
      default: [],
    },
    generate_pdf: {
      type: Boolean,
      required: true,
    },
  },
  { collection: "invoice", strict: false }
);

const InvoiceModel = mongoose.model("invoice", InvoiceSchema);

module.exports = {
  InvoiceModel,
};
