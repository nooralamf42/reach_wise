# reach_wise

A digital marketing agency site where brands find creators and creators join the network.

- **Creators** join through `/join` (a short, step-by-step profile form).
- **Brands** send a brief through `/brands`.
- **`/start`** lets visitors pick which they are.
- **`/admin`** (signed-in admins only) lists creators and brand enquiries and exports a CSV.

Built with Next.js (App Router), Tailwind CSS v4, Neon Postgres and Neon Auth (Better Auth).

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run db:setup             # creates the tables in Neon
npm run dev
```

Environment variables are listed in `.env.example`. Never commit `.env.local`.

## Notes

- Brand name and contact details live in `lib/site-config.ts`.
- Only emails in `ADMIN_EMAILS` can use `/admin`, and their email must be verified.
- Email and WhatsApp alerts for new sign-ups need Resend and Twilio keys (optional).
