import React, { useState } from 'react';
import { MenuItem } from '../types';
import { X, Plus, Minus, Check } from 'lucide-react';

interface Props {
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (customizedItem: {
    menu_item: MenuItem;
    quantity: number;
    selected_customizations: Record<string, string>;
    special_instructions: string;
    final_price: number;
  }) => void;
}

export const DishCustomizationModal: React.FC<Props> = ({ item, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { name: string; price: number }>>({});
  const [instructions, setInstructions] = useState('');

  if (!item) return null;

  const basePrice = Number(item.price);
  const addonsTotal = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (groupTitle: string, option: { name: string; price: number }) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupTitle]: option
    }));
  };

  const handleConfirm = () => {
    const formattedOptions: Record<string, string> = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      formattedOptions[k] = `${v.name} (+₹${v.price})`;
    });

    onConfirm({
      menu_item: item,
      quantity,
      selected_customizations: formattedOptions,
      special_instructions: instructions,
      final_price: totalPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
            <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{item.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Customization Options Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {item.customization_options?.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                {group.title}
              </h4>

              <div className="space-y-1.5">
                {group.options.map((opt, oIdx) => {
                  const isSelected = selectedOptions[group.title]?.name === opt.name;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(group.title, opt)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#FF5A36] bg-orange-50/60 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#FF5A36] bg-[#FF5A36]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>

                      <span className="font-bold">
                        {opt.price > 0 ? `+₹${opt.price}` : 'Free'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Kitchen Instructions
            </h4>
            <textarea
              placeholder="e.g. Less spicy, keep gravy separate, deliver extra onions..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#FF5A36] outline-none resize-none h-20"
            />
          </div>
        </div>

        {/* Footer with quantity and add to cart */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-2xl shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="font-extrabold text-sm text-slate-900 w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF5A36] hover:bg-[#e04826] text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 cursor-pointer shadow-md shadow-orange-500/20"
          >
            <span>Add Item</span>
            <span>•</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
