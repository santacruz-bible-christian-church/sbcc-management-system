import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Import church logo
import churchLogo from '../../../assets/SBCCLogoHD.png';

/**
 * Parse numeric value from string or number (handles commas)
 */
const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove commas and parse
    return parseFloat(value.replace(/,/g, '')) || 0;
  }
  return 0;
};

/**
 * Format currency with Philippine Peso (using P for font compatibility)
 */
const formatPeso = (amount) => {
  const num = parseNumber(amount);
  return 'P ' + num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Generate a professional inventory depreciation report PDF
 * Paper-style design (black and white) matching member form PDF
 * Portrait orientation
 */
export const generateInventoryReportPDF = (items, summary = {}) => {
  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 15;

  // === HEADER WITH LOGO ===
  const logoX = margin;
  const logoY = yPos;
  const logoWidth = 25;
  const logoHeight = 25;

  try {
    doc.addImage(churchLogo, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
  } catch (error) {
    console.warn('Logo failed to load, using placeholder');
    doc.circle(logoX + logoWidth / 2, logoY + logoHeight / 2, logoWidth / 2);
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.text('SBCC', logoX + logoWidth / 2, logoY + logoHeight / 2 + 1, { align: 'center' });
  }

  // Church name - centered
  const pageCenterX = pageWidth / 2;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SANTA CRUZ BIBLE CHRISTIAN CHURCH', pageCenterX, yPos + 8, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Asset Management & Depreciation Report', pageCenterX, yPos + 14, { align: 'center' });

  // Date
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Date: ${today}`, pageWidth - margin, yPos + 8, { align: 'right' });

  yPos += 32;

  // === INVENTORY SUMMARY SECTION ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('A. Inventory Summary', margin, yPos);
  yPos += 6;

  // Calculate totals (properly handling commas in strings)
  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  const totalCost = items.reduce((sum, item) => sum + parseNumber(item.acquisition_cost), 0);
  const totalBookValue = items.reduce((sum, item) => {
    const metrics = item.metrics || {};
    const quantity = parseInt(item.quantity) || 1;

    if (metrics.totalBookValue !== undefined) {
      return sum + parseNumber(metrics.totalBookValue);
    } else if (metrics.bookValuePerUnit !== undefined) {
      return sum + (parseNumber(metrics.bookValuePerUnit) * quantity);
    }
    // Fallback to acquisition cost if no depreciation data
    return sum + parseNumber(item.acquisition_cost);
  }, 0);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  // Define column positions for alignment
  const col1Label = margin + 5;
  const col1Value = margin + 45;
  const col2Label = margin + 85;
  const col2Value = margin + 125;
  const lineEnd = margin + 155;

  // Row 1: Total Assets & Total Quantity
  doc.text('Total Assets:', col1Label, yPos);
  doc.line(col1Value, yPos, col1Value + 30, yPos);
  doc.text(String(totalItems), col1Value + 2, yPos - 0.5);

  doc.text('Total Quantity:', col2Label, yPos);
  doc.line(col2Value, yPos, lineEnd, yPos);
  doc.text(`${totalQuantity} pcs`, col2Value + 2, yPos - 0.5);
  yPos += 7;

  // Row 2: Original Cost & Net Book Value
  doc.text('Original Cost:', col1Label, yPos);
  doc.line(col1Value, yPos, col1Value + 35, yPos);
  doc.text(formatPeso(totalCost), col1Value + 2, yPos - 0.5);

  doc.text('Net Book Value:', col2Label, yPos);
  doc.line(col2Value, yPos, lineEnd, yPos);
  doc.text(formatPeso(totalBookValue), col2Value + 2, yPos - 0.5);
  yPos += 7;

  // Row 3: Total Depreciation
  doc.text('Total Depreciation:', col1Label, yPos);
  doc.line(col1Value, yPos, col1Value + 35, yPos);
  doc.text(formatPeso(totalCost - totalBookValue), col1Value + 2, yPos - 0.5);
  yPos += 12;

  // === ASSET LISTING TABLE ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('B. Asset Listing', margin, yPos);
  yPos += 5;

  // Build table data
  const tableData = items.map((item, index) => {
    const acquisitionDate = item.acquisition_date
      ? new Date(item.acquisition_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : 'N/A';

    const cost = parseNumber(item.acquisition_cost);
    const salvage = parseNumber(item.salvage_value);
    const quantity = parseInt(item.quantity) || 1;

    // Calculate book value - use pre-calculated metrics if available
    let bookValue = cost;
    if (item.metrics?.totalBookValue !== undefined) {
      // Use total book value (accounts for quantity)
      bookValue = parseNumber(item.metrics.totalBookValue);
    } else if (item.metrics?.bookValuePerUnit !== undefined) {
      // Use per-unit book value * quantity
      bookValue = parseNumber(item.metrics.bookValuePerUnit) * quantity;
    } else if (item.acquisition_date && item.useful_life_years) {
      // Fallback: calculate manually
      const yearsUsed = (new Date() - new Date(item.acquisition_date)) / (365 * 24 * 60 * 60 * 1000);
      const depreciableBase = Math.max(0, cost - salvage);
      const annualDep = depreciableBase / item.useful_life_years;
      const accumulatedDep = Math.min(depreciableBase, annualDep * yearsUsed);
      bookValue = Math.max(0, cost - accumulatedDep);
    }

    return [
      String(index + 1),
      item.item_name || '',
      String(item.quantity || 1),
      (item.status || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      acquisitionDate,
      formatPeso(cost),
      formatPeso(bookValue),
    ];
  });

  // A4 portrait = 210mm, margins = 20mm each side = 170mm available
  autoTable(doc, {
    startY: yPos,
    head: [['No.', 'Item Name', 'Qty', 'Status', 'Date Acquired', 'Cost (P)', 'Book Value (P)']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      halign: 'center',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },   // No. = 12
      1: { cellWidth: 38 },                      // Item Name = 38
      2: { cellWidth: 12, halign: 'center' },   // Qty = 12
      3: { cellWidth: 20, halign: 'center' },   // Status = 20
      4: { cellWidth: 28, halign: 'center' },   // Date Acquired = 28
      5: { cellWidth: 30, halign: 'right' },    // Cost = 30
      6: { cellWidth: 30, halign: 'right' },    // Book Value = 30
      // Total = 170mm ✓
    },
    margin: { left: margin, right: margin },
    tableWidth: 170,
    didDrawPage: (data) => {
      // Footer on each page
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(80);
      doc.text(
        'This document is for internal use only. Depreciation calculated using straight-line method.',
        margin,
        pageHeight - 12
      );
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
        pageWidth - margin,
        pageHeight - 12,
        { align: 'right' }
      );
      doc.setTextColor(0);
    },
  });

  // === SIGNATURE SECTION ===
  const finalY = doc.lastAutoTable.finalY + 20;

  if (finalY < doc.internal.pageSize.getHeight() - 40) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    // Left signature
    doc.text('Prepared by:', margin, finalY);
    doc.line(margin, finalY + 15, margin + 60, finalY + 15);
    doc.setFontSize(8);
    doc.text('Signature over Printed Name', margin, finalY + 19);

    // Right signature
    doc.setFontSize(9);
    doc.text('Noted by:', pageWidth - margin - 60, finalY);
    doc.line(pageWidth - margin - 60, finalY + 15, pageWidth - margin, finalY + 15);
    doc.setFontSize(8);
    doc.text('Signature over Printed Name', pageWidth - margin - 60, finalY + 19);
  }

  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `SBCC_Inventory_Report_${dateStr}.pdf`;

  // Save the PDF
  doc.save(fileName);
};

export default generateInventoryReportPDF;
