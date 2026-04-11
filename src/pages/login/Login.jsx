import { useState } from 'react';
import { Card, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined } from '@ant-design/icons';

function Login () {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card
          variant="borderless"
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            borderRadius: '12px',
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <EyeOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Vision Expert</h1>
            <p className="text-gray-600">Eye Care Management System</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Username</label>
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onPressEnter={handleLogin}
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={handleLogin}
              />
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleLogin}
              style={{ height: '48px', marginTop: '24px' }}
            >
              Login
            </Button>
          </div>


          <div className="mt-6 text-center">
            <a 
              href="/track" 
              className="text-blue-600 text-sm hover:underline"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Track Your Order
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Powered by Vision Expert
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;