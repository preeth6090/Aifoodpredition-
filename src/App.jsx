import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import { ThemeProvider } from './context/ThemeContext'
import { TableProvider } from './context/TableContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import RecipeBuilder from './components/RecipeBuilder'
import IngredientManager from './components/IngredientManager'
import StockVariance from './components/StockVariance'
import PurchaseOrders from './components/PurchaseOrders'
import SalesRecorder from './components/SalesRecorder'
import VendorManager from './components/VendorManager'
import VendorPayments from './components/VendorPayments'
import AdminFieldManager from './components/AdminFieldManager'
import StockCount from './components/StockCount'
import InvoiceScanner from './components/InvoiceScanner'
import AIInsights from './components/AIInsights'
import BulkUpload from './components/BulkUpload'
import TableManagement from './components/TableManagement'
import KitchenDisplay from './components/KitchenDisplay'
import CustomerMenu from './components/CustomerMenu'

export default function App() {
  return (
    <ThemeProvider>
      <InventoryProvider>
        <TableProvider>
          <Routes>
            {/* Public customer-facing QR menu — no sidebar */}
            <Route path="/menu/:tableId" element={<CustomerMenu />} />

            {/* All restaurant routes wrapped in Layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/"                element={<Dashboard />} />
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
                  <Route path="*"               element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </TableProvider>
      </InventoryProvider>
    </ThemeProvider>
  )
}
