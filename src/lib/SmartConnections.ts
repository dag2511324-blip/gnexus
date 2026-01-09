/**
 * Smart Connection System
 * 6 connection types with auto-routing and dependency detection
 */

import { Edge, MarkerType } from 'reactflow';

export type ConnectionType =
    | 'sequential'      // → Next step
    | 'parallel'        // ⇉ Concurrent tasks
    | 'conditional'     // ⟳ If/then branches
    | 'dependency'      // ⚡ Blocking relationships
    | 'reference'       // 📎 Cross-links
    | 'feedback';       // 🔄 Iterative processes

export interface SmartConnection extends Edge {
    type: ConnectionType;
    validated: boolean;
    autoRouted: boolean;
}

// Connection type configurations
export const CONNECTION_CONFIGS = {
    sequential: {
        label: 'Sequential',
        color: '#06FFA5',
        style: { stroke: '#06FFA5', strokeWidth: 2 },
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06FFA5' },
    },
    parallel: {
        label: 'Parallel',
        color: '#00D9FF',
        style: { stroke: '#00D9FF', strokeWidth: 3, strokeDasharray: '5,5' },
        animated: true,
        markerEnd: { type: MarkerType.Arrow, color: '#00D9FF' },
    },
    conditional: {
        label: 'Conditional',
        color: '#FFD700',
        style: { stroke: '#FFD700', strokeWidth: 2, strokeDasharray: '10,5' },
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FFD700' },
    },
    dependency: {
        label: 'Dependency',
        color: '#FF6B35',
        style: { stroke: '#FF6B35', strokeWidth: 2 },
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FF6B35' },
    },
    reference: {
        label: 'Reference',
        color: '#9D4EDD',
        style: { stroke: '#9D4EDD', strokeWidth: 1, strokeDasharray: '2,2' },
        animated: false,
        markerEnd: { type: MarkerType.Arrow, color: '#9D4EDD' },
    },
    feedback: {
        label: 'Feedback Loop',
        color: '#FF006E',
        style: { stroke: '#FF006E', strokeWidth: 2, strokeDasharray: '8,8' },
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FF006E' },
    },
};

/**
 * Detect circular dependencies in the graph
 */
export function detectCircularDependencies(
    edges: SmartConnection[],
    nodeId: string,
    visited: Set<string> = new Set(),
    path: Set<string> = new Set()
): boolean {
    if (path.has(nodeId)) return true; // Circular dependency found
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    path.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId && e.type === 'dependency');

    for (const edge of outgoingEdges) {
        if (detectCircularDependencies(edges, edge.target, visited, path)) {
            return true;
        }
    }

    path.delete(nodeId);
    return false;
}

/**
 * Validate connection logic
 */
export function validateConnection(
    connection: SmartConnection,
    allEdges: SmartConnection[]
): { valid: boolean; reason?: string } {
    // Check for circular dependencies
    if (connection.type === 'dependency') {
        const wouldCreateCycle = detectCircularDependencies(
            [...allEdges, connection],
            connection.target
        );

        if (wouldCreateCycle) {
            return {
                valid: false,
                reason: 'Would create circular dependency'
            };
        }
    }

    // Check for parallel connections validity
    if (connection.type === 'parallel') {
        const hasSequentialToSameTarget = allEdges.some(
            e => e.source === connection.source &&
                e.target === connection.target &&
                e.type === 'sequential'
        );

        if (hasSequentialToSameTarget) {
            return {
                valid: false,
                reason: 'Cannot have both sequential and parallel to same target'
            };
        }
    }

    return { valid: true };
}

/**
 * Auto-route connection to avoid overlaps
 */
export function autoRouteConnection(
    connection: SmartConnection,
    existingEdges: SmartConnection[]
): SmartConnection {
    // Simple auto-routing: alternate between smooth step and bezier
    const sameSourceEdges = existingEdges.filter(e => e.source === connection.source);
    const routingType = sameSourceEdges.length % 2 === 0 ? 'smoothstep' : 'default';

    return {
        ...connection,
        type: routingType as any, // Edge type, not ConnectionType
        autoRouted: true,
    };
}

/**
 * Suggest missing connections based on node patterns
 */
export function suggestMissingConnections(
    nodes: any[],
    edges: SmartConnection[]
): SmartConnection[] {
    const suggestions: SmartConnection[] = [];

    // Find nodes without outgoing connections (potential endpoints)
    const nodesWithoutOutput = nodes.filter(node =>
        !edges.some(e => e.source === node.id)
    );

    // Find nodes without incoming connections (potential starting points)
    const nodesWithoutInput = nodes.filter(node =>
        !edges.some(e => e.target === node.id)
    );

    // Suggest sequential connections for isolated nodes
    if (nodesWithoutOutput.length > 0 && nodesWithoutInput.length > 0) {
        nodesWithoutOutput.forEach((source, i) => {
            if (nodesWithoutInput[i + 1]) {
                suggestions.push({
                    id: `suggested-${source.id}-${nodesWithoutInput[i + 1].id}`,
                    source: source.id,
                    target: nodesWithoutInput[i + 1].id,
                    type: 'sequential',
                    validated: false,
                    autoRouted: false,
                    ...CONNECTION_CONFIGS.sequential,
                });
            }
        });
    }

    return suggestions;
}

/**
 * Color code connections by type
 */
export function getConnectionColor(type: ConnectionType): string {
    return CONNECTION_CONFIGS[type].color;
}

/**
 * Get connection style
 */
export function getConnectionStyle(type: ConnectionType) {
    return CONNECTION_CONFIGS[type].style;
}

/**
 * Analyze dependencies and find critical path
 */
export function findCriticalPath(
    nodes: any[],
    edges: SmartConnection[]
): string[] {
    // Simple critical path: longest chain of dependencies
    const buildPath = (nodeId: string, visited: Set<string> = new Set()): string[] => {
        if (visited.has(nodeId)) return [];
        visited.add(nodeId);

        const outgoing = edges.filter(e => e.source === nodeId && e.type === 'dependency');

        if (outgoing.length === 0) return [nodeId];

        const paths = outgoing.map(e => buildPath(e.target, new Set(visited)));
        const longestPath = paths.reduce((longest, current) =>
            current.length > longest.length ? current : longest,
            []
        );

        return [nodeId, ...longestPath];
    };

    // Find starting nodes (no incoming dependencies)
    const startNodes = nodes.filter(node =>
        !edges.some(e => e.target === node.id && e.type === 'dependency')
    );

    const allPaths = startNodes.map(node => buildPath(node.id));
    const criticalPath = allPaths.reduce((longest, current) =>
        current.length > longest.length ? current : longest,
        []
    );

    return criticalPath;
}
