/** True on Vercel / AWS Lambda (serverless PDF uses @sparticuz/chromium). */
export function isServerlessHost(): boolean {
  return (
    process.env.VERCEL === "1" ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
  );
}
