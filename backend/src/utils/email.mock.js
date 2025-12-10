exports.sendResetEmail = async ({ to, resetLink }) => {
  // Replace with real email sending (SendGrid / Nodemailer) in production.
  console.log('=== MOCK EMAIL ===');
  console.log(`To: ${to}`);
  console.log('Subject: Password reset for IAM College Portal');
  console.log('Body: Use the following link to reset your password:');
  console.log(resetLink);
  console.log('==================');
  return true;
};
