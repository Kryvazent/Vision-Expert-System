import { useState } from "react";
import { Alert, Button, Card, Input, Progress } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

import supabase from "../client/supabase";
import { useAuth } from "../const/functions";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { staff, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgType, setMsgType] = useState("");
  const [msg, setMsg] = useState("");

  const passwordRules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];
  const passedRuleCount = passwordRules.filter((rule) => rule.valid).length;
  const passwordProgress = Math.round((passedRuleCount / passwordRules.length) * 100);
  const isPasswordValid = passedRuleCount === passwordRules.length;
  const passwordStatus = passwordProgress < 50 ? "exception" : passwordProgress < 100 ? "normal" : "success";
  const confirmPasswordValid = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async () => {
    setMsg("");

    if (!isPasswordValid) {
      setMsgType("error");
      setMsg("Please meet all password rules.");
      return;
    }

    if (password !== confirmPassword) {
      setMsgType("error");
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: passwordError } = await supabase.auth.updateUser({ password });

      if (passwordError) {
        setMsgType("error");
        setMsg(passwordError.message);
        return;
      }

      if (staff?.id) {
        const { error: staffError } = await supabase
          .schema("vision_expert")
          .from("staff")
          .update({ must_change_password: false })
          .eq("id", staff.id);

        if (staffError) {
          setMsgType("error");
          setMsg(staffError.message);
          return;
        }
      }

      await signOut();
      navigate("/", { replace: true });
    } catch {
      setMsgType("error");
      setMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ve-login-root">
      <Card className="ve-login-card" variant="borderless">
        <div className="ve-login-logo-wrap">
          <div className="ve-login-logo-icon">
            <EyeOutlined style={{ fontSize: 28, color: "#ffffff" }} />
          </div>
          <h1 className="ve-login-title">Change Password</h1>
          <p className="ve-login-subtitle">Set a private password for your account</p>
        </div>

        {msg && <Alert message={msg} type={msgType} showIcon style={{ marginBottom: 20 }} />}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ve-text-secondary)" }}>
            New Password
          </label>
          <Input.Password
            size="large"
            prefix={<LockOutlined style={{ color: "var(--ve-text-muted)" }} />}
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleSubmit}
          />
          <div style={{ marginTop: 10 }}>
            <Progress
              percent={passwordProgress}
              size="small"
              status={passwordStatus}
              showInfo={false}
            />
            <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
              {passwordRules.map((rule) => (
                <div
                  key={rule.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: rule.valid ? "var(--ve-success)" : "var(--ve-text-muted)",
                    fontSize: 12,
                  }}
                >
                  {rule.valid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--ve-text-secondary)" }}>
            Confirm Password
          </label>
          <Input.Password
            size="large"
            prefix={<LockOutlined style={{ color: "var(--ve-text-muted)" }} />}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPressEnter={handleSubmit}
            status={confirmPassword.length > 0 && !confirmPasswordValid ? "error" : ""}
          />
          {confirmPassword.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                color: confirmPasswordValid ? "var(--ve-success)" : "var(--ve-error)",
                fontSize: 12,
              }}
            >
              {confirmPasswordValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              <span>{confirmPasswordValid ? "Passwords match" : "Passwords do not match"}</span>
            </div>
          )}
        </div>

        <Button
          type="primary"
          size="large"
          block
          loading={loading}
          disabled={!isPasswordValid || !confirmPasswordValid}
          onClick={handleSubmit}
          style={{ height: 44, marginTop: 8, fontWeight: 600 }}
        >
          Update Password
        </Button>

        <Button
          type="link"
          block
          onClick={signOut}
          style={{ marginTop: 10 }}
        >
          Sign out
        </Button>
      </Card>
    </div>
  );
}
