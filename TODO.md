# Sub-Role System with PIN Access

## Responsibilities (sample):
- finance: AdminFinance, AdminPaymentAccounts, AdminReports
- delivery: AdminDelivery, DeliveryScannerPage
- orders: AdminOrders
- super-admin: All (existing 'admin' role)

## Sample PIN Codes:
- finance: 1234
- delivery: 5678  
- orders: 9012

## Steps:
- [x] 1. Create detailed TODO.md
- [ ] 2. Update supabase-setup.sql: Add responsibilities JSONB, access_codes table, RPC
- [x] 3. src/utils/constants.js: RESPONSIBILITIES array
- [x] 4. src/context/AuthContext.jsx: Add pinRole state/session
- [x] 5. src/pages/auth/PinLoginPage.jsx: New PIN login for sub-roles
- [x] 6. src/App.jsx: Add /admin/pin route
- [x] 7. src/components/layout/AdminSidebar.jsx: Conditional nav by responsibility
- [ ] 8. src/pages/admin/AdminSettings.jsx: Role assignment UI
- [ ] 9. Update ProtectedRoute: Support pinRole access
- [ ] 10. Test + complete

