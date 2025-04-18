const express = require("express");
const InvoiceRouter = express.Router();
const { InvoiceModel } = require("../models/invoice.model");
const { InvoiceLineModel } = require("../models/invoice_line.model");

InvoiceRouter.post("/", async (req, res) => {
  try {
    let newInvoice = new InvoiceModel(req.body);
    await newInvoice.save();
    res.status(201).json({ Message: "Invoice created successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ Error: "Error while creating invoice" });
  }
});
InvoiceRouter.get("/", async (req, res) => {
  try {
    const { outlet_id } = req.query;
    const query = {};

    if (outlet_id) {
      query.outlet_id = outlet_id;
    }
    let invoiceDetails = await InvoiceModel.find(query).limit(10);
    const transformedData = invoiceDetails.map((invoice) => {
      const { order_number, invoice_amount, outlet_id } = invoice;

      const order_amount = (
        invoice_amount.cent_amount / invoice_amount.fraction
      ).toFixed(2);
      return {
        order_number,
        order_amount,
        outlet_id,
      };
    });

    res.status(200).json(transformedData);
  } catch (error) {
    console.log(error);
    res.status(400).json({ Error: "Error while getting invoice details" });
  }
});

InvoiceRouter.get("/grouped", async (req, res) => {
  try {
    const { groupBy, outlet_id } = req.query; // groupBy can be 'daily', 'weekly', or 'monthly'

    // Define the date format based on the grouping type
    let dateFormat;
    if (groupBy === "daily") {
      dateFormat = "%Y-%m-%d"; // Group by day
    } else if (groupBy === "monthly") {
      dateFormat = "%Y-%m"; // Group by month
    } else {
      return res.status(400).json({ Error: "Invalid groupBy parameter" });
    }

    // MongoDB aggregation pipeline
    const pipeline = [];
    if (outlet_id) {
      pipeline.push({
        $match: { outlet_id: outlet_id },
      });
    }
    pipeline.push({
      $addFields: {
        invoice_date_converted: {
          $dateFromString: { dateString: "$invoice_date" }, // Convert string to Date
        },
      },
    });

    pipeline.push({
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$invoice_date_converted",
          },
        },
        totalAmount: {
          $sum: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        }, // Sum of invoice amounts (calculated)
        count: { $sum: 1 }, // Count of invoices
        avgAmount: {
          $avg: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        },
      },
    });

    pipeline.push({ $sort: { _id: 1 } });
    if (groupBy === "daily") {
      pipeline.push({
        $project: {
          day: {
            $dateToString: {
              format: "%b %d %Y", // Format to "Feb 1 2025"
              date: {
                $dateFromString: { dateString: "$_id" }, // Convert `_id` back to Date
              },
            },
          },
          totalAmount: 1, // Include totalAmount in the output
          count: 1, // Include count in the output
          avgAmount: 1,
        },
      });
    }

    if (groupBy === "monthly") {
      pipeline.push({
        $project: {
          day: {
            $dateToString: {
              format: "%b %Y", // Format to "Feb 1 2025"
              date: {
                $dateFromString: { dateString: "$_id" }, // Convert `_id` back to Date
              },
            },
          },
          totalAmount: 1, // Include totalAmount in the output
          count: 1, // Include count in the output
          avgAmount: 1,
        },
      });
    }
    const groupedData = await InvoiceModel.aggregate(pipeline);

    res.status(200).json(groupedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Error while grouping invoice data" });
  }
});
InvoiceRouter.get("/grouped/week", async (req, res) => {
  try {
    const { outlet_id } = req.query; // groupBy can be 'daily', 'weekly', or 'monthly'

    // Define the date format based on the grouping type
    const dateFormat = "%Y-%U";

    // MongoDB aggregation pipeline
    const pipeline = [];
    if (outlet_id) {
      pipeline.push({
        $match: { outlet_id: outlet_id },
      });
    }
    pipeline.push({
      $addFields: {
        invoice_date_converted: {
          $dateFromString: { dateString: "$invoice_date" }, // Convert string to Date
        },
      },
    });

    pipeline.push({
      $group: {
        _id: {
          isoWeekYear: { $isoWeekYear: "$invoice_date_converted" },
          isoWeek: { $isoWeek: "$invoice_date_converted" },
        },
        totalAmount: {
          $sum: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        },
        avgAmount: {
          $avg: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        },
        count: { $sum: 1 },
      },
    });

    pipeline.push({
      $project: {
        weekStart: {
          $dateToString: {
            format: "%b %d",
            date: {
              $dateFromParts: {
                isoWeekYear: "$_id.isoWeekYear",
                isoWeek: "$_id.isoWeek",
                isoDayOfWeek: 1,
              },
            },
          },
        },
        weekEnd: {
          $dateToString: {
            format: "%b %d",
            date: {
              $dateFromParts: {
                isoWeekYear: "$_id.isoWeekYear",
                isoWeek: "$_id.isoWeek",
                isoDayOfWeek: 7,
              },
            },
          },
        },
        totalAmount: 1,
        count: 1,
        avgAmount: 1,
      },
    });

    pipeline.push({
      $project: {
        weekRange: {
          $concat: ["$weekStart", " - ", "$weekEnd"],
        },
        totalAmount: 1,
        count: 1,
        avgAmount: 1,
      },
    });

    pipeline.push({ $sort: { _id: 1 } });

    const groupedData = await InvoiceModel.aggregate(pipeline);
    const transformedData = groupedData.map((data) => {
      const { _id, totalAmount, ...rest } = data;
      return {
        ...rest,
        totalAmount: totalAmount.toFixed(2),
      };
    });
    res.status(200).json(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Error while grouping invoice data" });
  }
});

InvoiceRouter.get("/grouped/avg", async (req, res) => {
  try {
    const { groupBy, outlet_id } = req.query; // groupBy can be 'daily', 'weekly', or 'monthly'

    // Define the date format based on the grouping type
    let dateFormat;
    if (groupBy === "daily") {
      dateFormat = "%Y-%m-%d"; // Group by day
    } else if (groupBy === "monthly") {
      dateFormat = "%Y-%m"; // Group by month
    } else {
      return res.status(400).json({ Error: "Invalid groupBy parameter" });
    }

    // MongoDB aggregation pipeline
    const pipeline = [];
    if (outlet_id) {
      pipeline.push({
        $match: { outlet_id: outlet_id },
      });
    }
    pipeline.push({
      $addFields: {
        invoice_date_converted: {
          $dateFromString: { dateString: "$invoice_date" }, // Convert string to Date
        },
      },
    });

    pipeline.push({
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: "$invoice_date_converted",
          },
        },
        avgAmount: {
          $avg: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        }, // Sum of invoice amounts (calculated)
        count: { $sum: 1 }, // Count of invoices
      },
    });

    pipeline.push({ $sort: { _id: 1 } });
    if (groupBy === "daily") {
      pipeline.push({
        $project: {
          day: {
            $dateToString: {
              format: "%B %d %Y", // Format to "Feb 1 2025"
              date: {
                $dateFromString: { dateString: "$_id" }, // Convert `_id` back to Date
              },
            },
          },
          avgAmount: 1, // Include totalAmount in the output
          count: 1, // Include count in the output
        },
      });
    }

    if (groupBy === "monthly") {
      pipeline.push({
        $project: {
          day: {
            $dateToString: {
              format: "%b %Y", // Format to "Feb 1 2025"
              date: {
                $dateFromString: { dateString: "$_id" }, // Convert `_id` back to Date
              },
            },
          },
          avgAmount: 1, // Include totalAmount in the output
          count: 1, // Include count in the output
        },
      });
    }
    const groupedData = await InvoiceModel.aggregate(pipeline);

    res.status(200).json(groupedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Error while grouping invoice data" });
  }
});

InvoiceRouter.get("/compare", async (req, res) => {
  try {
    const { groupBy } = req.query; // groupBy can be 'daily', 'weekly', or 'monthly'

    // Define the date format based on the grouping type
    let dateFormat;
    if (groupBy === "daily") {
      dateFormat = "%Y-%m-%d"; // Group by day
    } else if (groupBy === "monthly") {
      dateFormat = "%Y-%m"; // Group by month
    } else {
      return res.status(400).json({ Error: "Invalid groupBy parameter" });
    }

    // MongoDB aggregation pipeline
    const pipeline = [];

    // Convert `invoice_date` to a proper Date object
    pipeline.push({
      $addFields: {
        invoice_date_converted: {
          $dateFromString: { dateString: "$invoice_date" }, // Convert string to Date
        },
      },
    });

    // Group by both `outlet_id` and `date`
    pipeline.push({
      $group: {
        _id: {
          outlet_id: "$outlet_id", // Group by outlet_id
          date: {
            $dateToString: {
              format: dateFormat,
              date: "$invoice_date_converted",
            },
          },
        },
        totalAmount: {
          $sum: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        }, // Sum of invoice amounts
        avgAmount: {
          $avg: {
            $divide: [
              "$invoice_amount.cent_amount",
              "$invoice_amount.fraction",
            ],
          },
        }, // Average of invoice amounts
        count: { $sum: 1 },
      },
    });

    // Sort by outlet_id and date
    pipeline.push({
      $sort: {
        "_id.outlet_id": 1, // Sort by outlet_id
        "_id.date": 1, // Then sort by date
      },
    });

    // Format the output
    pipeline.push({
      $project: {
        outlet_id: "$_id.outlet_id",
        date: "$_id.date",
        totalAmount: { $round: ["$totalAmount", 2] }, // Round totalAmount to 2 decimal places
        avgAmount: { $round: ["$avgAmount", 2] }, // Round avgAmount to 2 decimal places
        _id: 0, // Exclude the _id field
        count: 1,
      },
    });

    // Execute the aggregation pipeline
    const groupedData = await InvoiceModel.aggregate(pipeline);

    res.status(200).json(groupedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ Error: "Error while comparing invoice data" });
  }
});

module.exports = {
  InvoiceRouter,
};
