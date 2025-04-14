import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Initialize Resend client
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Types
export interface VendorPaymentSubmission {
  id: number;
  cf_email: string;
  cf_name: string;
  cf_tier: string;
  total_pay: number;
  created_at: string;
  entries: {
    task_name: string;
    project_name: string;
    work_hours: number;
    rate: number;
    entry_pay: number;
  }[];
}

export interface EmailLog {
  id: number;
  submission_id: number;
  month: string;
  sent_at: string | null;
  status: string;
  error_message: string | null;
}

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
function calculateRowHeight(taskLines: string[], projectLines: string[], baseHeight: number): number {
  const maxLines = Math.max(taskLines.length, projectLines.length);
  return Math.max(baseHeight, maxLines * 16 + 20); // 16pt per line + 20pt padding
}

// Helper function to generate PDF
export async function generatePDF(submission: VendorPaymentSubmission): Promise<Uint8Array> {
  console.log("Starting PDF generation for submission:", submission.id);
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    
    // Get the fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Set up page margins and dimensions
    const margin = 50;
    const pageWidth = page.getWidth() - 2 * margin;
    const lineHeight = 20;
    let y = page.getHeight() - margin;
    
    // Add title
    page.drawText("Teaching Lab", {
      x: margin,
      y,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight * 2;
    
    // Add subtitle
    page.drawText("Vendor Payment Summary", {
      x: margin,
      y,
      size: 18,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight * 2;
    
    // Add vendor information
    const infoItems = [
      { label: "Vendor Name:", value: submission.cf_name },
      { label: "Email:", value: submission.cf_email },
      { label: "Tier:", value: submission.cf_tier },
      { label: "Submission Date:", value: new Date(submission.created_at).toLocaleDateString() }
    ];
    
    infoItems.forEach(item => {
      page.drawText(`${item.label} ${item.value}`, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    });
    y -= lineHeight;

    // Define table columns with fixed widths for better alignment
    const columns = [
      { header: "Task", width: pageWidth * 0.35, align: 'left' },
      { header: "Project", width: pageWidth * 0.25, align: 'left' },
      { header: "Hours", width: pageWidth * 0.13, align: 'right' },
      { header: "Rate", width: pageWidth * 0.13, align: 'right' },
      { header: "Subtotal", width: pageWidth * 0.14, align: 'right' }
    ];

    // Calculate starting positions for each column
    let columnPositions: number[] = [];
    let currentX = margin;
    columns.forEach(column => {
      columnPositions.push(currentX);
      currentX += column.width;
    });

    // Draw table header
    let startY = y;
    
    // Draw header background
    page.drawRectangle({
      x: margin,
      y: startY - 5,
      width: pageWidth,
      height: lineHeight + 10,
      color: rgb(0.95, 0.95, 0.95),
    });

    // Draw header text with proper alignment
    columns.forEach((column, i) => {
      const textX = positionText(
        columnPositions[i], 
        column.width, 
        column.header, 
        helveticaBold, 
        12, 
        column.align
      );

      page.drawText(column.header, {
        x: textX,
        y: startY,
        size: 12,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
    });

    y = startY - (lineHeight);
    
    // Draw horizontal line under header
    drawLine(page, margin, y, margin + pageWidth, y);
    
    // Draw table rows
    submission.entries.forEach((entry, index) => {
      // Wrap text for task and project columns with proper width calculations
      const taskLines = wrapText(
        entry.task_name, 
        columns[0].width - 20, 
        helveticaFont, 
        12
      );
      const projectLines = wrapText(
        entry.project_name, 
        columns[1].width - 20, 
        helveticaFont, 
        12
      );
      
      // Calculate row height based on content
      const rowHeight = calculateRowHeight(taskLines, projectLines, lineHeight * 1.5);
      
      // Draw row background (alternate colors for better readability)
      page.drawRectangle({
        x: margin,
        y: y - rowHeight,
        width: pageWidth,
        height: rowHeight,
        color: rgb(1, 1, 1),
        opacity: index % 2 === 0 ? 0.02 : 0,
      });
      
      // Draw task name (wrapped)
      taskLines.forEach((line, i) => {
        page.drawText(line, {
          x: columnPositions[0] + 10, // Consistent left padding
          y: y - 16 - (i * 16),
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // Draw project name (wrapped)
      projectLines.forEach((line, i) => {
        page.drawText(line, {
          x: columnPositions[1] + 10, // Consistent left padding
          y: y - 16 - (i * 16),
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // Draw numeric values (right-aligned) - using the same alignment logic as headers
      const numericValues = [
        { value: entry.work_hours.toString(), columnIndex: 2 },
        { value: `$${entry.rate.toFixed(2)}`, columnIndex: 3 },
        { value: `$${entry.entry_pay.toFixed(2)}`, columnIndex: 4 }
      ];
      
      numericValues.forEach(({ value, columnIndex }) => {
        const textX = positionText(
          columnPositions[columnIndex], 
          columns[columnIndex].width, 
          value, 
          helveticaFont, 
          12, 
          columns[columnIndex].align
        );
        
        page.drawText(value, {
          x: textX,
          y: y - 16, // Center in the row
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // Draw cell borders - using exact column positions
      columns.forEach((column, i) => {
        drawLine(page, columnPositions[i], y, columnPositions[i], y - rowHeight);
      });
      drawLine(page, margin + pageWidth, y, margin + pageWidth, y - rowHeight);
      drawLine(page, margin, y - rowHeight, margin + pageWidth, y - rowHeight);
      
      y -= rowHeight;
    });

    // Add total (right-aligned)
    y -= lineHeight * 2;
    const totalText = `Total Payment: $${submission.total_pay.toFixed(2)}`;
    const totalX = positionText(
      margin + pageWidth - columns[4].width - columns[3].width,
      columns[4].width + columns[3].width,
      totalText,
      helveticaBold,
      14,
      'right'
    );
    
    page.drawText(totalText, {
      x: totalX,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    
    // Add footer
    y = margin;
    const footerText = "This is an automated payment summary from Teaching Lab.";
    const supportText = `Please contact ${Deno.env.get("SUPPORT_EMAIL")} for any questions.`;
    
    page.drawText(footerText, {
      x: margin,
      y,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= lineHeight;
    
    page.drawText(supportText, {
      x: margin,
      y,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Save the PDF
    console.log("Saving PDF...");
    const pdfBytes = await pdfDoc.save();
    console.log("PDF generated successfully, size:", pdfBytes.length, "bytes");
    
    return pdfBytes;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

// Helper function to send email
export async function sendEmail(submission: VendorPaymentSubmission, pdf: Uint8Array): Promise<void> {
  console.log("Starting email sending for submission:", submission.id);
  try {
    console.log("Checking environment variables...");
    const fromEmail = "test@test.com";
    const supportEmail = "yancheng.pan@teachinglab.org";
    console.log("FROM_EMAIL exists:", !!fromEmail);
    console.log("SUPPORT_EMAIL exists:", !!supportEmail);

    console.log("Preparing email data...");
    // Convert Uint8Array to base64 string for the attachment
    const pdfBase64 = btoa(String.fromCharCode(...pdf));
    
    const emailData = {
      from: `onboarding@resend.dev`,
      to: "yancheng.pan@teachinglab.org",
      subject: `Your Teaching Lab Payment Summary - ${new Date(submission.created_at).toLocaleDateString()}`,
      html: `
        <h1>Teaching Lab Payment Summary</h1>
        <p>Dear ${submission.cf_name},</p>
        <p>Please find attached your payment summary for the period ending ${new Date(submission.created_at).toLocaleDateString()}.</p>
        <p>Total Payment: $${submission.total_pay.toFixed(2)}</p>
        <p>If you have any questions, please contact ${supportEmail}</p>
        <p>Best regards,<br>Teaching Lab Team</p>
      `,
      attachments: [{
        filename: `payment-summary-${submission.id}.pdf`,
        content: pdfBase64,
        contentType: 'application/pdf'
      }]
    };

    console.log("Sending email via Resend...");
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    throw error;
  }
}