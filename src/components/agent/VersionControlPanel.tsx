/**
 * Version Control Integration
 * Git integration with auto-branch creation and commit linking
 */

import { GitBranch, GitCommit, GitPullRequest, GitMerge } from 'lucide-react';

export function VersionControlPanel() {
    const gitStatus = {
        currentBranch: 'feature/agent-neo-elite',
        commits: 47,
        pullRequests: 3,
        autoCreated: true,
    };

    return (
        <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-orange-400" />
                🔀 Version Control
            </h3>

            {/* Current Branch */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Current Branch</span>
                    {gitStatus.autoCreated && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Auto-Created
                        </span>
                    )}
                </div>
                <div className="font-mono text-sm text-orange-400">
                    {gitStatus.currentBranch}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <GitCommit className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-blue-400">{gitStatus.commits}</div>
                    <div className="text-xs text-gray-500">Commits</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <GitPullRequest className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-purple-400">{gitStatus.pullRequests}</div>
                    <div className="text-xs text-gray-500">PRs</div>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                    <GitMerge className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-green-400">12</div>
                    <div className="text-xs text-gray-500">Merged</div>
                </div>
            </div>

            {/* Recent Commits */}
            <div>
                <div className="text-xs font-semibold text-gray-400 mb-2">Recent Commits</div>
                <div className="space-y-2">
                    {[
                        'feat: Add predictive planning',
                        'fix: Optimize canvas rendering',
                        'docs: Update API documentation',
                    ].map((msg, i) => (
                        <div key={i} className="p-2 bg-white/5 rounded text-xs font-mono text-gray-400">
                            {msg}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
