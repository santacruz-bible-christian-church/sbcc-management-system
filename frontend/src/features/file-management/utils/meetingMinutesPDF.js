import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import churchLogo from '../../../assets/SBCCLogoHD.png';

/**
 * Generate professional PDF for meeting minutes
 * Includes church branding, formatted content, and clickable attachment links
 */
export const generateMeetingMinutesPDF = (meeting) => {
  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = 15;

  // === LETTERHEAD HEADER ===
  try {
    // Logo on the left
    doc.addImage(churchLogo, 'PNG', margin, yPos, 22, 22, undefined, 'FAST');
  } catch (error) {
    // Fallback if logo fails
    doc.setDrawColor(180);
    doc.circle(margin + 11, yPos + 11, 10);
  }

  // Church name and document type
  const headerX = margin + 28;
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('SANTA CRUZ BIBLE CHRISTIAN CHURCH', headerX, yPos + 8);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  doc.text('Meeting Minutes Document', headerX, yPos + 14);
  doc.setTextColor(0);

  // Date on the right side
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, pageWidth - margin, yPos + 8, { align: 'right' });

  yPos += 30;

  // === SEPARATOR LINE ===
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // === DOCUMENT TITLE ===
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);

  // Handle long titles with wrapping
  const titleLines = doc.splitTextToSize(meeting.title || 'Untitled Meeting', pageWidth - (margin * 2));
  doc.text(titleLines, margin, yPos);
  yPos += (titleLines.length * 7) + 6;

  // === METADATA TABLE ===
  const metaData = [];

  if (meeting.meeting_date) {
    const dateFormatted = new Date(meeting.meeting_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    metaData.push(['Date:', dateFormatted]);
  }

  if (meeting.category_display || meeting.category) {
    metaData.push(['Category:', meeting.category_display || meeting.category]);
  }

  if (meeting.ministry_name) {
    metaData.push(['Ministry:', meeting.ministry_name]);
  }

  if (meeting.created_by_name) {
    metaData.push(['Recorded by:', meeting.created_by_name]);
  }

  if (metaData.length > 0) {
    autoTable(doc, {
      startY: yPos,
      body: metaData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: { top: 2, bottom: 2, left: 0, right: 10 },
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 28 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin },
    });
    yPos = doc.lastAutoTable.finalY + 8;
  }

  // === ATTENDEES SECTION ===
  if (meeting.attendees) {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 6 + (doc.splitTextToSize(meeting.attendees, pageWidth - (margin * 2) - 10).length * 5), 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Attendees', margin + 5, yPos + 5);
    yPos += 10;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const attendeeLines = doc.splitTextToSize(meeting.attendees, pageWidth - (margin * 2) - 10);
    doc.text(attendeeLines, margin + 5, yPos);
    yPos += (attendeeLines.length * 5) + 10;
  }

  // === MEETING NOTES/CONTENT ===
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Meeting Notes', margin, yPos);
  yPos += 7;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  // Process content - handle paragraphs and potential line breaks
  const content = meeting.content || 'No content provided.';
  const paragraphs = content.split('\n').filter(p => p.trim());

  paragraphs.forEach((paragraph) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    const lines = doc.splitTextToSize(paragraph.trim(), pageWidth - (margin * 2));
    doc.text(lines, margin, yPos);
    yPos += (lines.length * 5) + 4;
  });

  // === ATTACHMENTS SECTION (with clickable links) ===
  if (meeting.attachments && meeting.attachments.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 5;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Attachments', margin, yPos);
    yPos += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    meeting.attachments.forEach((attachment, index) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      const fileName = attachment.file_name || `Attachment ${index + 1}`;
      const fileSize = attachment.file_size
        ? ` (${(attachment.file_size / 1024 / 1024).toFixed(2)} MB)`
        : '';
      const displayText = `${index + 1}. ${fileName}${fileSize}`;

      doc.text(displayText, margin + 5, yPos);

      // Add clickable link if URL available
      if (attachment.file_url) {
        const textWidth = doc.getTextWidth(displayText);
        doc.setTextColor(0, 102, 204);
        doc.textWithLink(' [Download]', margin + 5 + textWidth, yPos, {
          url: attachment.file_url,
        });
        doc.setTextColor(0);
      }

      yPos += 6;
    });
  }

  // === FOOTER ===
  const footerY = pageHeight - 12;
  doc.setFontSize(7);
  doc.setFont(undefined, 'italic');
  doc.setTextColor(120);
  doc.text(
    'This document is for internal use only. Generated from SBCC Management System.',
    margin,
    footerY
  );
  doc.text(
    `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
    pageWidth - margin,
    footerY,
    { align: 'right' }
  );

  // === GENERATE FILENAME & SAVE ===
  const safeTitle = (meeting.title || 'Meeting')
    .replace(/[^a-zA-Z0-9 \-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  const dateStr = meeting.meeting_date || new Date().toISOString().split('T')[0];
  const fileName = `SBCC_Minutes_${safeTitle}_${dateStr}.pdf`;

  doc.save(fileName);
};

export default generateMeetingMinutesPDF;
