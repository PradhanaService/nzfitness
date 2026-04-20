const fs = require('fs');
let code = fs.readFileSync('AdminPage.tsx', 'utf8');

const loginRegex = /\/\/ Login Component[\s\S]*?(?=\/\/ Offers Management Component)/;

const fixedLogin = `// Login Component
const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-gold/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">ADMIN LOGIN</h1>
          <p className="text-neutral-400">NOIZE Fitness Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-white font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-black font-black py-4 rounded-full hover:shadow-[0_0_30px_rgba(229,192,123,0.6)] transition-all disabled:opacity-50"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

`;

code = code.replace(loginRegex, fixedLogin);
fs.writeFileSync('AdminPage.tsx', code);
console.log("Fixed Login Component");
