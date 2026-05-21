
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const LogoutButton = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout request failed', err);
        } finally {
            logout();
            navigate('/login');
        }
    };

    return (
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: 'auto', padding: '0.5rem 1.25rem' }}>
            Logout
        </button>
    );
};

export default LogoutButton;
