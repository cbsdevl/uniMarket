# Fix Admin Layout Duplicates - TODO List

**Status**: In Progress

## Steps from Approved Plan:
- [ ] 1. Create this TODO.md
- [ ] 2. Read all src/pages/admin/*.jsx contents
- [ ] 3. Remove duplicate layouts/AdminSidebar from all 11 admin pages
  - Delete import AdminSidebar
  - Remove <div className="flex min-h-screen bg-gray-50">
  - Remove <AdminSidebar />
  - Remove <main className="flex-1 p-6 lg:ml-80 lg:p-8">, unwrap content into fragments <>
- [ ] 4. Edit TODO-admin-layout.md to mark fully complete
- [ ] 5. Verify no lint errors
- [ ] 6. Test: npm run dev, login admin, check /admin and subroutes have single sidebar
- [ ] 7. Update TODO.md complete, attempt_completion

