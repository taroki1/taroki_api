'use client';

import { useState } from 'react';
import { Tarologist } from '@/lib/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ContactButtonsProps {
  tarologist: Tarologist;
}

export default function ContactButtons({ tarologist }: ContactButtonsProps) {
  const [showModal, setShowModal] = useState(false);

  const contacts = [
    {
      type: 'Telegram',
      value: tarologist.contact_telegram,
      icon: '✈️',
      getUrl: (v: string) => {
        if (v.startsWith('http')) return v;
        const username = v.replace('@', '');
        return `https://t.me/${username}`;
      },
      color: 'bg-[#2AABEE]',
    },
    {
      type: 'WhatsApp',
      value: tarologist.contact_whatsapp,
      icon: '📱',
      getUrl: (v: string) => {
        const phone = v.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      },
      color: 'bg-[#25D366]',
    },
    {
      type: 'Instagram',
      value: tarologist.contact_instagram,
      icon: '📷',
      getUrl: (v: string) => {
        if (v.startsWith('http')) return v;
        const username = v.replace('@', '');
        return `https://instagram.com/${username}`;
      },
      color: 'bg-[#E4405F]',
    },
    {
      type: 'Email',
      value: tarologist.contact_email,
      icon: '📧',
      getUrl: (v: string) => `mailto:${v}`,
      color: 'bg-primary',
    },
  ].filter((c) => c.value);

  if (contacts.length === 0 && !tarologist.contact_other) return null;

  return (
    <>
      <Button onClick={() => setShowModal(true)} size="lg" className="w-full">
        Записаться на расклад
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Выберите способ связи"
      >
        <div className="flex flex-col gap-3">
          {contacts.map((contact) => (
            <a
              key={contact.type}
              href={contact.getUrl(contact.value!)}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90 ${contact.color}`}
            >
              <span className="text-xl">{contact.icon}</span>
              <span>{contact.type}</span>
              <span className="ml-auto text-sm opacity-80">{contact.value}</span>
            </a>
          ))}
          {tarologist.contact_other && (
            <div className="px-4 py-3 rounded-lg bg-bg border border-border">
              <div className="text-sm font-medium text-text-light mb-1">
                Другие контакты
              </div>
              <div className="text-text">{tarologist.contact_other}</div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
