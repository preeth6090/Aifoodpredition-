import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { InventoryProvider } from './context/InventoryContext'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import RecipeBuilder from './components/RecipeBuilder'
import IngredientManager from './components/IngredientManager'
import StockVariance from './components/StockVariance'
import PurchaseOrders from './components/PurchaseOrders'
import SalesRecorder from './components/SalesRecorder'
import VendorManager from './components/VendorManager'
import AdminFieldManager from './components/AdminFieldManager'
import StockCount from './components/StockCount'
import InvoiceScanner from './components/InvoiceScanner'
import AIInsights from './components/AIInsights'

export default function App() {
  return (
    <InventoryProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/recipes" element={<RecipeBuilder />} />
          <Route path="/ingredients" element={<IngredientManager />} />
          <Route path="/variance" element={<StockVariance />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/sales" element={<SalesRecorder />} />
          <Route path="/vendors" element={<VendorManager />} />
          <Route path="/stock-count" element={<StockCount />} />
          <Route path="/invoice-scanner" element={<InvoiceScanner />} />
          <Route path="/admin" element={<AdminFieldManager />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </InventoryProvider>
  )
}
