# Suna frontend

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Basic Authentication

The application now includes basic HTTP authentication to prevent unauthorized access. You need to set the following environment variables:

```bash
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your_secure_password_here
```

If these environment variables are not set, the default credentials are:
- Username: `admin`
- Password: `password`

**Important**: Make sure to change these default credentials in production!

## Routing Changes

- The landing page has been temporarily disabled
- Root path (`/`) now redirects to:
  - `/dashboard` if the user is authenticated
  - `/auth` if the user is not authenticated
- The original landing page code is preserved in comments for future use

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
