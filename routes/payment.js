const express = require("express");
const router = express.Router();
const { client } = require("../config/db");
const { ObjectId } = require('mongodb');
const nodemailer = require("nodemailer");
require('dotenv').config();

const SSLCommerzPayment = require('sslcommerz-lts')

const store_id = process.env.SSL_STORE_ID
const store_passwd = process.env.SSL_Secret_Key
const is_live = false //true for live, false for sandbox


const cartsCollection = client.db("LaptopGallery").collection("carts");
const paymentsCollection = client.db("LaptopGallery").collection("payments");
const productsCollection = client.db("LaptopGallery").collection("products");


// Payment Api
router.post("/", async (req, res) => {
    const { productIds, firstName, lastName, streetAddress, division, district, zipCode, phone, email } = req.body;

    const objectIds = productIds.map(id => new ObjectId(id));
    const query = {
        _id: { $in: objectIds }
    };
    // console.log(query)
    const cart = await cartsCollection.find(query).toArray();
    // Calculate all price
    const total = cart.reduce((total, item) => {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = item.quantity || 0;
        const itemTotal = itemPrice * itemQuantity;
        return total + itemTotal;
    }, 0);
    // Shipping Amount
    const shipping = 120;
    const totalPrice = total + shipping;

    // console.log(totalPrice)
    //  Random transition ID generate
    const trin_id = new ObjectId().toString().slice(0, 10);

    // Randomly convert some characters to uppercase
    const tranId = trin_id.split('').map(char => {
        return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
    }).join('');

    const data = {
        total_amount: totalPrice,
        currency: 'BDT',
        tran_id: tranId, // use unique tran_id for each api call
        success_url: `http://localhost:5000/payment/success/${tranId}`,
        fail_url: `http://localhost:5000/payment/fail/${tranId}`,
        cancel_url: `http://localhost:5000/payment/cancel/${tranId}`,
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: `${firstName} ${lastName}`,
        cus_email: email,
        cus_add1: streetAddress,
        cus_add2: district,
        cus_city: division,
        cus_state: 'Dhaka',
        cus_postcode: zipCode,
        cus_country: 'Bangladesh',
        cus_phone: phone,
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    // console.log(data)

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.send({ url: GatewayPageURL })


        const date = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
        });
        const finalOrderDataSave = {
            cart,
            totalAmount: totalPrice,
            transactionId: tranId,
            cusEmail: email,
            date: new Date(date),
            cusName: `${firstName}${lastName}`,
            cusPhone: phone,
            paidStatues: false

        }
        const result = paymentsCollection.insertOne(finalOrderDataSave)

        const deleteResult = cartsCollection.deleteMany(query)

        console.log('Redirecting to: ', GatewayPageURL)
    });


});


// Payment success Route
router.post("/success/:tranId", async (req, res) => {
    const tranId = req.params.tranId;

    // Update payment status to true
    const result = await paymentsCollection.updateOne(
        { transactionId: tranId },
        { $set: { paidStatues: true } }
    );

    if (result.modifiedCount > 0) {
        // Retrieve user details from the payments collection
        const paymentDetails = await paymentsCollection.findOne({ transactionId: tranId });

        // console.log("paymentDetails", paymentDetails)

        const paymentProduct = paymentDetails?.cart?.map(item => ({
            type: item.type,
            price: item.price
        })) || [];

        if (paymentProduct.length > 0) {
            // console.log("Product Details:", paymentProduct);
            // Further code to send these details, e.g., in an email or response
        }

        // console.log(paymentProduct)

        // After retrieving paymentDetails
        if (paymentDetails) {
            // Setting up the transporter for nodemailer
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_MAIL,
                    pass: process.env.SMTP_PASS,
                },
            });

            // Extracting the required fields from the cart for the email
            const cartItems = paymentDetails.cart.map(item => ({
                brand: item.brand,
                type: item.type,
                quantity: item.quantity,
                model: item.model,
                image: item.image,
                price: item.price
            }));

            // Generate HTML table rows for each cart item
            const cartRows = cartItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;">${item.brand}</td>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;">${item.type}</td>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;">${item.model}</td>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;"><img src="${item.image}" alt="${item.model}" style="max-width: 100px;"/></td>
            <td style="padding: 10px; border-bottom: 2px solid #ddd;">${item.price}</td>
        </tr>
    `).join('');

            // Setting up the mailOptions
            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: paymentDetails.cusEmail, // Use the user's email stored in the payment record
                subject: "Payment Successful - Order Confirmation",
                html: `
            <p>Dear ${paymentDetails.cusName},</p>
<div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #ffffff; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
    <h2 style="text-align: center; color: #333;">Order Details</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Brand</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Type</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Quantity</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Model</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Image</th>
            <th style="padding: 10px; border-bottom: 2px solid #ddd; background-color: #f9f9f9; text-align: left; color: #333;">Price</th>
        </tr>
        ${cartRows}
    </table>
    <p style="text-align: center; margin-top: 20px;">Thank you for choosing Laptop Gallery for your purchase! We hope you enjoy your new products and have a great experience using them. </p>
    <p style="text-align: center; color: #555;">We would be delighted to serve you again in the future. For any assistance, feel free to reach out to us.</p>
    <p style="text-align: center; margin-top: 20px;">Best regards,</p>
    <p style="text-align: center; font-weight: bold; color: #333;">Laptop Gallery</p>
    
    <!-- Contact Email -->
    <p style="text-align: center; font-size: 14px; color: #555;">
        Contact us: <a href="mailto:salimintelligency@gmail.com" style="color: #1a73e8;">salimintelligency@gmail.com</a>
    </p>
    
    <!-- Social Media Links -->
    <div style="text-align: center; margin-top: 15px;">
        <a href="https://facebook.com/your-page" target="_blank" style="margin: 0 10px; text-decoration: none;">
            <img src="facebook-icon-url" alt="Facebook" width="24" height="24">
        </a>
        <a href="https://twitter.com/your-page" target="_blank" style="margin: 0 10px; text-decoration: none;">
            <img src="twitter-icon-url" alt="Twitter" width="24" height="24">
        </a>
        <a href="https://instagram.com/your-page" target="_blank" style="margin: 0 10px; text-decoration: none;">
            <img src="instagram-icon-url" alt="Instagram" width="24" height="24">
        </a>
        <a href="https://linkedin.com/your-page" target="_blank" style="margin: 0 10px; text-decoration: none;">
            <img src="linkedin-icon-url" alt="LinkedIn" width="24" height="24">
        </a>
    </div>
</div>

        `
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("Error sending email:", error);
                } else {
                    console.log("Email sent successfully:", info.response);
                }
            });
        }


        // Redirect the user to the success page
        res.redirect(`http://localhost:5173/payment/success/${tranId}`);
    }
});


router.post("/fail/:tranId", async (req, res) => {
    // console.log(req.params.tranId)
    const result = await paymentsCollection.updateOne({
        transactionId: req.params.tranId
    },
        {
            $set: {
                paidStatues: "failed",
            }
        })
    if (result.modifiedCount > 0) {
        res.redirect(`http://localhost:5173/payment/fail/${req.params.tranId}`)
    }
})

router.post("/cancel/:tranId", async (req, res) => {
    // console.log(req.params.tranId)
    const result = await paymentsCollection.updateOne({
        transactionId: req.params.tranId
    },
        {
            $set: {
                paidStatues: "cancel",
            }
        })
    if (result.modifiedCount > 0) {
        res.redirect(`http://localhost:5173/payment/cancel/${req.params.tranId}`)
    }
})

router.get("/", async (req, res) => {
    const result = await paymentsCollection.find().toArray();
 
    res.send(result);
  });
  

module.exports = router;