import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'

export function TransactionManager({ isOpen, onClose }) {
    const [amount, setAmount] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('expense')
    const [date, setDate] = useState('') // 🔥 NUEVO: Campo de fecha
    const { addTransaction, loading, categories } = useTransactions()

    // 🔥 NUEVO: Establecer fecha actual por defecto
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setDate(today)
    }, [isOpen]) // Se ejecuta cuando se abre el modal

    // Filtrar categorías según el tipo seleccionado
    const filteredCategories = categories.filter(cat => cat.type === type)

    // Resetear categoría cuando cambie el tipo
    useEffect(() => {
        setCategory('')
    }, [type])

    // Resetear form cuando se cierra el modal
    useEffect(() => {
        if (!isOpen) {
            setAmount('')
            setDescription('')
            setCategory('')
            setType('expense')
            const today = new Date().toISOString().split('T')[0]
            setDate(today)
        }
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!amount || !category || !date) {
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
                date: date // 🔥 Usar la fecha seleccionada
            })

            window.dispatchEvent(new CustomEvent('transactionAdded'))
            
            onClose()
            
        } catch (error) {
            alert('Error al agregar transacción: ' + error.message)
        }
    }

    if (isOpen !== undefined && !isOpen) return null

    if (isOpen !== undefined) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Agregar Transacción</h3>
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    
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

                        {/* 🔥 NUEVO: Campo de fecha */}
                        <div className="form-group">
                            <label>Fecha:</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                            />
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

                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="cancel-btn" 
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={loading}
                            >
                                <Plus size={16} />
                                {loading ? 'Agregando...' : 'Agregar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    // Versión para sidebar (también actualizada con fecha)
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

                {/* 🔥 NUEVO: Campo de fecha en sidebar también */}
                <div className="form-group">
                    <label>Fecha:</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        max={new Date().toISOString().split('T')[0]}
                    />
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

                <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={loading}
                >
                    <Plus size={16} />
                    {loading ? 'Agregando...' : 'Agregar Transacción'}
                </button>
            </form>
        </div>
    )
}