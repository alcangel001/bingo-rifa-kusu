import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MailIcon, LockClosedIcon, EyeIcon, EyeOffIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon } from './Icon';

// Custom hook for debouncing input
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const LoginScreen: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="w-full max-w-md">
                <h1 className="text-5xl font-extrabold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                    Bingo Kusu
                </h1>
                <p className="text-slate-400 mb-8 text-center">Bienvenido al juego de bingo en línea</p>

                <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-2 mb-6 flex">
                    <button
                        onClick={() => setIsLoginView(true)}
                        className={`w-1/2 p-3 rounded-lg font-bold transition-colors ${isLoginView ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setIsLoginView(false)}
                        className={`w-1/2 p-3 rounded-lg font-bold transition-colors ${!isLoginView ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        Registrarse
                    </button>
                </div>

                {isLoginView ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    );
};

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (!success) {
            setError('Nombre de usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm text-center">{error}</p>}
                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Nombre de Usuario</label>
                    <div className="relative">
                         <UserCircleIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                         <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Contraseña</label>
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white">
                            {passwordVisible ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all">
                    Entrar
                </button>
            </form>
        </div>
    );
};

const getPasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return { score: 0 };
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return { score };
}

const PasswordStrengthMeter = ({ password }: { password: string}) => {
    const { score } = getPasswordStrength(password);
    const width = `${(score / 4) * 100}%`;
    const color = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"][score - 1] || "bg-slate-700";
    
    return (
        <div className="h-2 w-full bg-slate-700 rounded-full mt-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width: width }}></div>
        </div>
    );
};

const AVATAR_OPTIONS = [
    'https://xsgames.co/randomusers/assets/avatars/pixel/4.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/7.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/10.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/15.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/22.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/26.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/35.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/40.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/48.jpg',
    'https://xsgames.co/randomusers/assets/avatars/pixel/50.jpg',
];

const RegisterForm: React.FC = () => {
    const { register, isUsernameTaken, isEmailTaken } = useAuth();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.USER);
    const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

    const debouncedUsername = useDebounce(username, 500);
    const debouncedEmail = useDebounce(email, 500);

    const isFormValid =
        name.trim() !== '' &&
        usernameStatus === 'valid' &&
        emailStatus === 'valid' &&
        password.length > 0 &&
        password === confirmPassword &&
        getPasswordStrength(password).score >= 2 &&
        avatar !== '';

    useEffect(() => {
        if (!debouncedUsername) {
            setUsernameStatus('idle');
            return;
        }
        if (debouncedUsername.length < 3) {
            setUsernameStatus('invalid');
            return;
        }
        setUsernameStatus('checking');
        setTimeout(() => {
            setUsernameStatus(isUsernameTaken(debouncedUsername) ? 'invalid' : 'valid');
        }, 300);
    }, [debouncedUsername, isUsernameTaken]);

    useEffect(() => {
        if (!debouncedEmail) {
            setEmailStatus('idle');
            return;
        }
        const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);
        if (!emailFormatValid) {
            setEmailStatus('invalid');
            return;
        }
        setEmailStatus('checking');
        setTimeout(() => {
            setEmailStatus(isEmailTaken(debouncedEmail) ? 'invalid' : 'valid');
        }, 300);
    }, [debouncedEmail, isEmailTaken]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!isFormValid) {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
            } else if (getPasswordStrength(password).score < 2) {
                setError('La contraseña es demasiado débil. Asegúrate de cumplir los requisitos.');
            } else {
                 setError('Por favor, completa el formulario y corrige los errores.');
            }
            return;
        }

        const result = register({ name, username, password, email, role, avatar });

        // Check for the failure case first to allow TypeScript to correctly narrow the type.
        if (result.success === false) {
            // Failure: Set an appropriate error message.
            if (result.error === 'USERNAME_TAKEN') {
                setError('Este nombre de usuario ya está en uso. Por favor, elige otro.');
                setUsernameStatus('invalid'); 
            } else { // The only other error is 'EMAIL_TAKEN' based on the type definition.
                setError('Este correo electrónico ya está registrado. Por favor, usa otro.');
                setEmailStatus('invalid');
            }
        }
        // On success, the user is logged in automatically, and the component will unmount.
        // No further action is needed here.
    };
    
    const getBorderColor = (status: 'idle' | 'checking' | 'valid' | 'invalid') => {
        switch (status) {
            case 'valid': return 'border-green-500 focus:ring-green-500';
            case 'invalid': return 'border-red-500 focus:ring-red-500';
            default: return 'border-slate-700 focus:ring-purple-500';
        }
    };
    
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return (
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-sm text-center">{error}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Tu Nombre</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                    </div>
                     <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2">Usuario</label>
                        <div className="relative">
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                                className={`w-full bg-slate-900 border rounded-lg p-3 text-white focus:outline-none focus:ring-2 transition-colors ${getBorderColor(usernameStatus)}`} required />
                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                {usernameStatus === 'checking' && <span className="h-4 w-4 block rounded-full border-2 border-slate-500 border-t-white animate-spin"></span>}
                                {usernameStatus === 'valid' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                                {usernameStatus === 'invalid' && username.length > 0 && <XCircleIcon className="w-5 h-5 text-red-500" />}
                            </div>
                        </div>
                        {usernameStatus === 'invalid' && username.length > 0 && <p className="text-red-400 text-xs mt-1 px-1">{username.length < 3 ? 'Debe tener al menos 3 caracteres.' : 'Este usuario ya está en uso.'}</p>}
                        {usernameStatus === 'valid' && <p className="text-green-400 text-xs mt-1 px-1">¡Nombre de usuario disponible!</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Correo Electrónico</label>
                    <div className="relative">
                        <MailIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className={`w-full bg-slate-900 border rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 transition-colors ${getBorderColor(emailStatus)}`} required />
                        <div className="absolute top-1/2 right-3 -translate-y-1/2">
                            {emailStatus === 'checking' && <span className="h-4 w-4 block rounded-full border-2 border-slate-500 border-t-white animate-spin"></span>}
                            {emailStatus === 'valid' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                            {emailStatus === 'invalid' && email.length > 0 && <XCircleIcon className="w-5 h-5 text-red-500" />}
                        </div>
                    </div>
                     {emailStatus === 'invalid' && email.length > 0 && <p className="text-red-400 text-xs mt-1 px-1">{!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Formato de correo no válido.' : 'Este correo ya está registrado.'}</p>}
                     {emailStatus === 'valid' && <p className="text-green-400 text-xs mt-1 px-1">Correo electrónico válido.</p>}
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Elige tu Avatar</label>
                    <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg">
                        <img src={avatar} alt="Avatar seleccionado" className="w-16 h-16 rounded-full border-4 border-purple-500" />
                        <div className="flex flex-wrap gap-2 flex-1">
                            {AVATAR_OPTIONS.map(opt => (
                                <button type="button" key={opt} onClick={() => setAvatar(opt)}>
                                    <img src={opt} alt="Opción de avatar" className={`w-10 h-10 rounded-full cursor-pointer transition-all ${avatar === opt ? 'ring-2 ring-cyan-400 scale-110' : 'opacity-60 hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Contraseña</label>
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type={passwordVisible ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white">
                            {passwordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    <PasswordStrengthMeter password={password} />
                     <div className="grid grid-cols-2 gap-x-4 text-xs text-slate-400 mt-2 px-1">
                        <span className={hasMinLength ? 'text-green-400' : ''}>✓ 8+ caracteres</span>
                        <span className={hasUpperCase ? 'text-green-400' : ''}>✓ 1 Mayúscula</span>
                        <span className={hasLowerCase ? 'text-green-400' : ''}>✓ 1 Minúscula</span>
                        <span className={hasNumber ? 'text-green-400' : ''}>✓ 1 Número</span>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-bold mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type={confirmPasswordVisible ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className={`w-full bg-slate-900 border rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-2 transition-colors ${password && confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-slate-700 focus:ring-purple-500'}`} required />
                        <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white">
                            {confirmPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>
                     {password && confirmPassword && password !== confirmPassword && <p className="text-red-400 text-xs mt-1 px-1">Las contraseñas no coinciden.</p>}
                </div>

                <div>
                     <label className="block text-slate-300 text-sm font-bold mb-2">Quiero ser un</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value={UserRole.USER}>Jugador</option>
                        <option value={UserRole.ORGANIZER}>Organizador</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition-all mt-6 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-purple-500/30"
                >
                    Crear Cuenta
                </button>
            </form>
        </div>
    );
};

export default LoginScreen;