export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 font-heading">Welcome to your Dashboard!</h2>
          <p className="text-gray-600 font-sans">
            You have successfully logged in. This is where your business deck builder would be.
          </p>
        </div>
      </div>
    </div>
  );
}