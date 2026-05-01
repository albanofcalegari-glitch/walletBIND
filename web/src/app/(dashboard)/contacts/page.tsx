'use client';

import { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  alias: string;
  cbu: string;
  bank: string;
  notes: string;
}

const DEMO_CONTACTS: Contact[] = [
  { id: '1', name: 'Proveedor Logistica SA', alias: 'logistica', cbu: '0070999030004123456789', bank: 'Galicia', notes: 'Pago mensual flete' },
  { id: '2', name: 'Estudio Contable Martinez', alias: 'contable', cbu: '0140999030004987654321', bank: 'Provincia', notes: 'Honorarios mensuales' },
  { id: '3', name: 'Maria Lopez', alias: 'mlopez', cbu: '0170999030004111222333', bank: 'BBVA', notes: 'Freelance diseño' },
  { id: '4', name: 'Alquiler Oficina CABA', alias: 'oficina', cbu: '0110999030004444555666', bank: 'Nacion', notes: 'Alquiler mensual' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.alias.toLowerCase().includes(search.toLowerCase()) ||
    c.cbu.includes(search)
  );

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleSave = (contact: Omit<Contact, 'id'>) => {
    if (editingId) {
      setContacts(contacts.map(c => c.id === editingId ? { ...contact, id: editingId } : c));
      setEditingId(null);
    } else {
      setContacts([...contacts, { ...contact, id: crypto.randomUUID().slice(0, 8) }]);
    }
    setShowForm(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contactos Favoritos</h1>
          <p className="text-sm text-slate-400 mt-1">Guarda tus destinatarios frecuentes para transferir mas rapido</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo contacto
        </button>
      </div>

      {showForm && (
        <ContactForm
          initial={editingId ? contacts.find(c => c.id === editingId) : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, alias o CBU..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((contact) => (
          <div key={contact.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {contact.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-white font-medium">{contact.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">@{contact.alias} &middot; {contact.bank}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-6">
              <div>
                <p className="text-[10px] text-slate-600 uppercase">CBU</p>
                <p className="text-xs text-slate-400 font-mono">{contact.cbu}</p>
              </div>
              {contact.notes && (
                <div>
                  <p className="text-[10px] text-slate-600 uppercase">Nota</p>
                  <p className="text-xs text-slate-400">{contact.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
            {search ? 'No se encontraron contactos' : 'No hay contactos guardados'}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactForm({ initial, onSave, onCancel }: {
  initial?: Contact;
  onSave: (c: Omit<Contact, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [alias, setAlias] = useState(initial?.alias || '');
  const [cbu, setCbu] = useState(initial?.cbu || '');
  const [bank, setBank] = useState(initial?.bank || '');
  const [notes, setNotes] = useState(initial?.notes || '');

  return (
    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{initial ? 'Editar contacto' : 'Nuevo contacto'}</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave({ name, alias, cbu, bank, notes }); }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre / Razon social</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Empresa SA" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Alias</label>
            <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="proveedor.logistica" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">CBU / CVU</label>
            <input type="text" value={cbu} onChange={(e) => setCbu(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0000000000000000000000" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Banco</label>
            <input type="text" value={bank} onChange={(e) => setBank(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Galicia, Nacion..." required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nota (opcional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Pago mensual, honorarios..." />
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          {initial ? 'Guardar cambios' : 'Agregar contacto'}
        </button>
      </form>
    </div>
  );
}
