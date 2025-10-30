import { useState } from 'react'
import { Plus, Edit3, Trash2 } from 'lucide-react'

export function CategoryManager({ categories, onAddCategory, onEditCategory, onDeleteCategory }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', type: 'expense', color: '#FF6B6B' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      onEditCategory(editingId, formData)
      setEditingId(null)
    } else {
      onAddCategory(formData)
    }
    
    setFormData({ name: '', type: 'expense', color: '#FF6B6B' })
    setIsAdding(false)
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    })
    setIsAdding(true)
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', type: 'expense', color: '#FF6B6B' })
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  const incomeCategories = categories.filter(cat => cat.type === 'income')

  return (
    <div className="category-manager">
      <div className="category-header">
        <h4>🎨 Categorías</h4>
        <button 
          onClick={() => setIsAdding(true)}
          className="add-category-btn"
        >
          <Plus size={16} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="category-form">
          <input
            type="text"
            placeholder="Nombre de categoría"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingId ? 'Actualizar' : 'Agregar'}
            </button>
            <button type="button" onClick={cancelEdit} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        <div className="category-group">
          <h5>💰 Gastos</h5>
          {expenseCategories.map(category => (
            <div key={category.id} className="category-item">
              <span 
                className="color-dot" 
                style={{ backgroundColor: category.color }}
              />
              <span className="category-name">{category.name}</span>
              <div className="category-actions">
                <button onClick={() => startEdit(category)} className="edit-btn">
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => onDeleteCategory(category.id)} 
                  className="delete-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="category-group">
          <h5>💵 Ingresos</h5>
          {incomeCategories.map(category => (
            <div key={category.id} className="category-item">
              <span 
                className="color-dot" 
                style={{ backgroundColor: category.color }}
              />
              <span className="category-name">{category.name}</span>
              <div className="category-actions">
                <button onClick={() => startEdit(category)} className="edit-btn">
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => onDeleteCategory(category.id)} 
                  className="delete-btn"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}