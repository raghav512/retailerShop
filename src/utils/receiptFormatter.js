/**
 * Format receipt data into HTML string for PDF generation
 * @param {Object} receipt - Receipt data from API
 * @param {Object} order - Order data
 * @returns {string} HTML string
 */
export const formatReceiptAsHTML = (receipt, order) => {
  const {
    receiptNumber,
    finalAmount,
    paymentMethod,
    procuremnetDate,
    createdBy,
    farmer,
    items = [],
    previousDues = 0,
    creditDays = 0,
    discountAmount = 0,
  } = receipt;

  const itemsHTML = items
    .map(
      item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 8px; text-align: left;">${
        item.item?.name || 'N/A'
      }</td>
      <td style="padding: 8px; text-align: center;">${item.quantity || 0}</td>
      <td style="padding: 8px; text-align: right;">₹${(
        item.finalPrice || 0
      ).toFixed(2)}</td>
      <td style="padding: 8px; text-align: right;">₹${(
        (item.quantity || 0) * (item.finalPrice || 0)
      ).toFixed(2)}</td>
    </tr>
  `,
    )
    .join('');

  const receiptDate = new Date(procuremnetDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .details { margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
        .detail-label { font-weight: bold; }
        .detail-value { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ccc; }
        .summary { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
        .summary-row { display: flex; justify-content: space-between; margin: 8px 0; font-weight: bold; }
        .total-amount { font-size: 18px; color: #10b981; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>RECEIPT</h1>
          <p>Receipt #${receiptNumber}</p>
        </div>

        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${receiptDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Order ID:</span>
            <span class="detail-value">${order?.orderId || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Farmer:</span>
            <span class="detail-value">${farmer?.firstName} ${
    farmer?.lastName
  }</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Farmer Phone:</span>
            <span class="detail-value">${farmer?.phone || 'N/A'}</span>
          </div>
          ${
            createdBy
              ? `
            <div class="detail-row">
              <span class="detail-label">Processed By:</span>
              <span class="detail-value">${createdBy.firstName} ${createdBy.lastName} (${createdBy.role})</span>
            </div>
          `
              : ''
          }
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="summary">
          <div class="detail-row">
            <span>Subtotal:</span>
            <span>₹${(finalAmount + discountAmount).toFixed(2)}</span>
          </div>
          ${
            discountAmount > 0
              ? `
            <div class="detail-row">
              <span>Discount:</span>
              <span>-₹${discountAmount.toFixed(2)}</span>
            </div>
          `
              : ''
          }
          ${
            previousDues > 0
              ? `
            <div class="detail-row">
              <span>Previous Dues:</span>
              <span>₹${previousDues.toFixed(2)}</span>
            </div>
          `
              : ''
          }
          <div class="summary-row total-amount">
            <span>Final Amount:</span>
            <span>₹${finalAmount.toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span>Payment Method:</span>
            <span>${paymentMethod}</span>
          </div>
          ${
            creditDays > 0
              ? `
            <div class="detail-row">
              <span>Credit Days:</span>
              <span>${creditDays}</span>
            </div>
          `
              : ''
          }
        </div>

        <div class="footer">
          <p>Thank you for your transaction!</p>
          <p>Generated on ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Format receipt data as plain text
 */
export const formatReceiptAsText = (receipt, order) => {
  const {
    receiptNumber,
    finalAmount,
    paymentMethod,
    procuremnetDate,
    createdBy,
    farmer,
    items = [],
    previousDues = 0,
    creditDays = 0,
    discountAmount = 0,
  } = receipt;

  const receiptDate = new Date(procuremnetDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let text = `
================================================
                    RECEIPT
================================================
Receipt #: ${receiptNumber}
Date: ${receiptDate}
Order ID: ${order?.orderId || 'N/A'}

FARMER DETAILS
Farmer: ${farmer?.firstName} ${farmer?.lastName}
Phone: ${farmer?.phone || 'N/A'}

${
  createdBy
    ? `PROCESSED BY\nStaff: ${createdBy.firstName} ${createdBy.lastName} (${createdBy.role})\n`
    : ''
}

ITEMS
================================================
`;

  items.forEach(item => {
    const itemName = item.item?.name || 'N/A';
    const qty = item.quantity || 0;
    const price = (item.finalPrice || 0).toFixed(2);
    const total = (qty * (item.finalPrice || 0) || 0).toFixed(2);

    text += `${itemName.padEnd(30)} ${qty
      .toString()
      .padStart(5)} x ₹${price.padStart(8)} = ₹${total.padStart(10)}\n`;
  });

  text += `
================================================
AMOUNT DETAILS
================================================
Subtotal:        ₹${(finalAmount + discountAmount).toFixed(2).padStart(20)}
`;

  if (discountAmount > 0) {
    text += `Discount:        ₹${discountAmount.toFixed(2).padStart(20)}\n`;
  }

  if (previousDues > 0) {
    text += `Previous Dues:   ₹${previousDues.toFixed(2).padStart(20)}\n`;
  }

  text += `
FINAL AMOUNT:    ₹${finalAmount.toFixed(2).padStart(20)}
Payment Method:  ${paymentMethod}
`;

  if (creditDays > 0) {
    text += `Credit Days:     ${creditDays}\n`;
  }

  text += `
================================================
Generated: ${new Date().toLocaleString('en-IN')}
Thank you for your transaction!
================================================
  `;

  return text;
};
