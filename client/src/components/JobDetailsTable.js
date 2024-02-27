// src/components/JobDetailsTable.js
import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import html2canvas from "html2canvas";
import "./JobDetails.css";

const JobDetailsTable = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [jobDetails, setJobDetails] = useState([]);
  const [dataPlan, setDataPlan] = useState([]);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://rnd-server-owm.onrender.com/api/new_jobs/jobStatusOne/"
        );
        const data = await response.json();

        if (response.ok) {
          setJobDetails(data);
        } else {
          console.error("Error:", data.error);
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const responsePlan = await fetch(
          "https://rnd-server-owm.onrender.com/api/new_jobs/plan/jobTransactions"
        );
        if (!responsePlan.ok) {
          throw new Error("Failed to fetch data for Plan Jobs");
        }
        const dataPlan = await responsePlan.json();
        setDataPlan(dataPlan);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPlanData();
  }, []);

  const categoriesToInclude = [
    "Inside To Inside",
    "Inside To Outside",
    "Outside To Inside",
    "Outside To Outside",
  ];

  const categoryColors = {
    "Inside To Inside": "#8884d8",
    "Inside To Outside": "#82ca9d",
    "Outside To Inside": "#ffc658",
    "Outside To Outside": "#ff7300",
  };

  const chartData = categoriesToInclude.map((category, index) => ({
    key: index,
    category: category,
    "Plan Jobs":
      dataPlan.find((item) => item.JobTransactionType === category)
        ?.TransactionCount || 0,
    fill: categoryColors[category],
  }));

  const captureChartImage = async () => {
    if (chartContainerRef.current) {
      const chartImage = await html2canvas(chartContainerRef.current);
      return chartImage.toDataURL("image/png");
    }
    return null;
  };

  const sendEmail = async () => {
    try {
      const chartImage = await captureChartImage();

      const response = await fetch("http://localhost:3001/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDetails,
          chartImage,
        }),
      });

      const data = await response.json();
      console.log("send data");

      if (response.ok) {
        setEmailSent(true);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div>
      <div className="navbar">
        <img
          src="https://owmlogistics.com/img/OWM_Final.png"
          alt="logo"
          width="60px"
          height="30px"
        />
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Customer Code</th>
              <th>Job Number</th>
              <th>Job Summary</th>
              <th>Pick Up Lock</th>
              <th>Delivery Lock</th>
              <th>Type</th>
              <th>JobStatus</th>
            </tr>
          </thead>
          <tbody>
            {jobDetails &&
              jobDetails.map((job, index) => (
                <tr key={index}>
                  <td>{job.CustomerCode}</td>
                  <td>{job.JobNo}</td>
                  <td>{job.JobSummary}</td>
                  <td>{job.PickupLocation}</td>
                  <td>{job.DeliveryLocation}</td>
                  <td>{job.JobTransactionType}</td>
                  <td>{job.JobsStatus === 1 ? "" : "Pending"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div
        ref={chartContainerRef}
        id="chart-container"
        style={{
          width: "630px",
          padding: "20px",
          border: "1px solid #ccc",
          backgroundColor: "#fffcfc",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: -20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis
              domain={[0, "auto"]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Plan Jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{marginBottom:"130px"}}>
        <button onClick={sendEmail}>Send To Email</button>
      </div>
    </div>
  );
};

export default JobDetailsTable;
