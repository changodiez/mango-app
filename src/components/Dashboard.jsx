import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Plus, Calendar } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { TransactionManager } from './TransactionManager'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

export function Dashboard() {
  const { transactions, loading, refetch, dateFilter, setDateFilter } = useTransactions()
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  useEffect(() => {
    const handleTransactionAdded = () => {
      refetch()
      setForceUpdate(prev => prev + 1)
    }
    
    window.addEventListener('transactionAdded', handleTransactionAdded)
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded)
  }, [refetch])

  if (loading) {
    return <div className="dashboard-loading">Cargando datos...</div>
  }

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

  const handlePeriodChange = (period) => {
    setDateFilter(prev => ({ ...prev, period }))
  }

  const getPeriodText = () => {
    const periods = {
      today: 'Hoy',
      week: 'Esta semana',
      currentMonth: 'Este mes',
      lastMonth: 'Mes pasado',
      all: 'Todos los periodos'
    }
    return periods[dateFilter.period] || 'Período actual'
  }

  return (
    <div className="dashboard">
      {/* 🔥 HEADER COMPACTO Y UNIFICADO */}
      <div className="dashboard-header-compact">
        <div className="compact-balance">
          <div className="balance-main">
            <span className="balance-label">Balance</span>
            <span className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="compact-controls">
          <div className="period-selector-compact">
            <Calendar size={18} />
            <select 
              value={dateFilter.period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="period-select-compact"
            >
              <option value="today">Hoy</option>
              <option value="week">Semana</option>
              <option value="currentMonth">Mes</option>
              <option value="lastMonth">Mes pasado</option>
              <option value="all">Todos</option>
            </select>
          </div>

          <button 
            className="add-transaction-btn-compact"
            onClick={() => setIsTransactionModalOpen(true)}
            title="Agregar Transacción"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="summary-cards-compact">
        <div className="summary-card-compact income">
          <span className="summary-label">Ingresos</span>
          <span className="summary-amount income">${totalIncome.toFixed(2)}</span>
        </div>
        
        <div className="summary-card-compact expense">
          <span className="summary-label">Gastos</span>
          <span className="summary-amount expense">${totalExpenses.toFixed(2)}</span>
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
          <p>No hay transacciones en {getPeriodText().toLowerCase()}. ¡Agrega tu primera transacción!</p>
          <button 
            className="add-transaction-btn"
            onClick={() => setIsTransactionModalOpen(true)}
          >
            <Plus size={20} />
            Agregar Primera Transacción
          </button>
        </div>
      )}

      <TransactionManager 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  )
}