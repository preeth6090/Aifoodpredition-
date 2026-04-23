import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import { ThemeProvider } from './context/ThemeContext'
import { TableProvider } from './context/TableContext'
import { AuthProvider, useAuth, ROLE_CONFIG } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import RecipeBuilder from './components/RecipeBuilder'
import IngredientManager from './components/IngredientManager'
import StockVariance from './components/StockVariance'
import PurchaseOrders from './components/PurchaseOrders'
import SalesRecorder from './components/SalesRecorder'
import VendorManager from './components/VendorManager'
import VendorPayments from './components/VendorPayments'
import VendorPortal from './components/VendorPortal'
import AdminFieldManager from './components/AdminFieldManager'
import StockCount from './components/StockCount'
import InvoiceScanner from './components/InvoiceScanner'
import AIInsights from './components/AIInsights'
import BulkUpload from './components/BulkUpload'
import TableManagement from './components/TableManagement'
import KitchenDisplay from './components/KitchenDisplay'
import CustomerMenu from './components/CustomerMenu'

// ── Route guard ───────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── Role home redirect ────────────────────────────────────────────
function RoleHome() {
  const { user } = useAuth()
  const home = ROLE_CONFIG[user?.role]?.home || '/'
  if (home === '/tables')  return <TableManagement />
  if (home === '/kitchen') return <KitchenDisplay />
  if (home === '/vendor')  return <VendorPortal />
  return <Dashboard />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <TableProvider>
            <Routes>
              {/* Public: login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public: customer QR menu */}
              <Route path="/menu/:tableId" element={<CustomerMenu />} />

              {/* Protected app routes */}
              <Route path="/*" element={
                <RequireAuth>
                  <Layout>
                    <Routes>
                      <Route path="/"                element={<RoleHome />} />
                      <Route path="/recipes"         element={<RecipeBuilder />} />
                      <Route path="/ingredients"     element={<IngredientManager />} />
                      <Route path="/variance"        element={<StockVariance />} />
                      <Route path="/purchase-orders" element={<PurchaseOrders />} />
                      <Route path="/payments"        element={<VendorPayments />} />
                      <Route path="/sales"           element={<SalesRecorder />} />
                      <Route path="/vendors"         element={<VendorManager />} />
                      <Route path="/tables"          element={<TableManagement />} />
                      <Route path="/kitchen"         element={<KitchenDisplay />} />
                      <Route path="/stock-count"     element={<StockCount />} />
                      <Route path="/invoice-scanner" element={<InvoiceScanner />} />
                      <Route path="/admin"           element={<AdminFieldManager />} />
                      <Route path="/ai-insights"     element={<AIInsights />} />
                      <Route path="/bulk-upload"     element={<BulkUpload />} />
                      <Route path="/vendor"          element={<VendorPortal />} />
                      <Route path="*"               element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </RequireAuth>
              } />
            </Routes>
          </TableProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
