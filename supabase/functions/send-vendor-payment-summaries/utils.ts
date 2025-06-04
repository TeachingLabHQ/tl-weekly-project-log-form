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
      const recipientEmail = ["accountspayable@teachinglab.org", "yancheng.pan@teachinglab.org"];
      const emailData = {
        from: "Teaching Lab Payments <yancheng.pan@teachinglab.org>", // Use sender name
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