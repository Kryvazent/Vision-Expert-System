import { useEffect, useState } from "react";
import { Card, Input, Button, Alert } from "antd";
import { EyeOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

import supabase from "../../client/supabase";
import { useAuth } from "../../const/functions";

export default function Login() {
  const navigate  = useNavigate();
  const { homeRoute, isAuthenticated, isLoading } = useAuth();

  const [staffId,  setStaffId]  = useState(null);
  const [username, setUsername] = useState("");
  const [otp,      setOtp]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [step,     setStep]     = useState(1);
  const [msgType,  setMsgType]  = useState("");
  const [msg,      setMsg]      = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading && homeRoute !== "/") {
      navigate(homeRoute, { replace: true });
    }
  }, [isAuthenticated, isLoading, homeRoute, navigate]);

  const SEARCH_FROM_EMAIL = gql`
    query searchFromEmail($email: String!) {
      staffCollection(filter: { email: { eq: $email } }) {
        edges { node { id is_active } }
      }
    }
  `;
  const [loadFromEmail] = useLazyQuery(SEARCH_FROM_EMAIL);

  const handleLogin = async () => {
    setMsg("");
    setLoading(true);
    try {
      if (step === 1) {
        if (!username) { setMsgType("error"); setMsg("Please enter your email address"); setLoading(false); return; }
        const { data, error } = await loadFromEmail({ variables: { email: username }, fetchPolicy: "network-only" });
        if (error) { setMsgType("error"); setMsg("Failed to validate email"); setLoading(false); return; }
        const staffNode = data?.staffCollection?.edges?.[0]?.node;
        if (!staffNode)                   { setMsgType("error"); setMsg("Invalid email address"); setLoading(false); return; }
        if (staffNode.is_active === false) { setMsgType("error"); setMsg("Account is disabled");  setLoading(false); return; }
        setStaffId(staffNode.id);
        await sendOtp();
      } else {
        await login();
      }
    } catch {
      setMsgType("error"); setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: username, options: { shouldCreateUser: false } });
    if (error) { setMsgType("error"); setMsg(error.message); return; }
    setMsgType("info"); setMsg("OTP sent to your email address"); setStep(2);
  };

  const login = async () => {
    if (!otp || otp.length !== 8) { setMsgType("error"); setMsg("Please enter the 8-digit OTP"); return; }
    const { data: { session }, error } = await supabase.auth.verifyOtp({ email: username, token: otp, type: "email" });
    if (error) { setMsgType("error"); setMsg(error.message); return; }

    await supabase.schema("vision_expert").from("login_activity").insert({ auth_user_id: session.user.id, staff_id: staffId });

    setMsgType("success"); setMsg("Login successful! Redirecting...");
  };

  return (
    <div className="ve-login-root">
      <Card className="ve-login-card" variant="borderless">
        {/* ── Logo ── */}
        <div className="ve-login-logo-wrap">
          <div className="ve-login-logo-icon">
            <EyeOutlined style={{ fontSize: 28, color: "#ffffff" }} />
          </div>
          <h1 className="ve-login-title">Vision Expert</h1>
          <p className="ve-login-subtitle">Eye Care Management System</p>
        </div>

        {/* ── Alert ── */}
        {msg && <Alert message={msg} type={msgType} showIcon style={{ marginBottom: 20 }} />}

        {/* ── Email step ── */}
        <div style={{ display: step === 2 ? "none" : "block", marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ve-text-secondary)" }}>
            Registered Email Address
          </label>
          <Input
            size="large"
            prefix={<MailOutlined style={{ color: "var(--ve-text-muted)" }} />}
            placeholder="Enter registered email address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onPressEnter={handleLogin}
          />
        </div>

        {/* ── OTP step ── */}
        <div style={{ display: step === 1 ? "none" : "block", marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ve-text-secondary)" }}>
            One-Time Password
          </label>
          <Input.OTP
            size="large"
            length={8}
            value={otp}
            onChange={(value) => setOtp(value)}
            onPressEnter={handleLogin}
          />
        </div>

        {/* ── Submit ── */}
        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          onClick={handleLogin}
          style={{ height: 44, marginTop: 8, fontWeight: 600 }}
        >
          {step === 1 ? "Send OTP" : "Login"}
        </Button>

        {/* ── Track order link ── */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link
            to="/track"
            style={{ color: "var(--ve-primary)", fontSize: 13 }}
          >
            Track Your Order
          </Link>
        </div>

        <p style={{ fontSize: 12, color: "var(--ve-text-muted)", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          Powered by Vision Expert
        </p>
      </Card>
    </div>
  );
}
