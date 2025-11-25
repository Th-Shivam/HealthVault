import { useNavigate } from 'react-router-dom';

const MOCK_RECORD = {
    id: 1,
    title: 'Annual Physical Report 2024',
    description: 'Comprehensive blood work and physical examination results from Dr. Smith.',
    date: '2024-03-15',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Sample PDF
};

const ViewRecord = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{MOCK_RECORD.title}</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Uploaded on {MOCK_RECORD.date}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Description */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Description
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {MOCK_RECORD.description}
                    </p>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-white shadow sm:rounded-lg overflow-hidden h-[800px]">
                <iframe
                    src={MOCK_RECORD.fileUrl}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                />
            </div>
        </div>
    );
};

export default ViewRecord;
