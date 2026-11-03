import React from 'react';
import StudentLayout from './components/layout/StudentLayout';

function App() {
  return (
    <StudentLayout>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-2">Chào mừng đến với trang sinh viên!</h2>
        <p className="text-gray-600">Khung giao diện Desktop đang được xây dựng thành công.</p>
      </div>
    </StudentLayout>
  );
}

export default App;