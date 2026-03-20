/**
 * RoadmapSnap — dependency graph logic
 * Extracted from index.html: data sources, normalize, inbound/outbound, graph traversal.
 * Depends on global CONFIG.
 */
function parseDateLocal(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = String(dateStr).split('/').map(Number);
    if (!day || !month || !year) return null;
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
}

function getMilestoneDateFromSource(source, milestoneKey, firstKey) {
    if (!source || !source.milestones) return null;
    const val = source.milestones[milestoneKey];
    if (val) return val;
    if (milestoneKey === firstKey && source.milestones.START) return source.milestones.START;
    if (milestoneKey === firstKey && source.startDate) return source.startDate;
    return null;
}

function getTodayDateLocal() {
    if (typeof CONFIG !== 'undefined' && CONFIG.TIMELINE && CONFIG.TIMELINE.TODAY) {
        return CONFIG.TIMELINE.TODAY;
    }
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return day + '/' + month + '/' + year;
}

// Get all data sources (all deliverables, regardless of visibility)
// In Node/tests pass deliverablesOverride; in browser uses CONFIG.DELIVERABLES when absent.
function getAllDataSources(deliverablesOverride) {
    if (deliverablesOverride != null) return deliverablesOverride;
    if (typeof CONFIG !== 'undefined' && CONFIG.DELIVERABLES) return CONFIG.DELIVERABLES;
    return [];
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
function getOutboundDependencies(source, deliverablesOverride) {
    const allSources = getAllDataSources(deliverablesOverride);
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
function getDependencyType(source, deliverablesOverride) {
    const inbound = getInboundDependencies(source);
    const outbound = getOutboundDependencies(source, deliverablesOverride);
    
    if (inbound.length > 0 && outbound.length > 0) return 'both';
    if (inbound.length > 0) return 'inbound';
    if (outbound.length > 0) return 'outbound';
    return 'none';
}

// Get the full dependency graph for a deliverable (all connected nodes)
function getDependencyGraph(sourceName, deliverablesOverride) {
    const allSources = getAllDataSources(deliverablesOverride);
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

/**
 * Dependency color rule:
 * - green: dependency milestone reached (fromDate <= today)
 * - red: dependency behind schedule (fromDate > toDate)
 * - orange: non-finished and within 10 days to target (0..10)
 * - green: otherwise (>10 days buffer)
 */
function getDependencyColorForDates(fromDateInput, toDateInput, todayDateInput) {
    const fromDate = fromDateInput instanceof Date ? fromDateInput : parseDateLocal(fromDateInput);
    const toDate = toDateInput instanceof Date ? toDateInput : parseDateLocal(toDateInput);
    const todayDate = todayDateInput instanceof Date ? todayDateInput : parseDateLocal(todayDateInput);
    if (!fromDate || !toDate) return 'green';

    const fromTs = fromDate.getTime();
    const toTs = toDate.getTime();
    const todayTs = todayDate ? todayDate.getTime() : Number.NaN;

    if (!Number.isNaN(todayTs) && fromTs <= todayTs) return 'green';
    if (fromTs > toTs) return 'red';

    const diffDays = Math.floor((toTs - fromTs) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 10) return 'orange';
    return 'green';
}

/**
 * Returns deliverable names blocked by "red" dependencies:
 * a dependency edge is red when fromDate > toDate.
 */
function getBlockedByRedDependencySet(deliverablesOverride) {
    const allSources = getAllDataSources(deliverablesOverride);
    const sourceMap = new Map(allSources.map(s => [s.name, s]));
    const firstMilestoneKey = 'START';
    const lastMilestoneKey = 'M3';
    const blocked = new Set();

    const todayDateStr = getTodayDateLocal();
    allSources.forEach(targetSource => {
        const inbound = getInboundDependencies(targetSource);
        inbound.forEach(dep => {
            const fromSource = sourceMap.get(dep.task);
            if (!fromSource) return;
            const fromKey = dep.from || lastMilestoneKey;
            const toKey = dep.to || firstMilestoneKey;
            const fromDateStr = getMilestoneDateFromSource(fromSource, fromKey, firstMilestoneKey);
            const toDateStr = getMilestoneDateFromSource(targetSource, toKey, firstMilestoneKey);
            const color = getDependencyColorForDates(fromDateStr, toDateStr, todayDateStr);
            if (color === 'red') {
                blocked.add(targetSource.name);
            }
        });
    });

    return blocked;
}

/** Returns both source+target deliverables that participate in red dependency edges. */
function getRedDependencyEndpointSet(deliverablesOverride) {
    const allSources = getAllDataSources(deliverablesOverride);
    const sourceMap = new Map(allSources.map(s => [s.name, s]));
    const firstMilestoneKey = 'START';
    const lastMilestoneKey = 'M3';
    const todayDateStr = getTodayDateLocal();
    const endpoints = new Set();

    allSources.forEach(targetSource => {
        const inbound = getInboundDependencies(targetSource);
        inbound.forEach(dep => {
            const fromSource = sourceMap.get(dep.task);
            if (!fromSource) return;
            const fromKey = dep.from || lastMilestoneKey;
            const toKey = dep.to || firstMilestoneKey;
            const fromDateStr = getMilestoneDateFromSource(fromSource, fromKey, firstMilestoneKey);
            const toDateStr = getMilestoneDateFromSource(targetSource, toKey, firstMilestoneKey);
            const color = getDependencyColorForDates(fromDateStr, toDateStr, todayDateStr);
            if (color === 'red') {
                endpoints.add(fromSource.name);
                endpoints.add(targetSource.name);
            }
        });
    });

    return endpoints;
}

/** Config atRisk OR blocked by red dependency. */
function getEffectiveAtRiskSet(deliverablesOverride) {
    const allSources = getAllDataSources(deliverablesOverride);
    const redBlocked = getBlockedByRedDependencySet(allSources);
    const set = new Set();
    allSources.forEach(s => {
        if (s.atRisk || redBlocked.has(s.name)) set.add(s.name);
    });
    return set;
}

// Export on window for global access (browser only)
if (typeof window !== 'undefined') {
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
    window.getDependencyColorForDates = getDependencyColorForDates;
    window.getBlockedByRedDependencySet = getBlockedByRedDependencySet;
    window.getRedDependencyEndpointSet = getRedDependencyEndpointSet;
    window.getEffectiveAtRiskSet = getEffectiveAtRiskSet;
}

export {
    getAllDataSources, normalizeDependency, getDependencyTaskName,
    getInboundDependencies, getInboundDependencyNames,
    getOutboundDependencies, getOutboundDependencyNames,
    hasDependencies, getDependencyType, getDependencyGraph,
    getDependencyColorForDates,
    getBlockedByRedDependencySet, getRedDependencyEndpointSet, getEffectiveAtRiskSet
};
