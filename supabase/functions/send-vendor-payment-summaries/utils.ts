import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "re_2uMtEHKA_NnTp6E81HtzZMbfDzkZacCbD"); // Use env var

// --- Interfaces for Per-Person, Per-Project Reporting ---
// (These should match or be compatible with those in index.ts)
interface DetailedEntry {
  task_name: string;
  work_hours: number;
  rate: number;
  entry_pay: number;
  submission_date?: string;
}

interface PersonProjectSummary {
  cf_name: string;
  cf_email: string;
  cf_tier: string;
  totalPayForProject: number;
  detailedEntries: DetailedEntry[];
  submission_date: string;
}

// --- Remove Old Interfaces (kept in index.ts if needed there) ---
/* 
export interface VendorPaymentSubmission { ... } 
export interface EmailLog { ... } 
*/

// Helper function to draw a line
function drawLine(page: any, startX: number, startY: number, endX: number, endY: number) {
  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
}

// Helper function to position text based on alignment
function positionText(x: number, width: number, text: string, font: any, fontSize: number, alignment = 'left'): number {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  if (alignment === 'right') {
    return x + width - textWidth - 10; // 10px padding from right
  } else {
    return x + 10; // 10px padding from left
  }
}

// Helper function to wrap text
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      // If single word is too long, force wrap it
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let partialWord = '';
        for (let j = 0; j < word.length; j++) {
          const testChar = partialWord + word[j];
          if (font.widthOfTextAtSize(testChar, fontSize) <= maxWidth) {
            partialWord = testChar;
          } else {
            lines.push(partialWord);
            partialWord = word[j];
          }
        }
        if (partialWord) {
          currentLine = partialWord;
        }
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

// Helper function to calculate row height based on content
function calculateRowHeight(linesPerColumn: string[][], baseHeight: number): number {
  const maxLines = linesPerColumn.reduce((max, lines) => Math.max(max, lines.length), 0);
  return Math.max(baseHeight, maxLines * 14 + 15); // Adjusted line height and padding
}

// --- Updated PDF Generation Function for Per-Person Summary ---
export async function generateProjectPDF(projectName: string, personSummary: PersonProjectSummary): Promise<Uint8Array> {
  console.log(`${personSummary}`);
  console.log(`Starting PDF generation for ${personSummary.cf_email} on project: ${projectName}`);
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    const contentBottomMargin = margin + 60; // Space for total/footer
    const pageWidth = page.getWidth() - 2 * margin;
    const baseLineHeight = 18;
    let y = page.getHeight() - margin;

    // Title
    page.drawText("TL Coaching/Facilitation Invoice", {
      x: margin,
      y,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= baseLineHeight * 1.5;

    // Subtitle - Personal Summary for Project
    page.drawText(`Project: ${projectName}`, {
      x: margin,
      y,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= baseLineHeight * 1.5;

    // Report Month
    const reportMonth = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    page.drawText(`Report Month: ${reportMonth}`, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
    });
    y -= baseLineHeight * 1.2;

    // Add Bill to information
    page.drawText("Bill to: Teaching Lab", {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
    });
    y -= baseLineHeight * 1.2;

    // Person Details
    page.drawText(`Coach/Facilitator: ${personSummary.cf_name} (${personSummary.cf_email})`, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
    });
    y -= baseLineHeight * 1.0;
    page.drawText(`Tier: ${personSummary.cf_tier}`, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
    });
    y -= baseLineHeight * 2; // More space before table

    // Sort entries by date (oldest first)
    const sortedEntries = [...personSummary.detailedEntries].sort((a, b) => {
      // Convert dates to comparable values, defaulting to empty string if undefined
      const dateA = a.submission_date ? new Date(a.submission_date).getTime() : 0;
      const dateB = b.submission_date ? new Date(b.submission_date).getTime() : 0;
      return dateA - dateB; // For oldest to newest
    });

    // Define table columns (Date, Task, Hours, Rate, Subtotal)
    const columns = [
      { header: "Date", width: pageWidth * 0.15, align: 'left' },
      { header: "Task", width: pageWidth * 0.35, align: 'left' },
      { header: "Hours", width: pageWidth * 0.15, align: 'right' },
      { header: "Rate", width: pageWidth * 0.15, align: 'right' },
      { header: "Subtotal", width: pageWidth * 0.20, align: 'right' }
    ];

    // Calculate starting positions for each column
    let columnPositions: number[] = [];
    let currentX = margin;
    columns.forEach(column => {
      columnPositions.push(currentX);
      currentX += column.width;
    });

    // Function to draw table header (remains largely the same)
    const drawTableHeader = (currentPage: any, startY: number): number => {
        const headerHeight = baseLineHeight * 1.5;
        currentPage.drawRectangle({
          x: margin,
          y: startY - headerHeight + 5,
          width: pageWidth,
          height: headerHeight,
          color: rgb(0.95, 0.95, 0.95),
        });

        columns.forEach((column, i) => {
          const textX = positionText(columnPositions[i], column.width, column.header, helveticaBold, 11, column.align);
          currentPage.drawText(column.header, {
            x: textX,
            y: startY - (headerHeight / 2) + 1,
            size: 11,
            font: helveticaBold,
            color: rgb(0, 0, 0),
          });
        });
        const newY = startY - headerHeight + 5;
        drawLine(currentPage, margin, newY, margin + pageWidth, newY); // Line below header
        return newY;
    };

    // Draw initial table header
    y = drawTableHeader(page, y);

    // Draw table rows for each entry of the person
    sortedEntries.forEach((entry) => {
      // Calculate dynamic row height based on Task column wrapping
      const wrapWidthMargin = 15;
      const taskLines = wrapText(entry.task_name, columns[1].width - wrapWidthMargin, helveticaFont, 10);
      // Only task column needs wrapping consideration for height
      const rowHeight = calculateRowHeight([taskLines], baseLineHeight * 1.2);

      // Check for page break before drawing the row
      if (y - rowHeight < contentBottomMargin) {
        page = pdfDoc.addPage([595, 842]);
        y = page.getHeight() - margin;
        y = drawTableHeader(page, y);
      }

      const rowStartY = y;
      const textOffsetY = 14;

      // Format the date (if available)
      let dateDisplay = '';
      if (entry.submission_date) {
        try {
          const dateObj = new Date(entry.submission_date);
          dateDisplay = dateObj.toLocaleDateString();
        } catch (e) {
          // If date parsing fails, use the raw string
          dateDisplay = entry.submission_date;
        }
      } else if (personSummary.submission_date) {
        // Fall back to the person's submission date if entry doesn't have one
        try {
          const dateObj = new Date(personSummary.submission_date);
          dateDisplay = dateObj.toLocaleDateString();
        } catch (e) {
          dateDisplay = personSummary.submission_date;
        }
      }

      // Draw Date column
      page.drawText(dateDisplay, {
        x: columnPositions[0] + 10, // Left align with padding
        y: rowStartY - textOffsetY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      // Draw Task column (wrapped)
      taskLines.forEach((line, i) => {
        page.drawText(line, {
          x: columnPositions[1] + 10, // Left align with padding
          y: rowStartY - textOffsetY - (i * 12),
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      // Draw Hours, Rate, Subtotal columns (numeric, right-aligned)
      const numericValues = [
        { value: entry.work_hours.toString(), columnIndex: 2 },
        { value: `$${entry.rate.toFixed(2)}`, columnIndex: 3 },
        { value: `$${entry.entry_pay.toFixed(2)}`, columnIndex: 4 }
      ];

      numericValues.forEach(({ value, columnIndex }) => {
        const textX = positionText(columnPositions[columnIndex], columns[columnIndex].width, value, helveticaFont, 10, 'right');
        page.drawText(value, {
          x: textX,
          y: rowStartY - textOffsetY,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      // Draw cell borders (vertical lines)
      drawLine(page, margin, rowStartY, margin, rowStartY - rowHeight); // Leftmost
      columns.forEach((column, i) => {
          if (i > 0) {
            drawLine(page, columnPositions[i], rowStartY, columnPositions[i], rowStartY - rowHeight);
          }
      });
      drawLine(page, margin + pageWidth, rowStartY, margin + pageWidth, rowStartY - rowHeight); // Rightmost
      // Draw bottom border for the row
      drawLine(page, margin, rowStartY - rowHeight, margin + pageWidth, rowStartY - rowHeight);

      y -= rowHeight;
    });

    // Calculate total for the PDF (we'll use this for verification)
    const pdfTotalPay = sortedEntries.reduce((sum, entry) => sum + entry.entry_pay, 0);
    
    // Add total for this person on this project
    const totalLineHeight = baseLineHeight * 1.5;
    if (y - totalLineHeight < contentBottomMargin) {
        page = pdfDoc.addPage([595, 842]);
        y = page.getHeight() - margin;
    }
    y -= totalLineHeight;

    // Use personSummary.totalPayForProject for the displayed total as it's pre-calculated
    const totalText = `Total Payment: $${personSummary.totalPayForProject.toFixed(2)}`;
    const totalX = positionText(margin, pageWidth, totalText, helveticaBold, 14, 'right');
    page.drawText(totalText, {
      x: totalX,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    // Add footer (remains the same)
    const footerY = margin / 2;
    const footerText1 = "This is an automated payment summary from Teaching Lab.";
    const supportEmail = "accountspayable@teachinglab.org";
    const footerText2 = `Please contact ${supportEmail} for any questions.`;
    // Need to ensure footer is drawn on the *last* page used
    const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    lastPage.drawText(footerText1, { x: margin, y: footerY + 12, size: 9, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
    lastPage.drawText(footerText2, { x: margin, y: footerY, size: 9, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });

    // Save the PDF
    console.log(`Saving PDF for ${personSummary.cf_email} / ${projectName}...`);
    const pdfBytes = await pdfDoc.save();
    console.log(`PDF generated successfully for ${personSummary.cf_email} / ${projectName}, size: ${pdfBytes.length} bytes`);
    return pdfBytes;

  } catch (error) {
    console.error(`Error generating PDF for ${personSummary.cf_email} on project ${projectName}:`, error);
    throw error;
  }
}

// --- Updated Email Sending Function ---
export async function sendProjectEmail(
  projectName: string,
  personSummary: PersonProjectSummary, // Pass the person's summary object
  pdf: Uint8Array,
): Promise<void> {
  console.log(`Starting email sending for ${personSummary.cf_name} (${personSummary.cf_email}) on project: ${projectName}`);
  try {
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@teachinglab.org";
    const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@example.com";

    const pdfBase64 = btoa(String.fromCharCode(...pdf));
    console.log(`PDF Base64 length: ${pdfBase64}`);
    const reportMonthYear = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    // Make filename person-specific
    const filename = `TeachingLab-PaymentSummary-${personSummary.cf_name.replace(/\s+/g, '')}-${projectName.replace(/\s+/g, '_')}-${reportMonthYear}.pdf`;
    const recipientEmail = "accountspayable@teachinglab.org";
    const emailData = {
      from: "Teaching Lab Payments <onboarding@resend.dev>", // Use sender name
      to: recipientEmail,
      subject: `Your Teaching Lab Payment Summary - ${projectName} - ${reportMonthYear}`, // Person-specific subject
      html: `
        <h1>Teaching Lab - Payment Summary</h1>
        <p>Hello,</p>
        <p>Please find attached your payment summary for project <strong>${projectName}</strong> for the period ending ${reportMonthYear}.</p>
        <p>Total payment for the project member in this period: <strong>$${personSummary.totalPayForProject.toFixed(2)}</strong></p>
        <p>If you have any questions, please contact ${supportEmail}.</p>
        <p>Best regards,<br>Teaching Lab FinanceTeam</p>
      `,
      attachments: [{
        filename: filename,
        content: pdfBase64,
        contentType: 'application/pdf'
      }]
    };

    console.log(`Sending email to ${recipientEmail} for ${projectName}...`);
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error(`Error sending email to ${recipientEmail} for project ${projectName}:`, JSON.stringify(error));
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
    }

    console.log(`Email sent successfully to ${recipientEmail} for project ${projectName}:`, data?.id);
  } catch (error) {
    console.error(`Error in sendProjectEmail function for ${recipientEmail}, project ${projectName}:`, error);
    throw error;
  }
}

