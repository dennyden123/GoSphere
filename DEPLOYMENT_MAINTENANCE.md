# GroSphere: Deployment & Maintenance Manual

This guide outlines the procedures for deploying the GroSphere ecosystem to production and maintaining its long-term stability.

---

## 1. Production Environment Setup
Before deployment, ensure all production secrets are gathered:
- **Supabase:** `PROJECT_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DB_PASSWORD`.
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Hugging Face:** `HF_API_TOKEN`.
- **OpenWeather:** `OPENWEATHER_API_KEY`.

---

## 2. Backend Deployment (Supabase)
### Database & Schema
1.  **Initialize Project:** `supabase init` (if not already done).
2.  **Link Project:** `supabase link --project-ref <your-project-id>`.
3.  **Push Migrations:** `supabase db push`.
    *   *Note: This applies all migrations in `/supabase/migrations` to your production instance.*

### Edge Functions
Deploy each function located in `/supabase/functions`:
```bash
supabase functions deploy create-payment-intent --project-ref <id>
supabase functions deploy iot-ingest --project-ref <id>
```
*Ensure production secrets are set in Supabase:*
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_prod_... HF_API_TOKEN=hf_...
```

---

## 3. Web Deployment (Vercel)
1.  **Connect Repository:** Connect your GitHub repo to Vercel.
2.  **Configure Framework:** Select **Next.js**.
3.  **Root Directory:** Set to `apps/web`.
4.  **Environment Variables:** Add all `NEXT_PUBLIC_SUPABASE_*` and other required keys.
5.  **Build Command:** `cd ../.. && npm run build --workspace apps/web`.
6.  **Deploy:** Automatic on push to `main`.

---

## 4. Mobile Deployment (EAS)
The mobile app uses **Expo Application Services (EAS)**.
### Build
1.  **Configure EAS:** `eas build:configure`.
2.  **Production Build:** 
    ```bash
    eas build --platform all --profile production
    ```
3.  **Credentials:** Follow the interactive prompts to let Expo handle your iOS/Android signing credentials.

### Submission
Submit to the App Store and Google Play:
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 5. Maintenance Procedures
### Database Migrations
**Never** modify existing migrations. Always create a new migration for changes:
```bash
supabase migration new add_new_feature_table
```
Test locally with `supabase start` before pushing to production.

### Dependency Updates
Monthly audit of monorepo dependencies:
```bash
npm audit
npm update --workspace apps/mobile
npm update --workspace apps/web
```
*Note: Always verify Expo SDK compatibility before upgrading mobile packages.*

### Monitoring & Logs
- **Edge Functions:** Monitor performance and errors in the Supabase Dashboard under "Functions > Logs".
- **Telemetry Stream:** Use the `scripts/iot_simulator.js` with production credentials (occasionally) to verify the ingestion pipeline.
- **Error Tracking:** Consider integrating Sentry for real-time crash reporting in both mobile and web.

### Security Audit
- Rotate `SERVICE_ROLE_KEY` every 6 months.
- Review Supabase RLS policies if new tables are added.
- Audit GitHub Actions secrets regularly.

---

**Mission Control Reliability is Paramount.**
*GroSphere DevOps v1.0*
