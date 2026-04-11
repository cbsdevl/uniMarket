# Fix Admin Sidebar Mobile Visibility - TODO List

**Status**: In Progress

## Steps from Approved Plan:
- [x] 1. Update src/App.jsx: Import real AdminLayout, remove dummy, wrap all admin Routes with <AdminLayout title=\"Page Name\"><Page /></AdminLayout>
- [x] 2. For each of 11 src/pages/admin/*.jsx: Remove import AdminSidebar, replace outer flex div with <>, remove <AdminSidebar />, remove lg:ml-80 from main
- [ ] 3. Update TODO-admin-layout.md to mark complete
- [ ] 4. Update TODO-admin-sidebar-mobile.md and TODO.md to complete
- [ ] 5. Test: npm run dev, login admin, test /admin subroutes on mobile (devtools: responsive <768px, check hamburger toggle)
- [ ] 6. attempt_completion

