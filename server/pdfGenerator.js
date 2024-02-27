const pdfmake = require('pdfmake');

function generatePDFContent(jobDetails, chartData) {
  const documentDefinition = {
    content: [
      { text: 'Job Details and Chart', style: 'header' },
      { text: '\nJob Details Table', style: 'subheader' },
      {
        table: {
          headerRows: 1,
          body: [
            ['Customer Code', 'Job Number', 'Job Summary', 'Pick Up Lock', 'Delivery Lock', 'Type', 'JobStatus'],
            ...jobDetails.map((job) => [
              job.CustomerCode,
              job.JobNo,
              job.JobSummary,
              job.PickupLocation,
              job.DeliveryLocation,
              job.JobTransactionType,
              job.JobsStatus === 1 ? '' : 'Pending',
            ]),
          ],
        },
      },
      { text: '\nChart', style: 'subheader' },
      {
        image: 'data:image/png;base64,' + generateChartImage(chartData),
        width: 500,
        alignment: 'center',
      },
    ],
    styles: {
      header: { fontSize: 18, bold: true },
      subheader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5] },
    },
  };

  const pdfContent = pdfmake.createPdf(documentDefinition).toString('base64');
  return pdfContent;
}



function generateChartImage(chartData) {
    try {
      const canvas = document.createElement('canvas');
      renderChart(chartData, canvas);
      return canvas.toDataURL().split(',')[1];
    } catch (error) {
      console.error('Error generating chart image:', error);
      return '';  // Return an empty string or handle the error accordingly
    }
  }
  

// Placeholder function, replace with your actual implementation
function renderChart(chartData, canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'blue';
  chartData.forEach((dataPoint, index) => {
    ctx.fillRect(index * 50, canvas.height - dataPoint * 10, 40, dataPoint * 10);
  });
}

module.exports = generatePDFContent;
