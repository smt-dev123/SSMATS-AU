import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Eye, PencilLine, Trash2, Building2 } from 'lucide-react';

interface BuildingCardProps {
    building: {
        id: string;
        name: string;
        description?: string;
        floors?: number;
        occupancy?: number;
        status?: string;
    };
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ building, onEdit, onDelete, onView }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">

            {/* Header Visual */}
            <div className="bg-slate-50 p-8 flex justify-center items-center group-hover:bg-blue-50 transition-colors">
                <Building2 size={48} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <h5 className="text-lg font-bold text-gray-900 truncate">{building.name}</h5>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${building.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {building.status}
                    </span>
                </div>

                <p className="text-xs font-mono text-gray-400 mb-3">{building.id}</p>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {building.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Floors</p>
                        <p className="text-sm font-semibold text-gray-700">{building.floors}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase">Occupancy</p>
                        <p className="text-sm font-semibold text-gray-700">{building.occupancy}%</p>
                    </div>
                </div>
            </div>

            {/* CRUD Actions with Radix UI */}
            <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100 flex justify-end gap-2">

                <Tooltip.Provider>
                    {/* View Button */}
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <button
                                onClick={() => onView(building.id)}
                                className="p-2 text-gray-500 hover:bg-white hover:text-blue-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                            >
                                <Eye size={18} />
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg" sideOffset={5}>
                            View Details
                            <Tooltip.Arrow className="fill-gray-800" />
                        </Tooltip.Content>
                    </Tooltip.Root>

                    {/* Edit Button */}
                    <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                            <button
                                onClick={() => onEdit(building.id)}
                                className="p-2 text-gray-500 hover:bg-white hover:text-indigo-600 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                            >
                                <PencilLine size={18} />
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg" sideOffset={5}>
                            Edit Building
                        </Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>

                {/* Delete Button with Radix Alert Dialog */}
                <AlertDialog.Root>
                    <AlertDialog.Trigger asChild>
                        <button className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all">
                            <Trash2 size={18} />
                        </button>
                    </AlertDialog.Trigger>
                    <AlertDialog.Portal>
                        <AlertDialog.Overlay className="bg-black/50 fixed inset-0 backdrop-blur-sm" />
                        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl w-[90vw] max-w-md">
                            <AlertDialog.Title className="text-lg font-bold text-gray-900">Are you sure?</AlertDialog.Title>
                            <AlertDialog.Description className="text-sm text-gray-500 mt-2">
                                This action cannot be undone. This will permanently delete <strong>{building.name}</strong>.
                            </AlertDialog.Description>
                            <div className="flex justify-end gap-3 mt-6">
                                <AlertDialog.Cancel asChild>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">Cancel</button>
                                </AlertDialog.Cancel>
                                <AlertDialog.Action asChild>
                                    <button
                                        onClick={() => onDelete(building.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                                    >
                                        Confirm Delete
                                    </button>
                                </AlertDialog.Action>
                            </div>
                        </AlertDialog.Content>
                    </AlertDialog.Portal>
                </AlertDialog.Root>

            </div>
        </div>

    );
};

export default BuildingCard;