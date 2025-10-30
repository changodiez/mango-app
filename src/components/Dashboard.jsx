import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useTransactions } from '../hooks/useTransactions'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

export function Dashboard() {
  const { transactions, loading, refetch } = useTransactions()
  const [forceUpdate, setForceUpdate] = useState(0) // 🔥 Estado para forzar re-render

  // 🔥 ESCUCHAR el evento personalizado
  useEffect(() => {
    const handleTransactionAdded = () => {
      console.log('🎯 Evento transactionAdded recibido, forzando re-fetch')
      refetch() // Forzar re-carga de transacciones
      setForceUpdate(prev => prev + 1) // Forzar re-render
    }
    
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded)
  }, [refetch])


  if (loading) {
    return <div className="dashboard-loading">Cargando datos...</div>
  }

  // Cálculos (igual que antes)
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)
  const balance = totalIncome - totalExpenses

  const expenseTransactions = transactions.filter(t => t.amount < 0)
  const categoryData = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    const amount = Math.abs(parseFloat(transaction.amount))
    acc[category] = (acc[category] || 0) + amount
    return acc
  }, {})

  const pieChartData = Object.keys(categoryData).map(category => ({
    name: category,
    value: parseFloat(categoryData[category].toFixed(2))
  }))

  return (
    <div className="dashboard">
      <h2>Dashboard Financiero</h2>
            
      <div className="summary-cards">
        <div className="summary-card income">
          <h4>Total Ingresos</h4>
          <span className="amount">${totalIncome.toFixed(2)}</span>
        </div>
        
        <div className="summary-card expense">
          <h4>Total Gastos</h4>
          <span className="amount">${totalExpenses.toFixed(2)}</span>
        </div>
        
        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <h4>Balance</h4>
          <span className="amount">${balance.toFixed(2)}</span>
        </div>
      </div>

      {expenseTransactions.length > 0 ? (
        <div className="charts-grid">
          <div className="chart-container">
            <h4>🎯 Gastos por Categoría</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Gasto']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="no-data">
          <p>No hay transacciones aún. ¡Agrega tu primera transacción!</p>
        </div>
      )}
    </div>
  )
}