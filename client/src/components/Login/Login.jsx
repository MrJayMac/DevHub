import React, {use, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [signUp, setSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const toggleView = () =>{
        if (signUp){
            setSignUp(false);
        }else{
            setSignUp(true)
        }

        setError('');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if(signUp){
            if(!email || !username || !password || !confirmPassword){
                return setError('All fields are required');
            }
            if (password !== confirmPassword){
                return setError('Passwords do not match');
            }

            try{
                const response = await axios.post('http://localhost:8000/register', {
                    username,
                    email,
                    password
                });

                if (response.status=== 201){
                    console.log('Registration Successful:', response.data);
                    setSignUp(false);
                } else{
                    setError(response.data.error || 'Something went wrong');
                }
            }catch(error){
                setError(error.response?.data?.error || error.message);
            }
        } else{
            if (!username || !password){
                return setError('Username and password are required.');
            }

            try{
                const response = await axios.post ('http://localhost:8000/login', {
                    username,
                    password
                });

                if(response.status === 200){
                    console.log('Login Successful:', response.data.token);
                    localStorage.setItem('token', response.data.token);
                    navigate('/dashboard')
                } else{
                    setError(response.data.error || 'Invalid Credentials');
                }
            } catch(error){
                setError(error.response?.data?.error || error.message);
            }
        }
    };


  return (
    <div>
        <form onSubmit={handleLogin}>
            {signUp && <input type='email' placeholder='Email'></input>}

            <input 
                type='username' 
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <input 
                type='password' 
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {signUp && 
            <input 
                type='password' 
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />}

            <button type="submit">{signUp ? 'Register' : 'Login'}</button>
        </form>

        <button onClick={toggleView}>
            {signUp ? "Already have an account?" : "Create an account"}
        </button>
    </div>
  )
}

export default Login