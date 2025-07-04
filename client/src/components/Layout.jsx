export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl flex flex-col items-center space-y-8">
          {children}
        </div>
      </div>
    );
  }