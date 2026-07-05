import { useEffect, useState } from "react";
import { Card, Input, Button, Alert } from "antd";
import { EyeOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

import supabase from "../../client/supabase";
import { useAuth } from "../../const/functions";

export default function Login() {
  const navigate = useNavigate();
  const { homeRoute, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgType, setMsgType] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading && homeRoute !== "/") {
      navigate(homeRoute, { replace: true });
    }
  }, [isAuthenticated, isLoading, homeRoute, navigate]);

  const SEARCH_FROM_EMAIL = gql`
    query searchFromEmail($email: String!) {
      staffCollection(filter: { email: { eq: $email } }) {
        edges {
          node {
            id
            is_active
            auth_user_id
          }
        }
      }
    }
  `;
  const [loadFromEmail] = useLazyQuery(SEARCH_FROM_EMAIL);

  const handleLogin = async () => {
    setMsg("");
    setLoading(true);

    try {
      const email = username.trim();

      if (!email) {
        setMsgType("error");
        setMsg("Please enter your email address");
        return;
      }

      if (!password) {
        setMsgType("error");
        setMsg("Please enter your password");
        return;
      }

      const { data, error } = await loadFromEmail({
        variables: { email },
        fetchPolicy: "network-only",
      });

      if (error) {
        setMsgType("error");
        setMsg("Failed to validate email");
        return;
      }

      const staffNode = data?.staffCollection?.edges?.[0]?.node;

      if (!staffNode) {
        setMsgType("error");
        setMsg("Invalid email address");
        return;
      }

      if (staffNode.is_active === false) {
        setMsgType("error");
        setMsg("Account is disabled");
        return;
      }

      await login(email, staffNode);
    } catch {
      setMsgType("error");
      setMsg("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, staffNode) => {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMsgType("error");
      setMsg(error.message);
      return;
    }

    if (staffNode.auth_user_id && staffNode.auth_user_id !== session.user.id) {
      await supabase.auth.signOut();
      setMsgType("error");
      setMsg("This login is not linked to the staff account");
      return;
    }

    await supabase
      .schema("vision_expert")
      .from("login_activity")
      .insert({ auth_user_id: session.user.id, staff_id: staffNode.id });

    setMsgType("success");
    setMsg("Login successful! Redirecting...");
  };

  return (
    <div className="ve-login-root">
      <Card className="ve-login-card" variant="borderless">
        <div className="ve-login-logo-wrap">
          <div className="ve-login-logo-icon">
            <EyeOutlined style={{ fontSize: 28, color: "#ffffff" }} />
          </div>
          <h1 className="ve-login-title">Vision Expert</h1>
          <p className="ve-login-subtitle">Eye Care Management System</p>
        </div>

        {msg && <Alert message={msg} type={msgType} showIcon style={{ marginBottom: 20 }} />}

        <div style={{ marginBottom: 16 }}>
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ve-text-secondary)" }}>
            Password
          </label>
          <Input.Password
            size="large"
            prefix={<LockOutlined style={{ color: "var(--ve-text-muted)" }} />}
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
          loading={loading}
          onClick={handleLogin}
          style={{ height: 44, marginTop: 8, fontWeight: 600 }}
        >
          Login
        </Button>

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
