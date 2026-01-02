export function getBaseUrl() {
  // const origin = (await headers()).get("origin");

  // if (process.env.VERCEL_ENV === "production") {
  //   return `https://www.my-custom-domain.com`; // Replace with your actual custom domain
  // }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`; // https://z1mak-cv.vercel.app
  } else {
    return `http://localhost:3000`; // Local development URL
  }
}
