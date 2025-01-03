import React, { useState } from 'react';
import { Box, Button, TextField, Tabs, Tab, Typography } from '@mui/material';
import axios from 'axios';

interface AuthScreenProps {
    onLoginSuccess: (user_email:string) => void;
}

axios.defaults.baseURL = 'http://localhost:4000';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
    const [tab, setTab] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [error, setError] = useState('');

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTab(newValue);
        setError(''); // Clear error when switching tabs
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('/login', { email, password });
            localStorage.setItem('token', response.data.token);
            onLoginSuccess(response.data.user.email);
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed');
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post('/register', { email, name, surname, password });
            localStorage.setItem('token', response.data);
            console.log(response.data);
            onLoginSuccess('placeholder_email');
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
        }
    };
    return (
        <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', mt: 4 }}>
            <Tabs value={tab} onChange={handleTabChange} centered>
                <Tab label="Login" />
                <Tab label="Register" />
            </Tabs>
            {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
            {tab === 0 && (
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
                        Login
                    </Button>
                </Box>
            )}
            {tab === 1 && (
                <Box sx={{ mt: 2 }}>
                    <TextField
                        label="Email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        label="Surname"
                        fullWidth
                        margin="normal"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>
                        Register
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default AuthScreen;