import { useEffect, useState } from 'react';
import Modal from './Modal';
import { WA_TEMPLATES, applyTemplate, buildWAUrl } from '../../utils/whatsapp';

export default function WhatsAppModal({ isOpen, onClose, client }) {
  const [templateId, setTemplateId] = useState(WA_TEMPLATES[0].id);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && client) {
      const tpl = WA_TEMPLATES.find((t) => t.id === templateId) || WA_TEMPLATES[0];
      setMessage(applyTemplate(tpl.text, client));
    }
  }, [isOpen, client, templateId]);

  const handleTemplateChange = (id) => {
    setTemplateId(id);
    const tpl = WA_TEMPLATES.find((t) => t.id === id);
    if (tpl) setMessage(applyTemplate(tpl.text, client));
  };

  const handleSend = () => {
    const url = buildWAUrl(client?.phone, message);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const hasPhone = Boolean(client?.phone);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`WhatsApp — ${client?.name || ''}`} size="md">
      <div className="space-y-4">
        {/* WhatsApp header */}
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.065 1.487 5.782L0 24l6.395-1.677A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.22-3.8.996.996-3.799-.23-.37A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">{client?.name}</p>
            <p className="text-xs text-green-600 dark:text-green-400">{client?.phone || 'No phone number'}</p>
          </div>
        </div>

        {!hasPhone && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
            ⚠️ This client has no phone number. Add a phone number to send WhatsApp messages.
          </div>
        )}

        {/* Template selector */}
        <div>
          <label className="label">Message Template</label>
          <select
            className="select"
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            disabled={!hasPhone}
          >
            {WA_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Editable message */}
        <div>
          <label className="label">Message</label>
          <textarea
            className="input resize-none"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!hasPhone}
            placeholder="Type your message..."
          />
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{message.length} characters</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-1 border-t border-gray-100 dark:border-slate-700">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleSend}
            disabled={!hasPhone || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.065 1.487 5.782L0 24l6.395-1.677A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.58-.5-5.07-1.37l-.36-.22-3.8.996.996-3.799-.23-.37A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Open WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  );
}
