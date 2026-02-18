/**
 * RoadmapSnap — dependency graph logic
 * Extracted from index.html: data sources, normalize, inbound/outbound, graph traversal.
 * Depends on global CONFIG.
 */

// Get all data sources (all deliverables, regardless of visibility)
function getAllDataSources() {
    return CONFIG.DELIVERABLES;
}

// Get inbound dependencies (tasks this deliverable depends on / is blocked by)
// Normalize a dependency entry to object format
// Supports: string "TaskA" or object { task: "TaskA", from: "M3", to: "M2" }
function normalizeDependency(dep) {
    if (typeof dep === 'string') {
        return { task: dep, from: null, to: null }; // null means use defaults
    }
    return {
        task: dep.task,
        from: dep.from || null,  // Source milestone (defaults to last milestone of blocking task)
        to: dep.to || null       // Target milestone (defaults to first milestone of blocked task)
    };
}

// Get the task name from a dependency (handles both string and object formats)
function getDependencyTaskName(dep) {
    return typeof dep === 'string' ? dep : dep.task;
}

// Get inbound dependencies (tasks this deliverable depends on / is blocked by)
// Returns array of normalized dependency objects
function getInboundDependencies(source) {
    const deps = source.dependencies || [];
    return deps.map(normalizeDependency);
}

// Get inbound dependency task names only (for simple lookups)
function getInboundDependencyNames(source) {
    const deps = source.dependencies || [];
    return deps.map(getDependencyTaskName);
}

// Get outbound dependencies (tasks that depend on this deliverable / are blocked by it)
// Returns array of { task, from, to } where task is the dependent task name
function getOutboundDependencies(source) {
    const allSources = getAllDataSources();
    const dependents = [];
    
    allSources.forEach(s => {
        if (s.dependencies) {
            s.dependencies.forEach(dep => {
                const taskName = getDependencyTaskName(dep);
                if (taskName === source.name) {
                    const normalized = normalizeDependency(dep);
                    // For outbound, we return info about the dependent task
                    dependents.push({
                        task: s.name,           // The task that depends on source
                        from: normalized.from,  // Which milestone of source
                        to: normalized.to       // Which milestone of dependent
                    });
                }
            });
        }
    });
    
    return dependents;
}

// Get outbound dependency task names only (for simple lookups)
function getOutboundDependencyNames(source) {
    return getOutboundDependencies(source).map(d => d.task);
}

// Check if a deliverable has any dependencies (inbound or outbound)
function hasDependencies(source) {
    const inbound = getInboundDependencies(source);
    const outbound = getOutboundDependencies(source);
    return inbound.length > 0 || outbound.length > 0;
}

// Get dependency type for icon display
// Returns: 'inbound' | 'outbound' | 'both' | 'none'
function getDependencyType(source) {
    const inbound = getInboundDependencies(source);
    const outbound = getOutboundDependencies(source);
    
    if (inbound.length > 0 && outbound.length > 0) return 'both';
    if (inbound.length > 0) return 'inbound';
    if (outbound.length > 0) return 'outbound';
    return 'none';
}

// Get the full dependency graph for a deliverable (all connected nodes)
function getDependencyGraph(sourceName) {
    const allSources = getAllDataSources();
    const sourceMap = new Map(allSources.map(s => [s.name, s]));
    const graph = new Set([sourceName]);
    // Edges now contain milestone info: { from, to, fromMilestone, toMilestone }
    const inboundEdges = [];
    const outboundEdges = [];
    
    const source = sourceMap.get(sourceName);
    if (!source) return { nodes: [], inboundEdges: [], outboundEdges: [] };
    
    // Recursively get all inbound dependencies (tasks this depends on, and their dependencies)
    const visitedInbound = new Set();
    function traverseInbound(currentName) {
        if (visitedInbound.has(currentName)) return;
        visitedInbound.add(currentName);
        
        const current = sourceMap.get(currentName);
        if (!current) return;
        
        const deps = getInboundDependencies(current);
        deps.forEach(dep => {
            graph.add(dep.task);
            inboundEdges.push({
                from: dep.task,
                to: currentName,
                fromMilestone: dep.from,  // null = use last milestone
                toMilestone: dep.to       // null = use START
            });
            traverseInbound(dep.task); // Recurse up the chain
        });
    }
    traverseInbound(sourceName);
    
    // Recursively get all outbound dependencies (tasks that depend on this, and what they block)
    const visitedOutbound = new Set();
    function traverseOutbound(currentName) {
        if (visitedOutbound.has(currentName)) return;
        visitedOutbound.add(currentName);
        
        const current = sourceMap.get(currentName);
        if (!current) return;
        
        const dependents = getOutboundDependencies(current);
        dependents.forEach(dep => {
            graph.add(dep.task);
            outboundEdges.push({
                from: currentName,
                to: dep.task,
                fromMilestone: dep.from,  // null = use last milestone
                toMilestone: dep.to       // null = use START
            });
            traverseOutbound(dep.task); // Recurse down the chain
        });
    }
    traverseOutbound(sourceName);
    
    return {
        nodes: Array.from(graph),
        inboundEdges,
        outboundEdges
    };
}

// Export on window for global access
window.getAllDataSources = getAllDataSources;
window.normalizeDependency = normalizeDependency;
window.getDependencyTaskName = getDependencyTaskName;
window.getInboundDependencies = getInboundDependencies;
window.getInboundDependencyNames = getInboundDependencyNames;
window.getOutboundDependencies = getOutboundDependencies;
window.getOutboundDependencyNames = getOutboundDependencyNames;
window.hasDependencies = hasDependencies;
window.getDependencyType = getDependencyType;
window.getDependencyGraph = getDependencyGraph;
