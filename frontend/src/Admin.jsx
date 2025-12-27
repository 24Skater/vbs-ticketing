import { useEffect, useMemo, useState } from "react";
import { authApi, ticketsApi, setAuthTokens, clearAuthTokens, isAuthenticated } from "./lib/api";
import "./App.css";

const TOKEN_STORAGE = "accessToken";

export default function Admin() {
	const [authenticated, setAuthenticated] = useState(isAuthenticated());
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");
	const [loginLoading, setLoginLoading] = useState(false);
	const [user, setUser] = useState(null);

	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [ticketType, setTicketType] = useState("Regular");
	const [paymentStatus, setPaymentStatus] = useState("Paid");

	const [activeTab, setActiveTab] = useState("manage");
	const [verifyCode, setVerifyCode] = useState("");
	const [verifying, setVerifying] = useState(false);
	const [verifyResult, setVerifyResult] = useState("");

	const [stats, setStats] = useState(null);

	const amount = useMemo(() => {
		if (ticketType === "VIP") return 50000; // 500 GHS in pesewas
		return 30000; // 300 GHS in pesewas
	}, [ticketType]);

	// Login handler
	async function handleLogin(e) {
		e.preventDefault();
		setLoginLoading(true);
		setLoginError("");
		
		try {
			const response = await authApi.login(email, password);
			setAuthTokens(response.data.accessToken, response.data.refreshToken);
			setUser(response.data.user);
			setAuthenticated(true);
			refresh();
		} catch (err) {
			setLoginError(err.message || "Login failed");
		} finally {
			setLoginLoading(false);
		}
	}

	// Logout handler
	function handleLogout() {
		clearAuthTokens();
		setAuthenticated(false);
		setUser(null);
		setTickets([]);
	}

	// Check auth on mount
	useEffect(() => {
		if (authenticated) {
			authApi.me().then(res => {
				setUser(res.data);
			}).catch(() => {
				handleLogout();
			});
		}
	}, []);

	// Refresh tickets
	async function refresh() {
		setLoading(true);
		setError("");
		try {
			const [ticketsRes, statsRes] = await Promise.all([
				ticketsApi.list({ limit: 100 }),
				ticketsApi.getStats()
			]);
			setTickets(ticketsRes.data || []);
			setStats(statsRes.data);
		} catch (err) {
			setError(err.message || "Failed to load tickets");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (authenticated) {
			refresh();
		}
	}, [authenticated]);

	// Create ticket
	async function createTicket(e) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await ticketsApi.create({
				name,
				phone,
				ticketType: ticketType.toUpperCase(),
				amount,
				status: paymentStatus === "Paid" ? "PAID" : "PENDING"
			});
			setName("");
			setPhone("");
			refresh();
		} catch (err) {
			setError(err.message || "Failed to create ticket");
		} finally {
			setLoading(false);
		}
	}

	// Verify ticket
	async function verifyTicket(code) {
		if (!code) return;
		setVerifying(true);
		setVerifyResult("");
		try {
			const res = await ticketsApi.verify(code.toUpperCase());
			setVerifyResult(`✅ ${res.message || "Ticket verified!"} - ${res.data?.name || ""}`);
			refresh();
		} catch (err) {
			if (err.message?.includes("already")) {
				setVerifyResult(`⚠️ ${err.message}`);
			} else {
				setVerifyResult(`❌ ${err.message || "Verification failed"}`);
			}
		} finally {
			setVerifying(false);
		}
	}

	// Delete ticket
	async function deleteTicket(ticketId) {
		if (!confirm("Are you sure you want to cancel this ticket?")) return;
		try {
			await ticketsApi.delete(ticketId);
			refresh();
		} catch (err) {
			setError(err.message || "Failed to cancel ticket");
		}
	}

	// Login Screen
	if (!authenticated) {
		return (
			<div className="admin-bg">
				<div className="admin-container" style={{ maxWidth: 400 }}>
					<h1 className="admin-title">Admin Panel</h1>
					<p className="admin-subtitle">Sign in to manage tickets</p>
					
					<form onSubmit={handleLogin} className="admin-form">
						{loginError && (
							<div className="admin-error">{loginError}</div>
						)}
						
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="admin-input"
							required
						/>
						
						<input
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="admin-input"
							required
						/>
						
						<button 
							type="submit" 
							className="admin-btn admin-btn-primary"
							disabled={loginLoading}
						>
							{loginLoading ? "Signing in..." : "Sign In"}
						</button>
					</form>
					
					<div style={{ marginTop: 20, fontSize: 12, color: "#888", textAlign: "center" }}>
						<p>Demo credentials:</p>
						<p>admin@vbs.local / Admin123!</p>
					</div>
				</div>
			</div>
		);
	}

	// Main Admin Panel
	return (
		<div className="admin-bg">
			<div className="admin-container">
				<div className="admin-header">
					<div>
						<h1 className="admin-title">VBS Admin Panel</h1>
						<p className="admin-subtitle">
							Logged in as {user?.name || user?.email} ({user?.role})
						</p>
					</div>
					<button onClick={handleLogout} className="admin-btn admin-btn-secondary">
						Logout
					</button>
				</div>

				{/* Stats */}
				{stats && (
					<div className="admin-stats">
						<div className="stat-card">
							<span className="stat-value">{stats.total}</span>
							<span className="stat-label">Total</span>
						</div>
						<div className="stat-card">
							<span className="stat-value">{stats.paid}</span>
							<span className="stat-label">Paid</span>
						</div>
						<div className="stat-card">
							<span className="stat-value">{stats.checkedIn}</span>
							<span className="stat-label">Checked In</span>
						</div>
						<div className="stat-card">
							<span className="stat-value">GHS {((stats.revenue || 0) / 100).toFixed(0)}</span>
							<span className="stat-label">Revenue</span>
						</div>
					</div>
				)}

				{/* Tabs */}
				<div className="admin-tabs">
					<button
						className={`admin-tab ${activeTab === "manage" ? "active" : ""}`}
						onClick={() => setActiveTab("manage")}
					>
						📋 Manage
					</button>
					<button
						className={`admin-tab ${activeTab === "verify" ? "active" : ""}`}
						onClick={() => setActiveTab("verify")}
					>
						✅ Verify
					</button>
					<button
						className={`admin-tab ${activeTab === "create" ? "active" : ""}`}
						onClick={() => setActiveTab("create")}
					>
						➕ Create
					</button>
				</div>

				{error && <div className="admin-error">{error}</div>}

				{/* Verify Tab */}
				{activeTab === "verify" && (
					<div className="admin-section">
						<h2>Verify Ticket</h2>
						<div className="verify-form">
							<input
								type="text"
								placeholder="Enter ticket ID (e.g. VBS-123456)"
								value={verifyCode}
								onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
								className="admin-input"
								style={{ textTransform: "uppercase" }}
							/>
							<button
								onClick={() => verifyTicket(verifyCode)}
								disabled={verifying || !verifyCode}
								className="admin-btn admin-btn-primary"
							>
								{verifying ? "Verifying..." : "Verify"}
							</button>
						</div>
						{verifyResult && (
							<div className={`verify-result ${verifyResult.startsWith("✅") ? "success" : verifyResult.startsWith("⚠️") ? "warning" : "error"}`}>
								{verifyResult}
							</div>
						)}
					</div>
				)}

				{/* Create Tab */}
				{activeTab === "create" && (
					<div className="admin-section">
						<h2>Create Ticket</h2>
						<form onSubmit={createTicket} className="create-form">
							<input
								type="text"
								placeholder="Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="admin-input"
								required
							/>
							<input
								type="tel"
								placeholder="Phone (e.g. 0241234567)"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								className="admin-input"
								required
							/>
							<select
								value={ticketType}
								onChange={(e) => setTicketType(e.target.value)}
								className="admin-input"
							>
								<option value="Regular">Regular - GHS 300</option>
								<option value="VIP">VIP - GHS 500</option>
							</select>
							<select
								value={paymentStatus}
								onChange={(e) => setPaymentStatus(e.target.value)}
								className="admin-input"
							>
								<option value="Paid">Paid</option>
								<option value="Pending">Pending Payment</option>
							</select>
							<button
								type="submit"
								disabled={loading}
								className="admin-btn admin-btn-primary"
							>
								{loading ? "Creating..." : "Create Ticket"}
							</button>
						</form>
					</div>
				)}

				{/* Manage Tab */}
				{activeTab === "manage" && (
					<div className="admin-section">
						<div className="section-header">
							<h2>Tickets ({tickets.length})</h2>
							<button onClick={refresh} disabled={loading} className="admin-btn admin-btn-secondary">
								{loading ? "Loading..." : "🔄 Refresh"}
							</button>
						</div>
						
						<div className="tickets-table-container">
							<table className="tickets-table">
								<thead>
									<tr>
										<th>Ticket ID</th>
										<th>Name</th>
										<th>Phone</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{tickets.map((ticket) => (
										<tr key={ticket.ticketId} className={ticket.status === "USED" ? "used" : ""}>
											<td>
												<code>{ticket.ticketId}</code>
												<br />
												<small style={{ color: "#888" }}>{ticket.accessCode}</small>
											</td>
											<td>{ticket.name}</td>
											<td>{ticket.phone}</td>
											<td>
												<span className={`status-badge status-${ticket.status?.toLowerCase()}`}>
													{ticket.status}
												</span>
											</td>
											<td>
												{ticket.status === "PAID" && (
													<button
														onClick={() => verifyTicket(ticket.ticketId)}
														className="admin-btn-small admin-btn-success"
													>
														Check In
													</button>
												)}
												{ticket.status !== "CANCELLED" && ticket.status !== "USED" && (
													<button
														onClick={() => deleteTicket(ticket.ticketId)}
														className="admin-btn-small admin-btn-danger"
													>
														Cancel
													</button>
												)}
											</td>
										</tr>
									))}
									{tickets.length === 0 && (
										<tr>
											<td colSpan="5" style={{ textAlign: "center", padding: 40 }}>
												No tickets found
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
