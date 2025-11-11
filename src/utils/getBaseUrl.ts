export function getBaseUrl() {
  // if (process.env.VERCEL_ENV === "production") {
  //   return `https://www.my-custom-domain.com`; // Replace with your actual custom domain
  // }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  } else {
    return `http://localhost:3000`; // Local development URL
  }
}
