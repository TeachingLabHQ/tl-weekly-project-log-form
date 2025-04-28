import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "re_2uMtEHKA_NnTp6E81HtzZMbfDzkZacCbD"); // Use env var

// --- New Interfaces for Project-Based Reporting ---
export interface DetailedEntry {
  cf_name: string;
  cf_email: string;
  cf_tier: string;
  task_name: string;
  work_hours: number;
  rate: number;
  entry_pay: number;
}

export interface ProjectSummaryData {
  projectName: string;
  totalPay: number;
  detailedEntries: DetailedEntry[];
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

// --- Refactored PDF Generation Function ---
export async function generateProjectPDF(projectData: ProjectSummaryData): Promise<Uint8Array> {
  console.log(`Starting PDF generation for project: ${projectData.projectName}`);
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size - use 'let' as page can change
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    const contentBottomMargin = margin + 60; // Leave space for total/footer
    const pageWidth = page.getWidth() - 2 * margin;
    const baseLineHeight = 18; // Slightly more spacing
    let y = page.getHeight() - margin;

    // Add title
    page.drawText("Teaching Lab", {
      x: margin,
      y,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= baseLineHeight * 1.5;

    // Add subtitle
    page.drawText(`Project Payment Summary: ${projectData.projectName}`, {
      x: margin,
      y,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= baseLineHeight * 1.5;

    // Add report details (Month/Year)
    const reportMonth = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    page.drawText(`Report Month: ${reportMonth}`, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
    });
    y -= baseLineHeight * 2;

    // Define table columns with new structure and adjusted widths
    const columns = [
      { header: "Name", width: pageWidth * 0.18, align: 'left' },
      { header: "Email", width: pageWidth * 0.18, align: 'left' },
      { header: "Tier", width: pageWidth * 0.08, align: 'left' },
      { header: "Task", width: pageWidth * 0.22, align: 'left' },
      { header: "Hours", width: pageWidth * 0.08, align: 'right' },
      { header: "Rate", width: pageWidth * 0.12, align: 'right' },
      { header: "Subtotal", width: pageWidth * 0.14, align: 'right' }
    ];

    // Calculate starting positions for each column
    let columnPositions: number[] = [];
    let currentX = margin;
    columns.forEach(column => {
      columnPositions.push(currentX);
      currentX += column.width;
    });

    // Function to draw table header
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

    // Draw table rows for each detailed entry
    projectData.detailedEntries.forEach((entry, index) => {
      // Calculate dynamic row height first
      const wrapWidthMargin = 15;
      const nameLines = wrapText(entry.cf_name, columns[0].width - wrapWidthMargin, helveticaFont, 10);
      const emailLines = wrapText(entry.cf_email, columns[1].width - wrapWidthMargin, helveticaFont, 10);
      const taskLines = wrapText(entry.task_name, columns[3].width - wrapWidthMargin, helveticaFont, 10);
      const rowHeight = calculateRowHeight([nameLines, emailLines, [entry.cf_tier], taskLines], baseLineHeight * 1.2);

      // Check for page break before drawing the row
      if (y - rowHeight < contentBottomMargin) {
        page = pdfDoc.addPage([595, 842]); // Add a new page
        y = page.getHeight() - margin;    // Reset y to top margin
        y = drawTableHeader(page, y);    // Redraw header on new page and update y
      }

      // Draw row background (optional alternate color)
      // page.drawRectangle({ ... }); 

      const rowStartY = y;
      const textOffsetY = 14; // Vertical offset for text within the row

      // Draw wrapped text columns
      [[nameLines, 0], [emailLines, 1], [taskLines, 3]].forEach(([lines, colIdx]) => {
        (lines as string[]).forEach((line, i) => {
          page.drawText(line, {
            x: columnPositions[colIdx as number] + 10,
            y: rowStartY - textOffsetY - (i * 12), // Adjust spacing for wrapped lines
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
        });
      });

      // Draw non-wrapped and numeric columns
      const otherValues = [
        { value: entry.cf_tier, columnIndex: 2, align: 'left' },
        { value: entry.work_hours.toString(), columnIndex: 4, align: 'right' },
        { value: `$${entry.rate.toFixed(2)}`, columnIndex: 5, align: 'right' },
        { value: `$${entry.entry_pay.toFixed(2)}`, columnIndex: 6, align: 'right' }
      ];

      otherValues.forEach(({ value, columnIndex, align }) => {
        const textX = positionText(columnPositions[columnIndex], columns[columnIndex].width, value, helveticaFont, 10, align);
        page.drawText(value, {
          x: textX,
          y: rowStartY - textOffsetY,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      // Draw cell borders (vertical lines)
      // Draw leftmost border explicitly
      drawLine(page, margin, rowStartY, margin, rowStartY - rowHeight);
      // Draw internal vertical borders
      columns.forEach((column, i) => {
          if (i > 0) { // Skip explicit drawing for the first column's left border (handled above)
            drawLine(page, columnPositions[i], rowStartY, columnPositions[i], rowStartY - rowHeight);
          }
      });
      // Draw rightmost border
      drawLine(page, margin + pageWidth, rowStartY, margin + pageWidth, rowStartY - rowHeight);
      // Draw bottom border for the row
      drawLine(page, margin, rowStartY - rowHeight, margin + pageWidth, rowStartY - rowHeight);

      y -= rowHeight;
    });

    // Add total
    const totalLineHeight = baseLineHeight * 1.5;
    if (y - totalLineHeight < contentBottomMargin) {
        page = pdfDoc.addPage([595, 842]); // Add a new page if needed just for total/footer
        y = page.getHeight() - margin;    // Reset y to top margin (no header needed here)
    } 
    y -= totalLineHeight;

    const totalText = `Total Project Payment: $${projectData.totalPay.toFixed(2)}`;
    const totalX = positionText(margin, pageWidth, totalText, helveticaBold, 14, 'right');
    page.drawText(totalText, {
      x: totalX,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });

    // Add footer
    const footerY = margin / 2;
    const footerText1 = "This is an automated payment summary from Teaching Lab.";
    const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@example.com";
    const footerText2 = `Please contact ${supportEmail} for any questions.`;
    page.drawText(footerText1, { x: margin, y: footerY + 12, size: 9, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(footerText2, { x: margin, y: footerY, size: 9, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });

    // Save the PDF
    console.log("Saving project PDF...");
    const pdfBytes = await pdfDoc.save();
    console.log("Project PDF generated successfully, size:", pdfBytes.length, "bytes");
    return pdfBytes;

  } catch (error) {
    console.error(`Error generating PDF for project ${projectData.projectName}:`, error);
    throw error;
  }
}

// --- Refactored Email Sending Function ---
export async function sendProjectEmail(
  projectName: string,
  totalPay: number,
  pdf: Uint8Array,
  recipientEmail: string // Receive recipient email as argument
): Promise<void> {
  console.log(`Starting email sending for project: ${projectName} to ${recipientEmail}`);
  try {
    // Use environment variables
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@teachinglab.org"; // Use a suitable default or env var
    const supportEmail = Deno.env.get("SUPPORT_EMAIL") || "support@example.com";
    console.log("FROM_EMAIL:", fromEmail);
    console.log("SUPPORT_EMAIL:", supportEmail);

    // Convert Uint8Array to base64 string
    const pdfBase64 = btoa(String.fromCharCode(...pdf));
    const reportMonthYear = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const filename = `TeachingLab-PaymentSummary-${projectName.replace(/\s+/g, '_')}-${reportMonthYear}.pdf`;

    const emailData = {
      from:"onboarding@resend.dev", // Nicer sender name
      to: recipientEmail,
      subject: `Teaching Lab Project Payment Summary - ${projectName} - ${reportMonthYear}`,
      html: `
        <h1>Teaching Lab - Project Payment Summary</h1>
        <p>Hello,</p>
        <p>Please find attached the payment summary report for project <strong>${projectName}</strong> for the period ending ${reportMonthYear}.</p>
        <p>Total Payment for this project in this period: <strong>$${totalPay.toFixed(2)}</strong></p>
        <p>If you have any questions, please contact ${supportEmail}.</p>
        <p>Best regards,<br>Teaching Lab Team</p>
      `,
      attachments: [{
        filename: filename,
        content: pdfBase64,
        // contentType: 'application/pdf' // Resend usually infers this correctly
      }]
    };

    console.log(`Sending project summary email for ${projectName}...`);
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error(`Error sending email for project ${projectName}:`, JSON.stringify(error));
      throw new Error(`Failed to send email: ${JSON.stringify(error)}`); // Throw a more informative error
    }

    console.log(`Email sent successfully for project ${projectName}:`, data?.id);
  } catch (error) {
    console.error(`Error in sendProjectEmail function for project ${projectName}:`, error);
    throw error; // Re-throw the error to be caught by the main handler
  }
}

// --- Remove Old Functions --- 
/*
export async function generatePDF(submission: VendorPaymentSubmission): Promise<Uint8Array> { ... }
export async function sendEmail(submission: VendorPaymentSubmission, pdf: Uint8Array): Promise<void> { ... }
*/