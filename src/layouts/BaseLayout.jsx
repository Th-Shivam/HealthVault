import { Outlet, Link } from 'react-router-dom';

const BaseLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            HealthVault
                        </Link>
                    </div>
                    <nav className="flex space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </Link>
                        {/* Add more nav links here */}
                    </nav>
                </div>
            </header>

            <main className="flex-grow bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} HealthVault. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default BaseLayout;
