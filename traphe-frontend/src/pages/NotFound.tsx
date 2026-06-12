import { Link, useLocation } from "react-router";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foam via-cream to-parchment p-6">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <h1
          className="text-[10rem] font-display-xl leading-none text-roast/10 select-none"
          aria-hidden="true"
        >
          404
        </h1>

        {/* Message */}
        <div className="-mt-12 relative">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-roast/10 flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-roast"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-ui-heading font-bold text-ink mb-3">
            Trang không tồn tại
          </h2>
          <p className="text-dust text-sm mb-2 font-ui-body">
            Đường dẫn <code className="bg-roast/5 text-roast px-2 py-0.5 rounded text-xs font-mono">{location.pathname}</code> không được tìm thấy.
          </p>
          <p className="text-dust/70 text-xs mb-8">
            Trang có thể đã bị di chuyển hoặc không còn tồn tại.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-roast text-white hover:bg-espresso transition-colors shadow-sm"
            >
              Về trang chủ
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-admin-border text-smoke bg-white hover:bg-cream transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
