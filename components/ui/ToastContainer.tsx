
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useContext(AppContext);

  return (
    <div className="fixed inset-0 pointer-events-none p-6 flex items-start justify-end z-[100]">
      <div className="w-full max-w-sm space-y-4">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
