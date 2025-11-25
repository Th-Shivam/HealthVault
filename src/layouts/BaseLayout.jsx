import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const BaseLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-grow pt-16">
                <Outlet />
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
