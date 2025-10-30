import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTransactions() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const lastUserIdRef = useRef(null)
    const isAddingTransactionRef = useRef(false)

    const [categories, setCategories] = useState([])
    const categoriesLoadedRef = useRef(false)

    const fetchCategories = async () => {
        if (!user || categoriesLoadedRef.current) return

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('name')

            if (error) throw error

            if (!data || data.length === 0) {
                await createDefaultCategories()
            } else {
                setCategories(data || [])
                categoriesLoadedRef.current = true
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const createDefaultCategories = async () => {
        if (categoriesLoadedRef.current) return

        const defaultCategories = [
            { name: 'Comida', type: 'expense', color: '#FF6B6B' },
            { name: 'Transporte', type: 'expense', color: '#4ECDC4' },
            { name: 'Entretenimiento', type: 'expense', color: '#45B7D1' },
            { name: 'Salud', type: 'expense', color: '#96CEB4' },
            { name: 'Educación', type: 'expense', color: '#FFEAA7' },
            { name: 'Servicios', type: 'expense', color: '#DDA0DD' },
            { name: 'Salario', type: 'income', color: '#48BB78' },
            { name: 'Freelance', type: 'income', color: '#38A169' },
            { name: 'Inversiones', type: 'income', color: '#2F855A' },
            { name: 'Regalos', type: 'income', color: '#68D391' },
        ]

        try {
            const { error } = await supabase
                .from('categories')
                .insert(defaultCategories.map(cat => ({ ...cat, user_id: user.id })))

            if (error && !error.message.includes('duplicate key')) {
                throw error
            }
            
            // Recargar categorías después de crearlas
            const { data: refreshedData } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
            
            setCategories(refreshedData || [])
            categoriesLoadedRef.current = true
            
        } catch (error) {
            console.error('Error creating default categories:', error)
        }
    }

    useEffect(() => {
        if (user && user.id !== lastUserIdRef.current && !isAddingTransactionRef.current) {
            lastUserIdRef.current = user.id
            categoriesLoadedRef.current = false
            fetchTransactions()
            fetchCategories()
        } else if (!user) {
            setTransactions([])
            setCategories([])
            categoriesLoadedRef.current = false
            lastUserIdRef.current = null
        }
    }, [user])

    const fetchTransactions = async () => {
        if (!user) return

        setLoading(true)

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })

            if (error) throw error

            setTransactions(data || [])
        } catch (error) {
            console.error('Error fetching transactions:', error)
        } finally {
            setLoading(false)
        }
    }

    const addTransaction = async (transaction) => {
        if (!user) throw new Error('No hay usuario autenticado')

        isAddingTransactionRef.current = true

        try {
            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    ...transaction,
                    user_id: user.id,
                    amount: parseFloat(transaction.amount)
                }])
                .select()

            if (error) throw error

            setTransactions(prev => {
                const exists = prev.find(t => t.id === data[0].id)
                if (exists) return prev
                return [data[0], ...prev]
            })

            return data[0]
        } catch (error) {
            console.error('Error adding transaction:', error)
            throw error
        } finally {
            setTimeout(() => {
                isAddingTransactionRef.current = false
            }, 1000)
        }
    }

    // 🔥 NUEVA FUNCIÓN: Actualizar transacción
    const updateTransaction = async (id, updates) => {
        if (!user) throw new Error('No hay usuario autenticado')

        try {
            // Calcular el monto correcto según el tipo
            let amount = parseFloat(updates.amount)
            if (updates.type === 'expense') {
                amount = -Math.abs(amount)
            } else if (updates.type === 'income') {
                amount = Math.abs(amount)
            }

            const { data, error } = await supabase
                .from('transactions')
                .update({
                    ...updates,
                    amount: amount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()

            if (error) throw error

            // Actualizar el estado local
            setTransactions(prev => 
                prev.map(transaction => 
                    transaction.id === id ? data[0] : transaction
                )
            )

            return data[0]
        } catch (error) {
            console.error('Error updating transaction:', error)
            throw error
        }
    }

    const deleteTransaction = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)

        if (error) throw error

        setTransactions(prev => prev.filter(t => t.id !== id))
    }

    return {
        transactions,
        loading,
        categories,
        addTransaction,
        updateTransaction, // 🔥 EXPORTAR la nueva función
        deleteTransaction,
        refetch: fetchTransactions
    }
}