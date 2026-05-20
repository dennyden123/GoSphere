# GroSphere Marketplace

## Overview
The GroSphere Marketplace is a dedicated storefront for urban gardening supplies, allowing users to acquire seeds, tools, and hardware sensors directly within the platform.

## Architecture
### 1. Database Schema
Evolved the Supabase schema (Migration `20260520000005_marketplace.sql`) to support commerce:
- **`products`:** Catalog of available items with price, stock, and category tracking.
- **`orders`:** Tracks user purchases and payment status.
- **`order_items`:** Line items for each order, preserving unit price at time of purchase.

### 2. Mobile Storefront & Checkout
- **Marketplace Screen:** A filterable catalog (`MarketplaceScreen.tsx`) with category-based product discovery.
- **Global Shopping Cart:** Implemented `CartContext.tsx` to manage acquisition state across the platform.
- **Checkout Flow:** Developed `CheckoutScreen.tsx` for order review, total calculation, and transaction finalization.
- **Acquisition Logic:** Automated the creation of `orders` and `order_items` in Supabase upon checkout.
- **HUD Integration:** Added dynamic cart badges and interactive "Acquire" triggers with real-time stock feedback.

### 3. Secure Payment Integration
- **Stripe SDK:** Integrated `@stripe/stripe-react-native` for secure on-device payment processing.
- **Supabase Edge Function:** Developed `create-payment-intent` to safely communicate with Stripe's API without exposing secret keys.
- **Native Checkout Flow:** Implemented the Stripe Payment Sheet for a seamless, Apple/Google Pay-ready acquisition experience.
- **Order Synchronization:** Automatically persists confirmed transactions to the `orders` and `order_items` tables after successful payment.

## Initial Product Lineup
- **Heirloom Seeds:** Optimized for urban containers.
- **IoT Hardware:** Official GroSphere soil sensors with automatic Mission Control linking.
- **Specialized Tools:** Ergonomic pruning shears and precision instruments.

## Next Steps
1.  **Checkout Flow:** Implement the shopping cart and checkout UI.
2.  **Stripe Integration:** Develop the `create-payment-intent` Edge Function.
3.  **Community Seed Swap:** Extend the marketplace to allow users to list their own seeds for trade.
