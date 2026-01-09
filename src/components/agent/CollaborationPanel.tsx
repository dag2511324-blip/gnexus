/**
 * Collaboration Features
 * Real-time co-editing, comments, mentions, and team activity
 */

import { MessageSquare, AtSign, Users, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export function CollaborationPanel() {
    const activities = [
        { user: 'Sarah Chen', action: 'commented on', target: 'Planning Tree', time: '2m ago' },
        { user: 'Mike Ross', action: 'updated', target: 'Architecture Design', time: '5m ago' },
        { user: 'Alex Kim', action: 'mentioned you in', target: 'Code Review', time: '12m ago' },
    ];

    return (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                👥 Team Collaboration
            </h3>

            {/* Active Users */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-xs text-gray-500 mb-2">Active Now (3)</div>
                <div className="flex items-center gap-2">
                    {['SC', 'MR', 'AK'].map(initials => (
                        <div key={initials} className="relative">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-xs font-bold text-orange-400">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#0a0a0a] rounded-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-400 mb-2">Recent Activity</div>
                {activities.map((activity, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-2 bg-white/5 rounded-lg text-sm"
                    >
                        <span className="font-semibold text-white">{activity.user}</span>
                        <span className="text-gray-400"> {activity.action} </span>
                        <span className="text-orange-400">{activity.target}</span>
                        <span className="text-gray-600 text-xs ml-2">{activity.time}</span>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-400 hover:bg-orange-500/20 transition">
                    <MessageSquare className="w-4 h-4 mx-auto mb-1" />
                    Comment
                </button>
                <button className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition">
                    <AtSign className="w-4 h-4 mx-auto mb-1" />
                    Mention
                </button>
            </div>
        </div>
    );
}
