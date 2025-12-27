import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Import church logo
import churchLogo from '../../../assets/SBCCLogoHD.png';

/**
 * Core function to build sticker labels PDF document
 * @param {Array} items - Array of inventory items
 * @returns {Promise<jsPDF>} - The PDF document
 */
const buildStickersPDF = async (items) => {
  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // Sticker dimensions (3 columns x 6 rows per page)
  const stickerWidth = 55;
  const stickerHeight = 35;
  const gapX = 7;
  const gapY = 5;
  const stickersPerRow = 3;
  const stickersPerPage = 18;

  let currentPage = 1;
  let stickerIndex = 0;

  // Helper to add header on each page
  const addHeader = () => {
    const yPos = 10;

    try {
      doc.addImage(churchLogo, 'PNG', margin, yPos, 15, 15, undefined, 'FAST');
    } catch {
      // Fallback: draw circle placeholder if logo fails
      doc.circle(margin + 7.5, yPos + 7.5, 7.5);
      doc.setFontSize(5);
      doc.text('SBCC', margin + 7.5, yPos + 8, { align: 'center' });
    }

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SANTA CRUZ BIBLE CHRISTIAN CHURCH', pageWidth / 2, yPos + 5, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Asset Label Stickers', pageWidth / 2, yPos + 10, { align: 'center' });

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.setFontSize(7);
    doc.text(`Date: ${today}`, pageWidth - margin, yPos + 5, { align: 'right' });
    doc.text(`Page ${currentPage}`, pageWidth - margin, yPos + 10, { align: 'right' });

    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 18, pageWidth - margin, yPos + 18);
  };

  addHeader();
  const startY = 35;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const col = stickerIndex % stickersPerRow;
    const row = Math.floor(stickerIndex / stickersPerRow) % 6;

    const x = margin + col * (stickerWidth + gapX);
    const y = startY + row * (stickerHeight + gapY);

    // Add new page if needed
    if (stickerIndex > 0 && stickerIndex % stickersPerPage === 0) {
      doc.addPage();
      currentPage++;
      addHeader();
    }

    // Draw sticker border
    doc.setLineWidth(0.3);
    doc.rect(x, y, stickerWidth, stickerHeight);

    // Generate and add QR code
    try {
      const qrDataUrl = await QRCode.toDataURL(`SBCC-INV-${item.id}`, {
        width: 80, margin: 0, color: { dark: '#000000', light: '#FFFFFF' }
      });
      doc.addImage(qrDataUrl, 'PNG', x + 2, y + 3, 20, 20);
    } catch {
      // Fallback: draw placeholder if QR fails
      doc.rect(x + 2, y + 3, 20, 20);
      doc.setFontSize(5);
      doc.text('QR', x + 12, y + 14, { align: 'center' });
    }

    // Item details
    const textX = x + 25;
    const textY = y + 6;

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    const itemName = (item.item_name || 'Unknown').length > 18
      ? item.item_name.substring(0, 18) + '...'
      : item.item_name || 'Unknown';
    doc.text(itemName, textX, textY);

    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text(`ID: #${item.id}`, textX, textY + 5);

    const label = (item.label || 'unlabeled').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    doc.text(label, textX, textY + 10);
    doc.text(`Qty: ${item.quantity || item.metrics?.quantity || 1}`, textX, textY + 15);

    doc.setFontSize(6);
    const ministry = (item.ministry_name || 'Unassigned').substring(0, 20);
    doc.text(ministry, textX, textY + 20);

    doc.setFontSize(5);
    doc.text(`SBCC-INV-${item.id}`, x + stickerWidth / 2, y + stickerHeight - 2, { align: 'center' });

    stickerIndex++;
  }

  // Footer
  doc.setFontSize(6);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(100);
  doc.text(
    'Property of Santa Cruz Bible Christian Church - For internal use only',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  return doc;
};

/**
 * Generate sticker labels PDF and open for print preview
 * Production-ready with error handling
 * @param {Array} items - Array of inventory items to print
 * @throws {Error} If items array is empty or PDF generation fails
 */
export const printStickersPDF = async (items) => {
  // Validate input
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('No items to print. Please select at least one item.');
  }

  try {
    const doc = await buildStickersPDF(items);

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');

    if (!printWindow) {
      // Popup blocked - fallback to download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `SBCC_Asset_Labels_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('⚠️ Popup blocked - PDF downloaded instead');
      return;
    }

    printWindow.addEventListener('load', () => {
      printWindow.print();
    });

    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);

    console.log('✅ Sticker labels PDF opened for printing');
  } catch (error) {
    console.error('❌ Failed to generate sticker labels PDF:', error);
    throw new Error('Failed to generate sticker labels. Please try again.');
  }
};

export default printStickersPDF;
