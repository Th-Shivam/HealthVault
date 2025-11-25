const Home = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to HealthVault</h1>
                <p className="text-gray-600">
                    Your secure personal health record system. Manage your medical history, appointments, and documents in one place.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder cards */}
                {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Feature {item}</h3>
                        <p className="text-gray-500 text-sm">
                            Description for feature {item}. This is a placeholder for future content.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
