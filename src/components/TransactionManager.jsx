import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'

export function TransactionManager() {
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('expense')
    const { addTransaction, loading, categories } = useTransactions()

    // Filtrar categorías según el tipo seleccionado
    const filteredCategories = categories.filter(cat => cat.type === type)

    // Resetear categoría cuando cambie el tipo
    useEffect(() => {
        setCategory('')
    }, [type])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!amount || !category) {
            alert('Por favor completa todos los campos requeridos')
            return
        }

        const transactionAmount = type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount))
        
        try {
            await addTransaction({
                amount: transactionAmount,
                category,
                description,
                type,
                date: new Date().toISOString().split('T')[0]
            })

            window.dispatchEvent(new CustomEvent('transactionAdded'))
            
            // Reset form
            setAmount('')
            setDescription('')
            setCategory('')
            setType('expense')
            
        } catch (error) {
            alert('Error al agregar transacción: ' + error.message)
        }
    }

    return (
        <div className="transaction-form">
            <h3>Agregar Transacción</h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tipo:</label>
                    <div className="type-buttons">
                        <button 
                            type="button"
                            className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                            onClick={() => setType('income')}
                        >
                            Ingreso
                        </button>
                        <button 
                            type="button"
                            className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                            onClick={() => setType('expense')}
                        >
                            Gasto
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label>Monto:</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Categoría:</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar categoría</option>
                        {filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Descripción (opcional):</label>
                    <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción de la transacción"
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    <Plus size={16} />
                    {loading ? 'Agregando...' : 'Agregar Transacción'}
                </button>
            </form>
        </div>
    )
}