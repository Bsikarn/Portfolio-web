export const styles = {
    pageContainer: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "20px"
    },
    loginCard: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)",
        borderRadius: "16px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 12px 40px rgba(13, 110, 253, 0.15), 0 4px 12px rgba(13, 110, 253, 0.05)",
        border: "1px solid rgba(163, 216, 244, 0.3)",
        position: "relative",
        zIndex: 1
    },
    title: {
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 800,
        fontSize: "28px",
        color: "#0d1b2a",
        textAlign: "center",
        margin: "0 0 8px 0"
    },
    subtitle: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "14px",
        color: "#5a7a9a",
        textAlign: "center",
        margin: "0 0 32px 0"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    label: {
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        fontSize: "13px",
        color: "#4a6a8a"
    },
    input: {
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #eef3ff",
        background: "#f8fbff",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "14px",
        color: "#0d1b2a",
        outline: "none",
        transition: "border 0.2s, box-shadow 0.2s",
    },
    button: {
        padding: "14px",
        marginTop: "12px",
        borderRadius: "12px",
        border: "none",
        background: "#0D6EFD",
        color: "white",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: "15px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 8px 24px rgba(13, 110, 253, 0.3)",
        transition: "transform 0.2s, box-shadow 0.2s"
    },
    errorText: {
        color: "#ef4444",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "13px",
        textAlign: "center",
        marginTop: "8px",
        padding: "8px",
        background: "#fef2f2",
        borderRadius: "8px",
        border: "1px solid #fca5a5"
    }
};
