import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import { styles } from "../styles/LoginPage.styles";

export default function LoginPage({ setPage }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            // Login successful, redirect to admin
            setPage("Admin");
        }
    };

    return (
        <div style={styles.pageContainer}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                style={styles.loginCard}
            >
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Sign in to access the administration panel.</p>

                {errorMsg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorText}>
                        {errorMsg}
                    </motion.div>
                )}

                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Mail style={{ position: "absolute", left: 16, color: "#8aabcc" }} size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                style={{ ...styles.input, paddingLeft: 44, width: "100%", boxSizing: "border-box" }}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <Lock style={{ position: "absolute", left: 16, color: "#8aabcc" }} size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ ...styles.input, paddingLeft: 44, width: "100%", boxSizing: "border-box" }}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                        {loading ? "Signing In..." : "Log In"}
                    </motion.button>
                </form>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                    <button
                        onClick={() => setPage("Home")}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "#5a7a9a",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "13px",
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        Return to Homepage
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
