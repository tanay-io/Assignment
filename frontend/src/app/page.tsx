import Link from "next/link";

const features = [
  {
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 11c0-1.657 2-3 4-3s4 1.343 4 3-2 3-4 3-4-1.343-4-3zm0 0V7a4 4 0 10-8 0v4c0 2.21 1.79 4 4 4s4-1.79 4-4z"
        />
      </svg>
    ),
    title: "Secure Auth",
    desc: "JWT & HttpOnly cookies keep your data safe. Modern authentication best practices included.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0zm6 4v2a2 2 0 01-2 2h-1.5M3 16v2a2 2 0 002 2h1.5"
        />
      </svg>
    ),
    title: "User Management",
    desc: "Filter, search, and manage users with a beautiful, responsive dashboard UI.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-blue-600"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 21l3-1.5L15 21l-.75-4M9 13.5V7.75A2.75 2.75 0 0111.75 5h.5A2.75 2.75 0 0115 7.75V13.5m-6 0h6"
        />
      </svg>
    ),
    title: "Modern UI",
    desc: "Clean, minimal, and animated. Built with Tailwind CSS and React best practices.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Animated Blue Accent Blob */}
      <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] bg-blue-500 opacity-20 rounded-full blur-3xl animate-float" />
      {/* Hero Section */}
      <main className="z-10 flex flex-col items-center text-center px-4 pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 animate-fade-in-up">
          <span className="inline-block bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-clip-text text-transparent">
            React Dashboard Assignment
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl animate-fade-in-up delay-100">
          A clean, modern, and minimal dashboard starter for frontend
          developers. Secure, fast, and beautiful by default.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors animate-fade-in-up delay-200"
        >
          Get Started
        </Link>
      </main>
      {/* Features Section */}
      <section className="z-10 mt-16 mb-8 w-full max-w-4xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up delay-300">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="bg-white border border-blue-100 rounded-2xl shadow-md p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-2 hover:shadow-xl group"
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
          >
            <div className="mb-4 group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {f.title}
            </h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>
      {/* Subtle bottom blue bar accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-t-full opacity-30 animate-slide-in" />
      {/* Built by credit */}
      <footer className="z-10 mt-auto mb-4 text-gray-400 text-xs text-center">
        Built by <span className="text-blue-600 font-semibold">Tanay Sachdeva</span>{" "}
        for interview assignment
      </footer>
      {/* Custom Animations */}
      <style>{`
        .animate-float {
          animation: float 6s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(30px) scale(1.05); }
        }
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fadeInUp 0.8s forwards;
        }
        .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          opacity: 0;
          animation: slideIn 1.2s 0.5s forwards;
        }
        @keyframes slideIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
