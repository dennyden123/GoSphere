# GroSphere: Premium Service Transition Guide

This document outlines the strategic roadmap for transitioning GroSphere from "Free/Developer" tiers to "Premium/Production" services as the platform scales.

---

## 1. Supabase (Backend & Database)
**Current:** Local/Free Tier (2 project limit, 500MB DB, pausing after inactivity).
**Premium Path:** **Supabase Pro** ($25/mo + usage).
- **Why Upgrade:** Daily backups, no project pausing, 8GB database limit, and significantly higher egress for telemetry data.
- **Transition Steps:**
    1.  Upgrade via Supabase Dashboard.
    2.  Enable **Point-in-Time Recovery (PITR)** for garden logs.
    3.  Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in EAS/Vercel secrets to point to the production project.

## 2. Hugging Face (AI Diagnostics)
**Current:** Free Inference API (Rate limited, shared compute).
**Premium Path:** **Inference Endpoints** (Pay-as-you-go) or **PRO Plan**.
- **Why Upgrade:** Dedicated GPU compute for plant/disease diagnostics, lower latency, and 99.9% uptime SLA.
- **Transition Steps:**
    1.  Provision a dedicated **Inference Endpoint** for the `microsoft/resnet-50` or custom models.
    2.  Update `EXPO_PUBLIC_HF_API_TOKEN` in `mobile/src/lib/ai/huggingFace.ts` to the new dedicated endpoint token.
    3.  Update the `HF_ENDPOINT_URL` in environment variables.

## 3. Stripe (Payments & Marketplace)
**Current:** Test Mode (Simulated transactions).
**Premium Path:** **Live Mode**.
- **Why Upgrade:** Real revenue generation.
- **Transition Steps:**
    1.  Complete the "Business Verification" in Stripe Dashboard.
    2.  Replace `pk_test_...` with `pk_live_...` in `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
    3.  Replace `sk_test_...` with `sk_live_...` in Supabase Secrets for the `create-payment-intent` function.
    4.  Update the Webhook secret to the production version.

## 4. Expo / EAS (Mobile Build & Distribution)
**Current:** Free Plan (Shared build queues, limited internal distribution).
**Premium Path:** **Production Plan** ($29/mo+).
- **Why Upgrade:** Priority build queues (no waiting), larger build sizes, and "Internal Distribution" for testing on up to 100 devices without App Store approval.
- **Transition Steps:**
    1.  Upgrade via Expo Dashboard.
    2.  Configure `eas.json` with `production` profiles for Apple and Google credentials.

## 5. OpenWeather (Smart Guidance Data)
**Current:** Free API (1,000 calls/day limit).
**Premium Path:** **One Call API 3.0** (Pay-as-you-go after first 1,000 daily calls).
- **Why Upgrade:** Hyper-local precipitation data and 1-hour forecasting for more precise watering reminders.
- **Transition Steps:**
    1.  Enable billing in OpenWeather account.
    2.  Ensure `OPENWEATHER_API_KEY` is configured in Supabase Secrets (for Edge Functions) and mobile environment variables.

## 6. Vercel (Web Hosting)
**Current:** Hobby Plan (Personal use only).
**Premium Path:** **Pro Plan** ($20/user/mo).
- **Why Upgrade:** Commercial use rights, 1TB bandwidth, and higher Edge Function execution limits.
- **Transition Steps:**
    1.  Upgrade the Vercel team account.
    2.  Enable "Web Analytics Plus" for deeper user success insights.

---

## 📈 Scalability Milestones
| User Count | Action Recommended |
| :--- | :--- |
| **0 - 100** | Stay on Free Tiers (Current Setup). |
| **100 - 1,000** | Upgrade to **Supabase Pro** and **OpenWeather Pay-as-you-go**. |
| **1,000 - 10,000** | Move to **HF Inference Endpoints** and **EAS Production Plan**. |
| **10,000+** | Evaluate **Stripe Custom Pricing** and dedicated database instances. |

---

**Grow your infrastructure as you grow your garden.**
*GroSphere Ops v1.0*
