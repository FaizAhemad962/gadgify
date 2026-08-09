# Vercel Deployment Guide

This guide is a short, practical setup for deploying Gadgify with Vercel.

## 1. What to deploy

- Frontend: deploy the frontend app on Vercel.
- Backend: if you want the API on Vercel too, deploy the backend folder as a separate Vercel project.
- Database: keep PostgreSQL in a managed service such as Neon, Supabase, Railway, or Azure Database for PostgreSQL.

## 2. Recommended project structure

- Frontend project: [frontend](frontend)
- Backend project: [backend](backend)
- Root docs: [docs](docs)

## 3. Frontend deployment on Vercel

1. Open Vercel and create a new project.
2. Import the GitHub repository.
3. Set the project root to the frontend folder.
4. Build command:
   - `npm run build`
5. Output directory:
   - `dist`
6. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` = your backend URL
   - any other frontend env variables used by the app
7. Deploy.

For this frontend codebase, set:

- `VITE_API_URL` = `https://your-backend-project.vercel.app/api`

## 4. Backend deployment on Vercel

If you want to host the API on Vercel:

1. Create a second Vercel project.
2. Set the project root to the backend folder.
3. Add a Vercel config file in the backend folder.
4. Make sure the API entry is compatible with serverless hosting.
5. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` = `https://your-frontend-project.vercel.app`
   - `CROSS_DOMAIN_COOKIES` = `true`
   - `STRIPE_SECRET_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
6. Deploy.

## 5. Important notes

- Vercel is best for the frontend.
- The backend should be deployed only if the project is adapted for serverless functions.
- The current app uses Express and Prisma, so the server must be wrapped for serverless usage.
- Prisma Client is generated during dependency installation with `postinstall`.
- Do not hardcode secrets in the codebase.
- Make sure CORS and cookies are configured correctly for frontend-to-backend requests.
- Vercel serverless functions do not provide persistent file storage. Product/media uploads should use external storage such as Cloudinary, S3, Azure Blob Storage, or Vercel Blob.

## 6. Quick checklist

- [ ] Frontend project connected to Vercel
- [ ] Backend project connected separately if needed
- [ ] Build command verified
- [ ] Environment variables added
- [ ] Database URL configured
- [ ] Health check tested
- [ ] Login and API requests tested in production

## 7. After deployment

1. Open the frontend URL.
2. Test login, signup, product listing, and checkout flow.
3. Verify the API health endpoint.
4. Confirm environment variables are correct.
5. Check browser network requests for CORS and cookie errors.

## 8. Common issues

- Build fails: check the build command and dependencies.
- API returns 500: verify environment variables and database connection.
- Cookies do not work: confirm `SameSite=None; Secure` and CORS credentials settings.
- CORS error: allow the frontend domain in the backend config.

## 9. What is done vs what is remaining

### Done

- Frontend is already working on Vercel.
- A short Vercel deployment guide has been created for the team.
- The project structure is already separated into frontend and backend folders.

### Remaining

- Backend must be deployed as its own Vercel project with root directory set to `backend`.
- Environment variables must be added in Vercel for the backend project.
- Database connection and Prisma migrations must be verified in the deployed backend environment.
- Production testing for login, cookies, uploads, and API requests still needs to be completed.
