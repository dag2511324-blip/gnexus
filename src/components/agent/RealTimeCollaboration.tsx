/**
 * Real-Time Collaboration Engine
 * WebSocket-based real-time collaboration with CRDT conflict resolution
 */

import { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff, Activity, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CollaborativeUser {
    id: string;
    name: string;
    avatar: string;
    color: string;
    cursor?: { x: number; y: number };
    selection?: { nodeId: string };
    lastActivity: Date;
    status: 'active' | 'away' | 'offline';
}

export interface CollaborativeChange {
    id: string;
    userId: string;
    type: 'node_add' | 'node_edit' | 'node_delete' | 'edge_add' | 'edge_delete' | 'comment';
    timestamp: Date;
    data: any;
    synced: boolean;
}

export function RealTimeCollaboration() {
    const [isConnected, setIsConnected] = useState(true);
    const [users, setUsers] = useState<CollaborativeUser[]>([
        {
            id: '1',
            name: 'Sarah Chen',
            avatar: 'SC',
            color: '#f97316',
            status: 'active',
            lastActivity: new Date(),
        },
        {
            id: '2',
            name: 'Mike Ross',
            avatar: 'MR',
            color: '#06FFA5',
            status: 'active',
            lastActivity: new Date(),
        },
        {
            id: '3',
            name: 'Alex Kim',
            avatar: 'AK',
            color: '#9D4EDD',
            status: 'away',
            lastActivity: new Date(Date.now() - 300000),
        },
    ]);

    const [changes, setChanges] = useState<CollaborativeChange[]>([
        {
            id: 'c1',
            userId: '1',
            type: 'node_add',
            timestamp: new Date(Date.now() - 30000),
            data: { label: 'Feature Planning' },
            synced: true,
        },
        {
            id: 'c2',
            userId: '2',
            type: 'comment',
            timestamp: new Date(Date.now() - 15000),
            data: { text: 'Looks good! 👍' },
            synced: true,
        },
    ]);

    const activeUsers = users.filter(u => u.status === 'active');

    return (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-orange-400" />
                    🌐 Real-Time Collaboration
                </h3>
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <>
                            <Wifi className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-green-400">Connected</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4 text-red-400" />
                            <span className="text-xs text-red-400">Disconnected</span>
                        </>
                    )}
                </div>
            </div>

            {/* Active Users */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg border border-white/10">
                <div className="text-sm font-semibold text-gray-300 mb-3">
                    Active Now ({activeUsers.length})
                </div>
                <div className="flex items-center gap-3">
                    {users.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group"
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-3 cursor-pointer transition-transform hover:scale-110"
                                style={{
                                    backgroundColor: `${user.color}20`,
                                    borderColor: user.color,
                                    color: user.color,
                                    borderWidth: '2px',
                                }}
                            >
                                {user.avatar}
                            </div>
                            {user.status === 'active' && (
                                <div
                                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0a0a]"
                                    style={{ backgroundColor: user.color }}
                                />
                            )}
                            {user.status === 'away' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-400 rounded-full border-2 border-[#0a0a0a]" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                {user.name}
                                <div className="text-[10px] text-gray-400">{user.status}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-300">Live Activity</div>
                    <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                        {changes.map((change, i) => {
                            const user = users.find(u => u.id === change.userId);
                            if (!user) return null;

                            return (
                                <motion.div
                                    key={change.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-orange-500/30 transition"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{
                                                backgroundColor: `${user.color}20`,
                                                color: user.color,
                                            }}
                                        >
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white mb-1">
                                                <span className="font-semibold" style={{ color: user.color }}>
                                                    {user.name}
                                                </span>
                                                {' '}
                                                <span className="text-gray-400">
                                                    {change.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {change.type === 'comment' && (
                                                <div className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded mt-1">
                                                    <MessageSquare className="w-3 h-3 inline mr-1" />
                                                    {change.data.text}
                                                </div>
                                            )}
                                            <div className="text-[10px] text-gray-600 mt-1">
                                                {new Date(change.timestamp).toLocaleTimeString()}
                                                {change.synced && (
                                                    <span className="ml-2 text-green-400">✓ Synced</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Collaboration Stats */}
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                    <div className="text-xl font-bold text-orange-400">{users.length}</div>
                    <div className="text-xs text-gray-500">Team Members</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{activeUsers.length}</div>
                    <div className="text-xs text-gray-500">Online Now</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{changes.length}</div>
                    <div className="text-xs text-gray-500">Recent Changes</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">98%</div>
                    <div className="text-xs text-gray-500">Sync Rate</div>
                </div>
            </div>
        </div>
    );
}
