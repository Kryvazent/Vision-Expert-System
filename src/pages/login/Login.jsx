import { useEffect, useState } from 'react';
import { Card, Input, Button, Alert } from 'antd';
import {
  EyeOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { Content } from 'antd/es/layout/layout';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';

import supabase from '../../client/supabase';
import { useAuth } from '../../const/functions';

function Login() {

  const navigate = useNavigate();
  const { homeRoute, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [msgType, setMsgType] = useState('');
  const [msg, setMsg] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(homeRoute, { replace: true });
    }
  }, [isAuthenticated, homeRoute, navigate]);

  // GraphQL query
  const SEARCH_FROM_EMAIL = gql`
    query searchFromEmail($email: String!) {
      staffCollection(filter: { email: { eq: $email } }) {
        edges {
          node {
            id
            is_active
          }
        }
      }
    }
  `;

  const [loadFromEmail] = useLazyQuery(SEARCH_FROM_EMAIL);

  const handleLogin = async () => {

    setMsg('');
    setLoading(true);

    try {

      // STEP 1 → Check email + send OTP
      if (step === 1) {

        if (!username) {
          setMsgType('error');
          setMsg('Please enter your email address');
          setLoading(false);
          return;
        }

        const { data, error } = await loadFromEmail({
          variables: {
            email: username,
          },
          fetchPolicy: 'network-only',
        });

        console.log('data:', data);
        console.log('error:', error);

        if (error) {
          setMsgType('error');
          setMsg('Failed to validate email');
          setLoading(false);
          return;
        }

        const staff = data?.staffCollection?.edges?.[0]?.node;

        // Email not found
        if (!staff) {
          setMsgType('error');
          setMsg('Invalid email address');
          setLoading(false);
          return;
        }

        // Account disabled
        if (staff?.is_active === false) {
          setMsgType('error');
          setMsg('Account is disabled');
          setLoading(false);
          return;
        }

        // Send OTP
        await sendOtp();

      } else {

        // STEP 2 → Verify OTP
        await login();

      }

    } catch (err) {

      console.error(err);

      setMsgType('error');
      setMsg('Something went wrong');

    } finally {

      setLoading(false);

    }

  };

  // Send OTP
  const sendOtp = async () => {

    const { error } = await supabase.auth.signInWithOtp({
      email: username,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {

      console.error(error);

      setMsgType('error');
      setMsg(error.message);

      return;
    }

    setMsgType('info');
    setMsg('OTP sent to your email address');
    setStep(2);

  };

  // Verify OTP
  const login = async () => {

    if (!otp || otp.length !== 8) {

      setMsgType('error');
      setMsg('Please enter the 8-digit OTP');

      return;
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email: username,
      token: otp,
      type: 'email',
    });

    console.log('session:', session);

    if (error) {

      console.error(error);

      setMsgType('error');
      setMsg(error.message);

      return;
    }

    setMsgType('success');
    setMsg('Login successful! Redirecting...');

    // Wait a little so AuthProvider updates properly
    setTimeout(() => {
      navigate(homeRoute, { replace: true });
    }, 800);

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

          {/* Logo */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <EyeOutlined
                style={{
                  fontSize: 32,
                  color: 'white',
                }}
              />
            </div>

            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              Vision Expert
            </h1>

            <p className="text-gray-600">
              Eye Care Management System
            </p>

          </div>

          {/* Alert */}
          {msg && (
            <Alert
              message={msg}
              type={msgType}
              showIcon
              className="mb-4"
            />
          )}

          <div className="space-y-4 mt-4">

            {/* Email Step */}
            <Content hidden={step === 2}>

              <div>

                <label className="block text-sm mb-2 text-gray-700">
                  Registered Email Address
                </label>

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

            {/* OTP Step */}
            <Content hidden={step === 1}>

              <div>

                <label className="block text-sm mb-2 text-gray-700">
                  OTP
                </label>

                <Input.OTP
                  size="large"
                  length={8}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  onPressEnter={handleLogin}
                />

              </div>

            </Content>

            {/* Button */}
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleLogin}
              style={{
                height: '48px',
                marginTop: '24px',
              }}
            >
              {step === 1 ? 'Send OTP' : 'Login'}
            </Button>

          </div>

          {/* Track Order */}
          <div className="mt-6 text-center">

            <a
              href="/track"
              className="text-blue-600 text-sm hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/track');
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
}

export default Login;