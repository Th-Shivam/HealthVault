import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Error logging out');
        } else {
            toast.success('Logged out successfully');
            navigate('/');
        }
        setIsOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600';
    };

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 bg-white/70 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 py-3">

                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="self-center text-2xl font-bold whitespace-nowrap text-gray-900 tracking-tight">
                        Health<span className="text-indigo-600">Vault</span>
                    </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    aria-controls="navbar-sticky"
                    aria-expanded={isOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>

                {/* Desktop Menu */}
                <div className="hidden w-full md:block md:w-auto" id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
                        <li>
                            <Link to="/" className={`block py-2 px-3 md:p-0 ${isActive('/')}`}>Home</Link>
                        </li>
                        <li>
                            <Link to="/dashboard" className={`block py-2 px-3 md:p-0 ${isActive('/dashboard')}`}>Dashboard</Link>
                        </li>
                        <li>
                            <Link to="/doctor-portal" className={`block py-2 px-3 md:p-0 ${isActive('/doctor-portal')}`}>Doctor Portal</Link>
                        </li>
                        {/* <li>
                            <Link to="/about" className={`block py-2 px-3 md:p-0 ${isActive('/about')}`}>About</Link>
                        </li> */}

                        {user ? (
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="block py-2 px-3 md:p-0 text-red-600 hover:text-red-800 font-medium"
                                >
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <li>
                                <Link to="/login" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 text-center">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Mobile Menu (Slide-out/Dropdown style) */}
                {isOpen && (
                    <div className="items-center justify-between w-full md:hidden" id="navbar-sticky-mobile">
                        <ul className="flex flex-col p-4 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 space-y-2">
                            <li>
                                <Link to="/" onClick={() => setIsOpen(false)} className={`block py-2 px-3 rounded hover:bg-gray-100 ${isActive('/')}`}>Home</Link>
                            </li>
                            <li>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`block py-2 px-3 rounded hover:bg-gray-100 ${isActive('/dashboard')}`}>Dashboard</Link>
                            </li>
                            <li>
                                <Link to="/doctor-portal" onClick={() => setIsOpen(false)} className={`block py-2 px-3 rounded hover:bg-gray-100 ${isActive('/doctor-portal')}`}>Doctor Portal</Link>
                            </li>
                            {/* <li>
                                <Link to="/about" onClick={() => setIsOpen(false)} className={`block py-2 px-3 rounded hover:bg-gray-100 ${isActive('/about')}`}>About</Link>
                            </li> */}

                            {user ? (
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left py-2 px-3 rounded text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </li>
                            ) : (
                                <li>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                                        Login
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
