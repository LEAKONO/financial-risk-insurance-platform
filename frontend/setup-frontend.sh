#!/bin/bash

# === FOLDERS ===
mkdir -p public
mkdir -p src/assets/images/patterns
mkdir -p src/assets/icons/social
mkdir -p src/assets/icons/insurance
mkdir -p src/components/layout/Sidebar
mkdir -p src/components/layout/Topbar
mkdir -p src/components/layout/Footer
mkdir -p src/components/layout/Breadcrumbs
mkdir -p src/components/ui/Button
mkdir -p src/components/ui/Card
mkdir -p src/components/ui/Form
mkdir -p src/components/ui/Table
mkdir -p src/components/ui/Modal
mkdir -p src/components/ui/Badge
mkdir -p src/components/ui/Progress
mkdir -p src/components/charts
mkdir -p src/components/admin/dashboard
mkdir -p src/components/admin/users
mkdir -p src/components/admin/policies
mkdir -p src/components/admin/claims
mkdir -p src/components/admin/activity
mkdir -p src/components/admin/reports
mkdir -p src/components/auth
mkdir -p src/components/claims
mkdir -p src/components/policy
mkdir -p src/components/risk
mkdir -p src/components/common
mkdir -p src/pages/admin/Dashboard
mkdir -p src/pages/admin/Users
mkdir -p src/pages/admin/Policies
mkdir -p src/pages/admin/Claims
mkdir -p src/pages/admin/Activity
mkdir -p src/pages/admin/Reports
mkdir -p src/pages/dashboard/Overview
mkdir -p src/pages/dashboard/Policies
mkdir -p src/pages/dashboard/Claims
mkdir -p src/pages/dashboard/Profile
mkdir -p src/pages/auth/Login
mkdir -p src/pages/auth/Register
mkdir -p src/pages/auth/ForgotPassword
mkdir -p src/pages/auth/ResetPassword
mkdir -p src/pages/risk
mkdir -p src/pages/Home
mkdir -p src/pages/404
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/context
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/types
mkdir -p src/config

# === PUBLIC FILES ===
touch public/favicon.ico
touch public/logo.svg
touch public/robots.txt

# === ASSETS ===
touch src/assets/images/logo.png
touch src/assets/images/hero-bg.jpg

# === COMPONENTS ===
# Layout
touch src/components/layout/MainLayout.jsx
touch src/components/layout/DashboardLayout.jsx
touch src/components/layout/AdminLayout.jsx
touch src/components/layout/Sidebar/Sidebar.jsx
touch src/components/layout/Sidebar/SidebarItem.jsx
touch src/components/layout/Sidebar/SidebarMenu.jsx
touch src/components/layout/Topbar/Topbar.jsx
touch src/components/layout/Topbar/UserMenu.jsx
touch src/components/layout/Topbar/Notifications.jsx
touch src/components/layout/Footer/Footer.jsx
touch src/components/layout/Footer/Copyright.jsx
touch src/components/layout/Breadcrumbs/Breadcrumbs.jsx

# UI
touch src/components/ui/Button/Button.jsx
touch src/components/ui/Button/IconButton.jsx
touch src/components/ui/Button/ButtonGroup.jsx
touch src/components/ui/Card/Card.jsx
touch src/components/ui/Card/StatsCard.jsx
touch src/components/ui/Card/InfoCard.jsx
touch src/components/ui/Card/ActionCard.jsx
touch src/components/ui/Form/Input.jsx
touch src/components/ui/Form/Select.jsx
touch src/components/ui/Form/Checkbox.jsx
touch src/components/ui/Form/Radio.jsx
touch src/components/ui/Form/DatePicker.jsx
touch src/components/ui/Form/FileUpload.jsx
touch src/components/ui/Table/DataTable.jsx
touch src/components/ui/Table/TableHeader.jsx
touch src/components/ui/Table/TableRow.jsx
touch src/components/ui/Table/TablePagination.jsx
touch src/components/ui/Modal/Modal.jsx
touch src/components/ui/Modal/ConfirmModal.jsx
touch src/components/ui/Modal/Drawer.jsx
touch src/components/ui/Badge/Badge.jsx
touch src/components/ui/Badge/StatusBadge.jsx
touch src/components/ui/Badge/PriorityBadge.jsx
touch src/components/ui/Progress/ProgressBar.jsx
touch src/components/ui/Progress/CircularProgress.jsx

# Charts
touch src/components/charts/LineChart.jsx
touch src/components/charts/BarChart.jsx
touch src/components/charts/PieChart.jsx
touch src/components/charts/AreaChart.jsx
touch src/components/charts/DonutChart.jsx
touch src/components/charts/Sparkline.jsx
touch src/components/charts/ChartTooltip.jsx

# Admin components
touch src/components/admin/dashboard/StatsOverview.jsx
touch src/components/admin/dashboard/RevenueChart.jsx
touch src/components/admin/dashboard/UserGrowthChart.jsx
touch src/components/admin/dashboard/RiskDistributionChart.jsx
touch src/components/admin/dashboard/RecentActivity.jsx
touch src/components/admin/users/UserTable.jsx
touch src/components/admin/users/UserForm.jsx
touch src/components/admin/users/UserDetails.jsx
touch src/components/admin/users/UserActions.jsx
touch src/components/admin/policies/PolicyTable.jsx
touch src/components/admin/policies/PolicyForm.jsx
touch src/components/admin/policies/PolicyDetails.jsx
touch src/components/admin/policies/PolicyActions.jsx
touch src/components/admin/claims/ClaimsTable.jsx
touch src/components/admin/claims/ClaimDetails.jsx
touch src/components/admin/claims/ClaimReview.jsx
touch src/components/admin/claims/FraudAnalysis.jsx
touch src/components/admin/activity/ActivityLog.jsx
touch src/components/admin/activity/ActivityFilters.jsx
touch src/components/admin/activity/ActivityDetails.jsx
touch src/components/admin/reports/ReportGenerator.jsx
touch src/components/admin/reports/FinancialReport.jsx
touch src/components/admin/reports/ExportOptions.jsx

# Auth components
touch src/components/auth/LoginForm.jsx
touch src/components/auth/RegisterForm.jsx
touch src/components/auth/SocialAuth.jsx
touch src/components/auth/ForgotPassword.jsx
touch src/components/auth/ResetPassword.jsx

# Claims
touch src/components/claims/ClaimCard.jsx
touch src/components/claims/ClaimForm.jsx
touch src/components/claims/ClaimHistory.jsx
touch src/components/claims/ClaimStatus.jsx
touch src/components/claims/DocumentUpload.jsx

# Policy
touch src/components/policy/PolicyCard.jsx
touch src/components/policy/PolicyList.jsx
touch src/components/policy/PremiumBreakdown.jsx
touch src/components/policy/PolicyForm.jsx
touch src/components/policy/CoverageSelector.jsx

# Risk
touch src/components/risk/RiskCalculator.jsx
touch src/components/risk/RiskProfileForm.jsx
touch src/components/risk/RiskSummary.jsx
touch src/components/risk/RiskFactors.jsx
touch src/components/risk/RiskScore.jsx

# Common
touch src/components/common/ErrorBoundary.jsx
touch src/components/common/Header.jsx
touch src/components/common/Footer.jsx
touch src/components/common/Loader.jsx
touch src/components/common/Toast.jsx
touch src/components/common/EmptyState.jsx
touch src/components/common/SearchBar.jsx
touch src/components/common/Pagination.jsx
touch src/components/common/FilterPanel.jsx
touch src/components/common/Tooltip.jsx
touch src/components/common/ProtectedRoute.jsx

# Pages
touch src/pages/admin/Dashboard/index.jsx
touch src/pages/admin/Users/index.jsx
touch src/pages/admin/Policies/index.jsx
touch src/pages/admin/Claims/index.jsx
touch src/pages/admin/Activity/index.jsx
touch src/pages/admin/Reports/index.jsx
touch src/pages/dashboard/index.jsx
touch src/pages/dashboard/Overview/index.jsx
touch src/pages/dashboard/Policies/index.jsx
touch src/pages/dashboard/Claims/index.jsx
touch src/pages/dashboard/Profile/index.jsx
touch src/pages/auth/Login/index.jsx
touch src/pages/auth/Register/index.jsx
touch src/pages/auth/ForgotPassword/index.jsx
touch src/pages/auth/ResetPassword/index.jsx
touch src/pages/risk/index.jsx
touch src/pages/Home/index.jsx
touch src/pages/404/index.jsx

# Hooks
touch src/hooks/useAuth.js
touch src/hooks/useApi.js
touch src/hooks/useLocalStorage.js
touch src/hooks/useDebounce.js
touch src/hooks/usePagination.js
touch src/hooks/useFilters.js
touch src/hooks/useModal.js
touch src/hooks/useToast.js
touch src/hooks/useWindowSize.js
touch src/hooks/useTheme.js

# Services
touch src/services/api.js
touch src/services/auth.service.js
touch src/services/admin.service.js
touch src/services/user.service.js
touch src/services/policy.service.js
touch src/services/claim.service.js
touch src/services/risk.service.js
touch src/services/activity.service.js
touch src/services/upload.service.js

# Context
touch src/context/AuthContext.jsx
touch src/context/ThemeContext.jsx
touch src/context/ToastContext.jsx
touch src/context/LoadingContext.jsx
touch src/context/ModalContext.jsx

# Utils
touch src/utils/constants.js
touch src/utils/formatters.js
touch src/utils/validators.js
touch src/utils/helpers.js
touch src/utils/charts.js
touch src/utils/dates.js
touch src/utils/numbers.js
touch src/utils/strings.js

# Styles
touch src/styles/globals.css
touch src/styles/theme.css
touch src/styles/animations.css
touch src/styles/components.css

# Types
touch src/types/user.ts
touch src/types/policy.ts
touch src/types/claim.ts
touch src/types/risk.ts
touch src/types/api.ts

# Config
touch src/config/routes.js
touch src/config/theme.js
touch src/config/apiEndpoints.js

# Entry points
touch src/App.jsx
touch src/main.jsx

# Root files
touch .env
touch .env.example
touch tailwind.config.js
touch vite.config.js
touch package.json
touch package-lock.json
touch README.md
touch .gitignore

echo "✅ Folder structure created successfully!"
