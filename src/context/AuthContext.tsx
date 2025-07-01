import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { User, CreditRequest, CreditRequestStatus, UserRole } from '../types';

export type AddUserResult = { success: true, user: User } | { success: false; error: 'USERNAME_TAKEN' | 'EMAIL_TAKEN' };

interface AuthContextType {
    users: User[];
    currentUser: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    register: (user: Pick<User, 'username' | 'password' | 'name' | 'role' | 'email' | 'avatar'>) => AddUserResult;
    updateBalance: (userId: string, amount: number, operation: 'add' | 'subtract') => void;
    creditRequests: CreditRequest[];
    addRequest: (request: Omit<CreditRequest, 'id' | 'createdAt'>) => void;
    updateRequest: (requestId: string, status: CreditRequestStatus) => void;
    isUsernameTaken: (username: string) => boolean;
    isEmailTaken: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
    users: User[];
    onUpdateBalance: (userId: string, amount: number, operation: 'add' | 'subtract') => void;
    creditRequests: CreditRequest[];
    onAddRequest: (request: Omit<CreditRequest, 'id' | 'createdAt'>) => void;
    onUpdateRequest: (requestId: string, status: CreditRequestStatus) => void;
    onAddUser: (user: Pick<User, 'username' | 'password' | 'name' | 'role' | 'email' | 'avatar'>) => AddUserResult;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
    children, 
    users, 
    onUpdateBalance, 
    creditRequests, 
    onAddRequest, 
    onUpdateRequest,
    onAddUser
}) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const login = useCallback((username: string, password: string): boolean => {
        const userFound = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (userFound) {
            setCurrentUserId(userFound.id);
            return true;
        }
        return false;
    }, [users]);

    const register = useCallback((newUser: Pick<User, 'username' | 'password' | 'name' | 'role' | 'email' | 'avatar'>): AddUserResult => {
        const result = onAddUser(newUser);
        if (result.success) {
            // Log in the new user immediately after successful registration
            setCurrentUserId(result.user.id);
        }
        return result;
    }, [onAddUser]);

    const logout = useCallback(() => {
        setCurrentUserId(null);
    }, []);

    const isUsernameTaken = useCallback((username: string): boolean => {
        return users.some(u => u.username.toLowerCase() === username.toLowerCase());
    }, [users]);

    const isEmailTaken = useCallback((email: string): boolean => {
        if (!email) return false;
        return users.some(u => u.email?.toLowerCase() === email.toLowerCase());
    }, [users]);

    const currentUser = useMemo(() => {
        return users.find(u => u.id === currentUserId) || null;
    }, [currentUserId, users]);

    const value = useMemo(() => ({
        users,
        currentUser,
        login,
        logout,
        register,
        updateBalance: onUpdateBalance,
        creditRequests,
        addRequest: onAddRequest,
        updateRequest: onUpdateRequest,
        isUsernameTaken,
        isEmailTaken,
    }), [users, currentUser, login, logout, register, onUpdateBalance, creditRequests, onAddRequest, onUpdateRequest, isUsernameTaken, isEmailTaken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};