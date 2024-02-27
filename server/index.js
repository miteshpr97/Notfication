const express = require("express");
const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "miteshpradhan97@gmail.com",
    pass: "yliu enkl droc zmdz",
  },
});

app.post("/send-email", async (req, res) => {
  try {
    const jobDetailsArray = req.body.jobDetails;
    const chartImage = req.body.chartImage;

    const jobDetailsHTML = jobDetailsArray
      .map(
        (jobDetails) => `
       <tr>
               <td>${jobDetails.CustomerCode}</td>
               <td>${jobDetails.JobNo}</td>
               <td>${jobDetails.JobSummary}</td>
               <td>${jobDetails.PickupLocation}</td>
               <td>${jobDetails.DeliveryLocation}</td>
               <td>${jobDetails.JobsStatus === 1 ? "" : "Pending"}</td>
       </tr>
     `
      )
      .join("");

    const htmlContent = `
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        .container {
          margin: 10px 20px 0 20px;
          background-color: rgb(247, 246, 246);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #3d7bcc;
          padding: 10px;
        }

        nav h2 {
          color: black;
        }

        section {
          padding: 20px;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin-top: 20px;
        }

        th, td {
          border: 1px solid #dddddd;
          text-align: left;
          padding: 8px;
        }

        th {
          background-color: #f2f2f2;
        }

        .btn {
          margin-top: 20px;
          text-align: center;
        }

        .btn a {
          display: inline-block;
          background-color: #487ff7;
          color: white;
          padding: 12px 20px;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          transition: background-color 0.3s ease;
        }

        .btn a:hover {
          background-color: #6084e7;
        }

        footer {
          text-align: center;
          padding: 10px; 
          margin-top: 200px;
        }

        footer p {
          margin: 0; 
          font-size: 20px;
          color: #727070; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="navbar">
          <img src="https://owmlogistics.com/img/OWM_Final.png" alt="logo" width="60px" height="30px"> 
        </div>
        <section>
          <h1>NEW Job Details:</h1>
          <table>
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Job Number</th>
                <th>Job Summary</th>
                <th>Pick Up Lock</th>
                <th>Delivery Lock</th>
                <th>JobStatus</th>
              </tr>
            </thead>
            <tbody>
              ${jobDetailsHTML}
            </tbody>
          </table>
        </section>
      
        <section>
          <h1>Job Chart:</h1>
          <img src="${chartImage}" alt="Job Chart" style="max-width: 100%;" />
        </section>

        <div class="btn-div">
          <div class="btn">
            <a href="https://superb-hamster-e56f51.netlify.app/view-jobsForAdmin">Click To Access</a>
          </div>
        </div>
       
        <footer>
          <p>Powered by @ Globus Labs</p>
        </footer>
      </div>
    </body>
    </html>
   `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const mailOptions = {
      from: "miteshpradhan97@gmail.com",
      to: "mitesh.globuslabs@gmail.com",
      subject: "RND",
      text: "Please find attached PDF.",
      attachments: [
        {
          filename: "JobDetails.pdf",
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully", info });
  } catch (error) {
    console.error("Error sending email:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

