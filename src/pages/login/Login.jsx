import { useState } from 'react';
import { Card, Input, Button, Alert } from 'antd';
import { LockOutlined, EyeOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import supabase from '../../client/supabase';
import { Content } from 'antd/es/layout/layout';
import { useAuth } from '../../const/functions';

function Login() {

  const { homeRoute, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [msgType, setMsgType] = useState('');
  const [msg, setMsg] = useState('');

  // If already authenticated, go straight home
  if (isAuthenticated) {
    navigate(homeRoute, { replace: true });
    return null;
  }

  const handleLogin = async () => {

    console.log("otp:", otp);
    setLoading(true);
    if (step === 1) {
      
      await sendOtp();
    } else {
      await login();
    }
    setLoading(false);
  };

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: username,
      options: { shouldCreateUser: false },
    });

    if (error) {
      setMsgType('error');
      setMsg(error.message);
    } else {
      setMsgType('info');
      setMsg('OTP sent to your email address');
      setStep(2);
    }
  };

  const login = async () => {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email: username,
      token: otp,
      type: 'email',
    });

      console.log("user", session.user)


    if (error) {
      setMsgType('error');
      setMsg(error.message);
      return;
    }

    // AuthProvider's onAuthStateChange will fetch the staff profile + role.
    // homeRoute will update automatically — navigate after a tick.
    setMsgType('success');
    setMsg('Login successful! Redirecting…');

    // Small delay so AuthProvider can resolve the role before we navigate
    setTimeout(() => navigate(homeRoute, { replace: true }), 800);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card
          variant="borderless"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)', borderRadius: '12px' }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <EyeOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Vision Expert</h1>
            <p className="text-gray-600">Eye Care Management System</p>
          </div>

          {msg && <Alert message={msg} type={msgType} showIcon className="mb-4" />}

          <div className="space-y-4 mt-4">
            <Content hidden={step === 2}>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Registered Email Address</label>
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="Enter registered email address"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onPressEnter={handleLogin}
                />
              </div>
            </Content>

            <Content hidden={step === 1}>
              <div>
                <label className="block text-sm mb-2 text-gray-700">OTP</label>
                <Input.OTP
                  size="large"
                  length={8}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  onPressEnter={handleLogin}
                />
              </div>
            </Content>

            <Button
              type="primary"
              size="large"
              block
              onClick={handleLogin}
              style={{ height: '48px', marginTop: '24px' }}
              loading={loading}
            >
              {step === 1 ? 'Send OTP' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <a href="/track" className="text-blue-600 text-sm hover:underline"
              onClick={(e) => { e.preventDefault(); navigate('/track'); }}>
              Track Your Order
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">Powered by Vision Expert</p>
        </Card>
      </div>
    </div>
  );
}

export default Login;