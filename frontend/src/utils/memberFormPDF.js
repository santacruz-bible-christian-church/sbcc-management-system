import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMembershipFormPDF = (formData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = 15;

  // Helper function to add checkboxes
  const addCheckbox = (x, y, checked = false) => {
    doc.rect(x, y, 3, 3);
    if (checked) {
      doc.setFontSize(8);
      doc.text('✓', x + 0.3, y + 2.3);
      doc.setFontSize(9);
    }
  };

  // Helper to check if we need a new page
  const checkNewPage = () => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // === HEADER WITH LOGO ===
  const logoX = pageWidth - margin - 35;
  doc.rect(logoX, yPos, 30, 35);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Picture', logoX + 15, yPos + 18, { align: 'center' });

  // Church name and address (centered)
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('PASIG BIBLE CHRISTIAN MISSION INC.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('No. 43 B-Tatco St., Bagong Ilog, Pasig City', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Tel No. 671-0486', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // === TITLE ===
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('CHURCH MEMBERSHIP FORM', pageWidth / 2, yPos, { align: 'center' });
  yPos += 3;
  
  const titleWidth = doc.getTextWidth('CHURCH MEMBERSHIP FORM');
  doc.line(pageWidth / 2 - titleWidth / 2, yPos, pageWidth / 2 + titleWidth / 2, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('ID No: ___________', pageWidth - margin - 35, yPos);
  yPos += 5;

  // === INTRODUCTION TEXT ===
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  const intro = 'Fill out and return the following information:';
  doc.text(intro, margin, yPos);
  yPos += 5;

  const declaration = 'I have received Jesus Christ as my personal Savior and Lord, and desire to become an active member and support the ministries of Santa Cruz Bible Christian Church. Therefore, I hereby apply for membership.';
  const splitDeclaration = doc.splitTextToSize(declaration, pageWidth - 2 * margin);
  doc.text(splitDeclaration, margin, yPos);
  yPos += splitDeclaration.length * 4 + 5;

  // === A. PERSONAL DATA ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('A. Personal Data', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  // Name
  const fullName = `${formData.first_name || ''} ${formData.last_name || ''}`.trim();
  doc.text(`•   Name: `, margin + 2, yPos);
  doc.line(margin + 15, yPos, pageWidth - margin, yPos);
  if (fullName) {
    doc.text(fullName, margin + 16, yPos - 0.5);
  }
  yPos += 6;

  // Complete Address
  doc.text(`•   Complete Address: `, margin + 2, yPos);
  doc.line(margin + 33, yPos, pageWidth - margin, yPos);
  if (formData.complete_address) {
    const addressLines = doc.splitTextToSize(formData.complete_address, pageWidth - margin - 35);
    doc.text(addressLines[0], margin + 34, yPos - 0.5);
    if (addressLines.length > 1) {
      yPos += 5;
      doc.line(margin + 2, yPos, pageWidth - margin, yPos);
      doc.text(addressLines.slice(1).join(' '), margin + 3, yPos - 0.5);
    }
  }
  yPos += 6;

  // Complete Birthday
  const birthDate = formData.date_of_birth ? new Date(formData.date_of_birth) : null;
  const birthMonth = birthDate ? birthDate.toLocaleDateString('en-US', { month: 'long' }) : '';
  const birthDay = birthDate ? birthDate.getDate() : '';
  const birthYear = birthDate ? birthDate.getFullYear() : '';

  doc.text(`•   Complete Birthday:    Month `, margin + 2, yPos);
  doc.line(margin + 47, yPos, margin + 67, yPos);
  if (birthMonth) doc.text(birthMonth, margin + 48, yPos - 0.5);
  
  doc.text(`    Day `, margin + 68, yPos);
  doc.line(margin + 80, yPos, margin + 90, yPos);
  if (birthDay) doc.text(String(birthDay), margin + 81, yPos - 0.5);
  
  doc.text(`    Year `, margin + 91, yPos);
  doc.line(margin + 105, yPos, margin + 125, yPos);
  if (birthYear) doc.text(String(birthYear), margin + 106, yPos - 0.5);
  yPos += 6;

  // Cell phone/Telephone No
  doc.text(`•   Cell phone/Telephone No: `, margin + 2, yPos);
  doc.line(margin + 50, yPos, pageWidth - margin, yPos);
  if (formData.phone) {
    doc.text(formData.phone, margin + 51, yPos - 0.5);
  }
  yPos += 6;

  // Occupation
  doc.text(`•   Occupation: `, margin + 2, yPos);
  doc.line(margin + 25, yPos, pageWidth - margin, yPos);
  if (formData.occupation) {
    doc.text(formData.occupation, margin + 26, yPos - 0.5);
  }
  yPos += 6;

  // Status
  doc.text(`•   Status:`, margin + 2, yPos);
  const statusX = margin + 22;
  
  addCheckbox(statusX, yPos - 2.5, formData.marital_status === 'single');
  doc.text('Single', statusX + 5, yPos);
  
  addCheckbox(statusX + 25, yPos - 2.5, formData.marital_status === 'married');
  doc.text('Married', statusX + 30, yPos);
  
  addCheckbox(statusX + 53, yPos - 2.5, formData.marital_status === 'divorced');
  doc.text('Divorced', statusX + 58, yPos);
  
  addCheckbox(statusX + 83, yPos - 2.5, formData.marital_status === 'widowed');
  doc.text('Widowed', statusX + 88, yPos);
  
  addCheckbox(statusX + 113, yPos - 2.5, formData.marital_status === 'remarried');
  doc.text('Remarried', statusX + 118, yPos);
  yPos += 6;

  // Wedding Anniversary
  doc.text(`•   Wedding Anniversary (if married) `, margin + 2, yPos);
  doc.line(margin + 57, yPos, pageWidth - margin, yPos);
  if (formData.wedding_anniversary) {
    const anniversary = new Date(formData.wedding_anniversary).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    doc.text(anniversary, margin + 58, yPos - 0.5);
  }
  yPos += 10;

  checkNewPage();

  // === B. EDUCATIONAL BACKGROUND ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('B. Educational Background', margin, yPos);
  yPos += 5;

  // Use autoTable directly on doc
  autoTable(doc, {
    startY: yPos,
    head: [['', 'School', 'Year Graduated']],
    body: [
      ['Elementary:', formData.elementary_school || '', formData.elementary_year_graduated || ''],
      ['Secondary:', formData.secondary_school || '', formData.secondary_year_graduated || ''],
      ['Vocational:', formData.vocational_school || '', formData.vocational_year_graduated || ''],
      ['Tertiary/College:', formData.college || '', formData.college_year_graduated || ''],
    ],
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 95 },
      2: { cellWidth: 40 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;
  checkNewPage();

  // === C. FAMILY BACKGROUND ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('C. Family Background', margin, yPos);
  yPos += 5;

  const familyData = formData.family_members && formData.family_members.length > 0
    ? formData.family_members.map(member => [
        member.name || '',
        member.relationship || '',
        member.birthdate ? new Date(member.birthdate).toLocaleDateString() : '',
      ])
    : [['', '', ''], ['', '', ''], ['', '', '']];

  autoTable(doc, {
    startY: yPos,
    head: [['Family Members in your Household', 'Relationship', 'Birthdate']],
    body: familyData,
    theme: 'grid',
    styles: { 
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 10;
  checkNewPage();

  // Note
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Note: Kindly fill up and answer the following questions.', margin, yPos);
  yPos += 8;

  // === D. SPIRITUAL INFORMATION ===
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('D. Spiritual Information', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  // Have you accepted Jesus Christ
  doc.text('•   Have you accepted Jesus Christ as your personal Lord and Savior?', margin + 2, yPos);
  
  addCheckbox(pageWidth - margin - 35, yPos - 2.5, formData.accepted_jesus === true);
  doc.text('Yes', pageWidth - margin - 31, yPos);
  
  addCheckbox(pageWidth - margin - 18, yPos - 2.5, formData.accepted_jesus === false);
  doc.text('No', pageWidth - margin - 14, yPos);
  yPos += 5;

  // Testimony
  if (formData.accepted_jesus && formData.salvation_testimony) {
    doc.setFontSize(8);
    doc.text('If yes, how did you come to know Jesus Christ as your Savior? (Explain briefly)', margin + 6, yPos);
    yPos += 4;
    
    const testimonySplit = doc.splitTextToSize(formData.salvation_testimony, pageWidth - 2 * margin - 10);
    testimonySplit.forEach((line) => {
      checkNewPage();
      doc.line(margin + 6, yPos, pageWidth - margin, yPos);
      doc.text(line, margin + 7, yPos - 0.5);
      yPos += 5;
    });
    doc.setFontSize(9);
  } else {
    // Empty lines for handwritten answers
    for (let i = 0; i < 3; i++) {
      doc.line(margin + 6, yPos, pageWidth - margin, yPos);
      yPos += 5;
    }
  }
  yPos += 3;

  checkNewPage();

  // Spiritual Birthday and Baptismal Date
  doc.text('•   Spiritual Birthday ', margin + 2, yPos);
  doc.line(margin + 35, yPos, margin + 80, yPos);
  if (formData.spiritual_birthday) {
    const spiritualBirthday = new Date(formData.spiritual_birthday).toLocaleDateString();
    doc.text(spiritualBirthday, margin + 36, yPos - 0.5);
  }

  doc.text('Baptismal Date: ', margin + 85, yPos);
  doc.line(margin + 110, yPos, pageWidth - margin, yPos);
  if (formData.baptism_date) {
    const baptismDate = new Date(formData.baptism_date).toLocaleDateString();
    doc.text(baptismDate, margin + 111, yPos - 0.5);
  }
  yPos += 8;

  checkNewPage();

  // If not, are you willing to be baptized?
  doc.text('•   If not, are you willing to be baptized?', margin + 2, yPos);
  
  addCheckbox(pageWidth - margin - 35, yPos - 2.5, formData.willing_to_be_baptized === true);
  doc.text('Yes', pageWidth - margin - 31, yPos);
  
  addCheckbox(pageWidth - margin - 18, yPos - 2.5, formData.willing_to_be_baptized === false || formData.willing_to_be_baptized === null);
  doc.text('No', pageWidth - margin - 14, yPos);
  yPos += 6;

  // Previous Church Membership
  doc.text('•   Previous Church Membership: ', margin + 2, yPos);
  doc.line(margin + 53, yPos, pageWidth - margin, yPos);
  if (formData.previous_church) {
    doc.text(formData.previous_church, margin + 54, yPos - 0.5);
  }
  yPos += 6;

  // How were you introduced to our church?
  doc.text('•   How were you introduced to our church? ', margin + 2, yPos);
  doc.line(margin + 65, yPos, pageWidth - margin, yPos);
  if (formData.how_introduced) {
    const introducedLines = doc.splitTextToSize(formData.how_introduced, pageWidth - margin - 67);
    doc.text(introducedLines[0], margin + 66, yPos - 0.5);
    if (introducedLines.length > 1) {
      yPos += 5;
      doc.line(margin + 2, yPos, pageWidth - margin, yPos);
      doc.text(introducedLines.slice(1).join(' '), margin + 3, yPos - 0.5);
    }
  }
  yPos += 6;

  // Began attending since
  doc.text('•   Began attending since ', margin + 2, yPos);
  doc.line(margin + 42, yPos, pageWidth - margin, yPos);
  if (formData.began_attending_since) {
    const attendingSince = new Date(formData.began_attending_since).toLocaleDateString();
    doc.text(attendingSince, margin + 43, yPos - 0.5);
  }

  // Generate filename
  const firstName = formData.first_name || 'Member';
  const lastName = formData.last_name || 'Form';
  const fileName = `${firstName}_${lastName}_Membership_Form.pdf`;

  // Save the PDF
  doc.save(fileName);
  
  console.log('✅ PDF generated successfully:', fileName);
};