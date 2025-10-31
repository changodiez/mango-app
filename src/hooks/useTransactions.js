// useTransactions.js - Versión completa con funciones de categorías
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTransactions() {
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const lastUserIdRef = useRef(null)
    const isAddingTransactionRef = useRef(false)

    const [categories, setCategories] = useState([])
    const categoriesLoadedRef = useRef(false)

    const [dateFilter, setDateFilter] = useState({
        period: 'currentMonth',
        startDate: null,
        endDate: null
    })

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

    // 🔥 NUEVAS FUNCIONES PARA CATEGORÍAS
    const addCategory = async (categoryData) => {
        if (!user) throw new Error('No hay usuario autenticado')

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{
                    ...categoryData,
                    user_id: user.id
                }])
                .select()

            if (error) throw error

            setCategories(prev => [...prev, data[0]])
            return data[0]
        } catch (error) {
            console.error('Error adding category:', error)
            throw error
        }
    }

    const updateCategory = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', id)
                .select()

            if (error) throw error

            setCategories(prev => 
                prev.map(category => 
                    category.id === id ? data[0] : category
                )
            )

            return data[0]
        } catch (error) {
            console.error('Error updating category:', error)
            throw error
        }
    }

    const deleteCategory = async (id) => {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) throw error

            setCategories(prev => prev.filter(cat => cat.id !== id))
        } catch (error) {
            console.error('Error deleting category:', error)
            throw error
        }
    }

    const getDateRange = (period) => {
        const today = new Date()
        const start = new Date()
        const end = new Date()

        switch (period) {
            case 'today':
                start.setHours(0, 0, 0, 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'week':
                start.setDate(today.getDate() - today.getDay())
                start.setHours(0, 0, 0, 0)
                end.setDate(today.getDate() + (6 - today.getDay()))
                end.setHours(23, 59, 59, 999)
                break
            case 'currentMonth':
                start.setDate(1)
                start.setHours(0, 0, 0, 0)
                end.setMonth(today.getMonth() + 1, 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'lastMonth':
                start.setMonth(today.getMonth() - 1, 1)
                start.setHours(0, 0, 0, 0)
                end.setMonth(today.getMonth(), 0)
                end.setHours(23, 59, 59, 999)
                break
            case 'all':
                return { start: null, end: null }
            default:
                return { start: null, end: null }
        }

        return { 
            start: start.toISOString().split('T')[0], 
            end: end.toISOString().split('T')[0] 
        }
    }

    const filterTransactionsByDate = (transactionsList, period, customStart = null, customEnd = null) => {
        if (period === 'all') return transactionsList

        const { start, end } = period === 'custom' && customStart && customEnd 
            ? { start: customStart, end: customEnd }
            : getDateRange(period)

        return transactionsList.filter(transaction => {
            const transactionDate = transaction.date
            if (!start || !end) return true
            return transactionDate >= start && transactionDate <= end
        })
    }

    useEffect(() => {
        if (user && user.id !== lastUserIdRef.current && !isAddingTransactionRef.current) {
            lastUserIdRef.current = user.id
            categoriesLoadedRef.current = false
            fetchTransactions()
            fetchCategories()
        } else if (!user) {
            setTransactions([])
            setFilteredTransactions([])
            setCategories([])
            categoriesLoadedRef.current = false
            lastUserIdRef.current = null
        }
    }, [user])

    useEffect(() => {
        const filtered = filterTransactionsByDate(
            transactions, 
            dateFilter.period, 
            dateFilter.startDate, 
            dateFilter.endDate
        )
        setFilteredTransactions(filtered)
    }, [transactions, dateFilter])

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
                    amount: parseFloat(transaction.amount),
                    date: transaction.date
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

    const updateTransaction = async (id, updates) => {
        if (!user) throw new Error('No hay usuario autenticado')

        try {
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
        transactions: filteredTransactions,
        allTransactions: transactions,
        loading,
        categories,
        dateFilter,
        setDateFilter,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,        // 🔥 EXPORTAR
        updateCategory,     // 🔥 EXPORTAR
        deleteCategory,     // 🔥 EXPORTAR
        refetch: fetchTransactions
    }
}