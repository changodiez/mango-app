import { useState } from 'react'
import { Edit3, Trash2, Search, Save, X } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { TransactionManager } from './TransactionManager'

export function TransactionList() {
  const { transactions, deleteTransaction, updateTransaction, loading } = useTransactions()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ 
    amount: '', 
    category: '', 
    description: '',
    type: 'expense' 
  })

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' ||
      (filterType === 'income' && transaction.amount > 0) ||
      (filterType === 'expense' && transaction.amount < 0)
    return matchesSearch && matchesType
  })

  const handleEdit = (transaction) => {
    setEditingId(transaction.id)
    setEditForm({
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      description: transaction.description || '',
      type: transaction.amount >= 0 ? 'income' : 'expense'
    })
  }

  const handleSaveEdit = async (id) => {
    try {
      await updateTransaction(id, editForm)
      setEditingId(null)
      // Opcional: mostrar mensaje de éxito
    } catch (error) {
      alert('Error al actualizar la transacción: ' + error.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ amount: '', category: '', description: '', type: 'expense' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await deleteTransaction(id)
        alert('Transacción eliminada correctamente')
      } catch (error) {
        alert('Error al eliminar la transacción: ' + error.message)
      }
    }
  }

  const formatAmount = (amount) => {
    const isPositive = amount >= 0
    return (
      <span className={`amount ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '+$' : '-$'}{Math.abs(amount).toFixed(2)}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Cargando transacciones...</div>
  }

  return (
    <div className="transaction-list-page">
      <div className="transactions-with-sidebar">
        <div className="transactions-main">
          <div className="page-header">
            <h2>📋 Lista de Transacciones</h2>
            <p>Gestiona todas tus transacciones en un solo lugar</p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="filters-section">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Todas
              </button>
              <button
                className={`filter-btn ${filterType === 'income' ? 'active' : ''}`}
                onClick={() => setFilterType('income')}
              >
                Ingresos
              </button>
              <button
                className={`filter-btn ${filterType === 'expense' ? 'active' : ''}`}
                onClick={() => setFilterType('expense')}
              >
                Gastos
              </button>
            </div>
          </div>

          {/* Lista de transacciones */}
          <div className="transactions-container">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron transacciones</p>
                {searchTerm || filterType !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('all')
                    }}
                    className="clear-filters-btn"
                  >
                    Limpiar filtros
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="transactions-table">
                {filteredTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-row">
                    {editingId === transaction.id ? (
                      // Formulario de edición
                      <div className="edit-form">
                        <div className="edit-form-row">
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                            className="type-select"
                          >
                            <option value="income">Ingreso</option>
                            <option value="expense">Gasto</option>
                          </select>
                          
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="Monto"
                            className="amount-input"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="edit-form-row">
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                            placeholder="Categoría"
                            className="category-input"
                          />
                          
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción"
                            className="description-input"
                          />
                        </div>
                        
                        <div className="edit-actions">
                          <button
                            onClick={() => handleSaveEdit(transaction.id)}
                            className="save-btn"
                          >
                            <Save size={16} />
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="cancel-btn"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Vista normal
                      <>
                        <div className="transaction-info">
                          <div className="transaction-main">
                            <span className="category">{transaction.category}</span>
                            <span className="description">
                              {transaction.description || 'Sin descripción'}
                            </span>
                          </div>
                          <div className="transaction-meta">
                            <span className="date">{formatDate(transaction.date)}</span>
                            <span className="type-badge">
                              {transaction.amount >= 0 ? 'Ingreso' : 'Gasto'}
                            </span>
                          </div>
                        </div>

                        <div className="transaction-actions">
                          {formatAmount(transaction.amount)}
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="edit-btn"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="delete-btn"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <aside className="transactions-sidebar">
          <TransactionManager />
        </aside>
      </div>
    </div>
  )
}