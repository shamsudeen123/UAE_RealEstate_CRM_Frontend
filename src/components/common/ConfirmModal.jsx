import Modal from './Modal';

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message = 'This action cannot be undone.' }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm Delete" size="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🗑️</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Are you sure?</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-1 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger">Delete</button>
        </div>
      </div>
    </Modal>
  );
}
