import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, InventoryItem } from '../db/db';

const InventoryManagement: React.FC = () => {
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const inventory = useLiveQuery(() => db.inventory.toArray());

  const addItem = async () => {
    if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
      await db.inventory.add(newItem);
      setNewItem({ name: '', quantity: 0, price: 0 });
    }
  };

  const updateItem = async () => {
    if (editingItem && editingItem.id) {
      await db.inventory.update(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const deleteItem = async (id: number) => {
    await db.inventory.delete(id);
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Quantity', 'Price', 'Total Value'];
    const data = inventory?.map(item => [
      item.name,
      item.quantity.toString(),
      item.price.toFixed(2),
      (item.quantity * item.price).toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...(data?.map(row => row.join(',')) || [])
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'inventory.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Inventory Management</h2>
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-grow border rounded-l px-4 py-2 mr-2"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          className="w-24 border px-4 py-2 mr-2"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
        />
        <input
          type="number"
          className="w-24 border px-4 py-2 mr-2"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={addItem}
        >
          <Plus size={20} />
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Quantity</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Total Value</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory?.map(item => (
            <tr key={item.id} className="border-b">
              <td className="p-2">{item.name}</td>
              <td className="p-2">{item.quantity}</td>
              <td className="p-2">${item.price.toFixed(2)}</td>
              <td className="p-2">${(item.quantity * item.price).toFixed(2)}</td>
              <td className="p-2">
                <button
                  className="text-blue-500 hover:text-blue-700 mr-2"
                  onClick={() => setEditingItem(item)}
                >
                  <Edit2 size={20} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => item.id && deleteItem(item.id)}
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={exportToExcel}
      >
        Export to Excel
      </button>
      {editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Item</h3>
            <input
              type="text"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
            <input
              type="number"
              className="border rounded px-4 py-2 mb-2 w-full"
              value={editingItem.quantity}
              onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) || 0 })}
            />
            <input
              type="number"
              className="border rounded px-4 py-2 mb-4 w-full"
              value={editingItem.price}
              onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
            />
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                onClick={updateItem}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;