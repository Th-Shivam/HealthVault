import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import BaseLayout from './layouts/BaseLayout';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import UploadRecord from './pages/UploadRecord';
import ShareRecord from './pages/ShareRecord';
import DoctorPortal from './pages/DoctorPortal';
import ViewRecord from './pages/ViewRecord';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload-record" element={<UploadRecord />} />
          <Route path="share-record" element={<ShareRecord />} />
          <Route path="doctor-portal" element={<DoctorPortal />} />
          <Route path="doctor/view" element={<ViewRecord />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
