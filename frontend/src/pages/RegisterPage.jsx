import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signUp(form);
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">New driver profile</p>
        <h1>Create account</h1>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            Name
            <input name="name" value={form.name} onChange={updateField} required minLength={2} />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={updateField} required minLength={8} />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={updateField}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            <UserPlus size={18} />
            {submitting ? "Creating" : "Create account"}
          </button>
        </form>
        <p className="auth-note">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
