/**
 * Graph & Network Analysis Engine
 * Advanced graph algorithms for blockchain network analysis and community detection
 */

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  directed: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  attributes: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  attributes: Record<string, any>;
}

export interface PageRankResult {
  scores: Map<string, number>;
  iterations: number;
  converged: boolean;
}

export interface CommunityDetectionResult {
  communities: Set<string>[];
  modularity: number;
  numCommunities: number;
}

export interface CentralityMetrics {
  degree: Map<string, number>;
  betweenness: Map<string, number>;
  closeness: Map<string, number>;
  eigenvector: Map<string, number>;
}

export interface PathResult {
  path: string[];
  length: number;
  cost: number;
}

export interface NetworkMetrics {
  nodes: number;
  edges: number;
  density: number;
  averageDegree: number;
  diameter: number;
  clusteringCoefficient: number;
  components: number;
}

export class GraphNetworkAnalyzer {
  /**
   * PageRank algorithm for node importance
   */
  pageRank(
    graph: Graph,
    dampingFactor: number = 0.85,
    maxIterations: number = 100,
    tolerance: number = 0.0001
  ): PageRankResult {
    const nodes = Array.from(graph.nodes.keys());
    const n = nodes.length;

    // Initialize scores
    const scores = new Map<string, number>();
    const newScores = new Map<string, number>();

    for (const node of nodes) {
      scores.set(node, 1 / n);
    }

    let converged = false;
    let iterations = 0;

    // Build adjacency structure
    const outbound = new Map<string, string[]>();
    const inbound = new Map<string, string[]>();

    for (const node of nodes) {
      outbound.set(node, []);
      inbound.set(node, []);
    }

    for (const edge of graph.edges.values()) {
      outbound.get(edge.source)!.push(edge.target);
      inbound.get(edge.target)!.push(edge.source);
    }

    // Iterative computation
    for (iterations = 0; iterations < maxIterations; iterations++) {
      for (const node of nodes) {
        let sum = 0;

        // Sum contributions from incoming edges
        for (const source of inbound.get(node)!) {
          const sourceOut = outbound.get(source)!.length;
          if (sourceOut > 0) {
            sum += scores.get(source)! / sourceOut;
          }
        }

        // PageRank formula
        newScores.set(node, (1 - dampingFactor) / n + dampingFactor * sum);
      }

      // Check convergence
      let maxDiff = 0;
      for (const node of nodes) {
        const diff = Math.abs(newScores.get(node)! - scores.get(node)!);
        maxDiff = Math.max(maxDiff, diff);
      }

      if (maxDiff < tolerance) {
        converged = true;
        break;
      }

      // Update scores
      for (const node of nodes) {
        scores.set(node, newScores.get(node)!);
      }
    }

    return { scores, iterations, converged };
  }

  /**
   * Dijkstra's algorithm for shortest path
   */
  dijkstra(graph: Graph, source: string, target?: string): Map<string, PathResult> {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set(graph.nodes.keys());

    // Initialize
    for (const node of graph.nodes.keys()) {
      distances.set(node, Infinity);
      previous.set(node, null);
    }
    distances.set(source, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minNode: string | null = null;
      let minDist = Infinity;

      for (const node of unvisited) {
        const dist = distances.get(node)!;
        if (dist < minDist) {
          minDist = dist;
          minNode = node;
        }
      }

      if (minNode === null || minDist === Infinity) break;
      if (target && minNode === target) break;

      unvisited.delete(minNode);

      // Update neighbors
      for (const edge of graph.edges.values()) {
        if (edge.source === minNode && unvisited.has(edge.target)) {
          const alt = distances.get(minNode)! + edge.weight;
          if (alt < distances.get(edge.target)!) {
            distances.set(edge.target, alt);
            previous.set(edge.target, minNode);
          }
        }
      }
    }

    // Build path results
    const results = new Map<string, PathResult>();

    for (const node of graph.nodes.keys()) {
      if (distances.get(node)! < Infinity) {
        const path: string[] = [];
        let current: string | null = node;

        while (current !== null) {
          path.unshift(current);
          current = previous.get(current)!;
        }

        results.set(node, {
          path,
          length: path.length - 1,
          cost: distances.get(node)!,
        });
      }
    }

    return results;
  }

  /**
   * Bellman-Ford algorithm (handles negative weights)
   */
  bellmanFord(graph: Graph, source: string): {
    distances: Map<string, number>;
    previous: Map<string, string | null>;
    hasNegativeCycle: boolean;
  } {
    const nodes = Array.from(graph.nodes.keys());
    const edges = Array.from(graph.edges.values());

    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();

    // Initialize
    for (const node of nodes) {
      distances.set(node, Infinity);
      previous.set(node, null);
    }
    distances.set(source, 0);

    // Relax edges |V| - 1 times
    for (let i = 0; i < nodes.length - 1; i++) {
      for (const edge of edges) {
        const srcDist = distances.get(edge.source)!;
        const targetDist = distances.get(edge.target)!;

        if (srcDist + edge.weight < targetDist) {
          distances.set(edge.target, srcDist + edge.weight);
          previous.set(edge.target, edge.source);
        }
      }
    }

    // Check for negative cycles
    let hasNegativeCycle = false;
    for (const edge of edges) {
      const srcDist = distances.get(edge.source)!;
      const targetDist = distances.get(edge.target)!;

      if (srcDist + edge.weight < targetDist) {
        hasNegativeCycle = true;
        break;
      }
    }

    return { distances, previous, hasNegativeCycle };
  }

  /**
   * A* pathfinding with heuristic
   */
  aStar(
    graph: Graph,
    source: string,
    target: string,
    heuristic: (node: string) => number
  ): PathResult | null {
    const openSet = new Set([source]);
    const closedSet = new Set<string>();

    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous = new Map<string, string | null>();

    for (const node of graph.nodes.keys()) {
      gScore.set(node, Infinity);
      fScore.set(node, Infinity);
      previous.set(node, null);
    }

    gScore.set(source, 0);
    fScore.set(source, heuristic(source));

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let current: string | null = null;
      let minF = Infinity;

      for (const node of openSet) {
        const f = fScore.get(node)!;
        if (f < minF) {
          minF = f;
          current = node;
        }
      }

      if (current === null) break;
      if (current === target) {
        // Reconstruct path
        const path: string[] = [];
        let node: string | null = current;

        while (node !== null) {
          path.unshift(node);
          node = previous.get(node)!;
        }

        return {
          path,
          length: path.length - 1,
          cost: gScore.get(target)!,
        };
      }

      openSet.delete(current);
      closedSet.add(current);

      // Check neighbors
      for (const edge of graph.edges.values()) {
        if (edge.source === current && !closedSet.has(edge.target)) {
          const tentativeG = gScore.get(current)! + edge.weight;

          if (tentativeG < gScore.get(edge.target)!) {
            previous.set(edge.target, current);
            gScore.set(edge.target, tentativeG);
            fScore.set(edge.target, tentativeG + heuristic(edge.target));

            if (!openSet.has(edge.target)) {
              openSet.add(edge.target);
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Louvain algorithm for community detection
   */
  louvainCommunityDetection(graph: Graph, resolution: number = 1.0): CommunityDetectionResult {
    const nodes = Array.from(graph.nodes.keys());
    const m = graph.edges.size;

    // Initialize: each node in its own community
    const community = new Map<string, number>();
    nodes.forEach((node, i) => community.set(node, i));

    let improved = true;
    let iteration = 0;

    while (improved && iteration < 100) {
      improved = false;
      iteration++;

      for (const node of nodes) {
        const currentCom = community.get(node)!;
        let bestCom = currentCom;
        let bestGain = 0;

        // Calculate modularity gain for each neighbor community
        const neighborCommunities = this.getNeighborCommunities(graph, node, community);

        for (const [neighborCom, _] of neighborCommunities) {
          if (neighborCom === currentCom) continue;

          const gain = this.modularityGain(graph, node, currentCom, neighborCom, community, m, resolution);

          if (gain > bestGain) {
            bestGain = gain;
            bestCom = neighborCom;
          }
        }

        if (bestCom !== currentCom) {
          community.set(node, bestCom);
          improved = true;
        }
      }
    }

    // Group nodes by community
    const communityMap = new Map<number, Set<string>>();
    for (const [node, com] of community) {
      if (!communityMap.has(com)) {
        communityMap.set(com, new Set());
      }
      communityMap.get(com)!.add(node);
    }

    const communities = Array.from(communityMap.values());
    const modularity = this.calculateModularity(graph, community, m);

    return {
      communities,
      modularity,
      numCommunities: communities.length,
    };
  }

  /**
   * Calculate centrality metrics
   */
  calculateCentrality(graph: Graph): CentralityMetrics {
    const nodes = Array.from(graph.nodes.keys());

    // Degree centrality
    const degree = new Map<string, number>();
    for (const node of nodes) {
      let deg = 0;
      for (const edge of graph.edges.values()) {
        if (edge.source === node || edge.target === node) deg++;
      }
      degree.set(node, deg);
    }

    // Betweenness centrality
    const betweenness = this.calculateBetweennessCentrality(graph);

    // Closeness centrality
    const closeness = this.calculateClosenessCentrality(graph);

    // Eigenvector centrality (simplified using power iteration)
    const eigenvector = this.calculateEigenvectorCentrality(graph);

    return {
      degree,
      betweenness,
      closeness,
      eigenvector,
    };
  }

  /**
   * Detect cycles in graph (for fraud detection)
   */
  detectCycles(graph: Graph, maxCycleLength: number = 10): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];

    const dfs = (node: string, parent: string | null, depth: number) => {
      if (depth > maxCycleLength) return;

      visited.add(node);
      stack.push(node);

      for (const edge of graph.edges.values()) {
        if (edge.source === node) {
          const target = edge.target;

          // Found cycle
          if (stack.includes(target) && target !== parent) {
            const cycleStart = stack.indexOf(target);
            const cycle = stack.slice(cycleStart);
            cycles.push([...cycle, target]);
          } else if (!visited.has(target)) {
            dfs(target, node, depth + 1);
          }
        }
      }

      stack.pop();
    };

    for (const node of graph.nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node, null, 0);
      }
    }

    return cycles;
  }

  /**
   * Calculate network metrics
   */
  calculateNetworkMetrics(graph: Graph): NetworkMetrics {
    const nodes = graph.nodes.size;
    const edges = graph.edges.size;

    // Density
    const maxEdges = nodes * (nodes - 1) / (graph.directed ? 1 : 2);
    const density = edges / maxEdges;

    // Average degree
    const averageDegree = (2 * edges) / nodes;

    // Diameter (longest shortest path)
    let diameter = 0;
    for (const source of graph.nodes.keys()) {
      const paths = this.dijkstra(graph, source);
      for (const result of paths.values()) {
        diameter = Math.max(diameter, result.cost);
      }
    }

    // Clustering coefficient
    const clusteringCoefficient = this.calculateClusteringCoefficient(graph);

    // Connected components
    const components = this.findConnectedComponents(graph).length;

    return {
      nodes,
      edges,
      density,
      averageDegree,
      diameter,
      clusteringCoefficient,
      components,
    };
  }

  /**
   * Find strongly connected components (Tarjan's algorithm)
   */
  findStronglyConnectedComponents(graph: Graph): Set<string>[] {
    const nodes = Array.from(graph.nodes.keys());
    const index = new Map<string, number>();
    const lowlink = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];
    const components: Set<string>[] = [];
    let idx = 0;

    const strongConnect = (node: string) => {
      index.set(node, idx);
      lowlink.set(node, idx);
      idx++;
      stack.push(node);
      onStack.add(node);

      // Check successors
      for (const edge of graph.edges.values()) {
        if (edge.source === node) {
          const target = edge.target;

          if (!index.has(target)) {
            strongConnect(target);
            lowlink.set(node, Math.min(lowlink.get(node)!, lowlink.get(target)!));
          } else if (onStack.has(target)) {
            lowlink.set(node, Math.min(lowlink.get(node)!, index.get(target)!));
          }
        }
      }

      // Root of SCC
      if (lowlink.get(node) === index.get(node)) {
        const component = new Set<string>();
        let w: string;

        do {
          w = stack.pop()!;
          onStack.delete(w);
          component.add(w);
        } while (w !== node);

        components.push(component);
      }
    };

    for (const node of nodes) {
      if (!index.has(node)) {
        strongConnect(node);
      }
    }

    return components;
  }

  /**
   * Minimum Spanning Tree (Prim's algorithm)
   */
  minimumSpanningTree(graph: Graph): Graph {
    const mst: Graph = {
      nodes: new Map(graph.nodes),
      edges: new Map(),
      directed: false,
    };

    if (graph.nodes.size === 0) return mst;

    const visited = new Set<string>();
    const start = Array.from(graph.nodes.keys())[0];
    visited.add(start);

    while (visited.size < graph.nodes.size) {
      let minEdge: GraphEdge | null = null;
      let minWeight = Infinity;

      // Find minimum edge connecting visited to unvisited
      for (const edge of graph.edges.values()) {
        if (visited.has(edge.source) && !visited.has(edge.target)) {
          if (edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = edge;
          }
        }
      }

      if (minEdge === null) break;

      mst.edges.set(minEdge.id, minEdge);
      visited.add(minEdge.target);
    }

    return mst;
  }

  /**
   * Maximum flow (Ford-Fulkerson algorithm)
   */
  maxFlow(graph: Graph, source: string, sink: string): number {
    // Create residual graph
    const residual = new Map<string, Map<string, number>>();

    for (const node of graph.nodes.keys()) {
      residual.set(node, new Map());
    }

    for (const edge of graph.edges.values()) {
      residual.get(edge.source)!.set(edge.target, edge.weight);
    }

    let maxFlowValue = 0;

    // Find augmenting paths using BFS
    while (true) {
      const path = this.bfsPath(residual, source, sink);
      if (path.length === 0) break;

      // Find minimum capacity along path
      let minCap = Infinity;
      for (let i = 0; i < path.length - 1; i++) {
        const cap = residual.get(path[i])!.get(path[i + 1])!;
        minCap = Math.min(minCap, cap);
      }

      // Update residual capacities
      for (let i = 0; i < path.length - 1; i++) {
        const u = path[i];
        const v = path[i + 1];

        residual.get(u)!.set(v, residual.get(u)!.get(v)! - minCap);

        if (!residual.get(v)!.has(u)) {
          residual.get(v)!.set(u, 0);
        }
        residual.get(v)!.set(u, residual.get(v)!.get(u)! + minCap);
      }

      maxFlowValue += minCap;
    }

    return maxFlowValue;
  }

  /**
   * Private helper methods
   */

  private getNeighborCommunities(
    graph: Graph,
    node: string,
    community: Map<string, number>
  ): Map<number, number> {
    const neighbors = new Map<number, number>();

    for (const edge of graph.edges.values()) {
      if (edge.source === node) {
        const targetCom = community.get(edge.target)!;
        neighbors.set(targetCom, (neighbors.get(targetCom) || 0) + edge.weight);
      }
      if (edge.target === node) {
        const sourceCom = community.get(edge.source)!;
        neighbors.set(sourceCom, (neighbors.get(sourceCom) || 0) + edge.weight);
      }
    }

    return neighbors;
  }

  private modularityGain(
    graph: Graph,
    node: string,
    oldCom: number,
    newCom: number,
    community: Map<string, number>,
    m: number,
    resolution: number
  ): number {
    // Simplified modularity gain calculation
    let kIn = 0;
    let kOut = 0;

    for (const edge of graph.edges.values()) {
      if (edge.source === node && community.get(edge.target) === newCom) {
        kIn += edge.weight;
      }
      if (edge.target === node && community.get(edge.source) === newCom) {
        kIn += edge.weight;
      }
      if (edge.source === node && community.get(edge.target) === oldCom) {
        kOut += edge.weight;
      }
      if (edge.target === node && community.get(edge.source) === oldCom) {
        kOut += edge.weight;
      }
    }

    return (kIn - kOut) / (2 * m) * resolution;
  }

  private calculateModularity(
    graph: Graph,
    community: Map<string, number>,
    m: number
  ): number {
    let modularity = 0;

    for (const edge of graph.edges.values()) {
      if (community.get(edge.source) === community.get(edge.target)) {
        modularity += edge.weight;
      }
    }

    return modularity / (2 * m);
  }

  private calculateBetweennessCentrality(graph: Graph): Map<string, number> {
    const betweenness = new Map<string, number>();
    const nodes = Array.from(graph.nodes.keys());

    for (const node of nodes) {
      betweenness.set(node, 0);
    }

    // For each source node
    for (const source of nodes) {
      const paths = this.dijkstra(graph, source);

      // Count shortest paths through each node
      for (const target of nodes) {
        if (source !== target && paths.has(target)) {
          const path = paths.get(target)!.path;
          for (let i = 1; i < path.length - 1; i++) {
            betweenness.set(path[i], betweenness.get(path[i])! + 1);
          }
        }
      }
    }

    // Normalize
    const n = nodes.length;
    const norm = (n - 1) * (n - 2) / 2;
    for (const node of nodes) {
      betweenness.set(node, betweenness.get(node)! / norm);
    }

    return betweenness;
  }

  private calculateClosenessCentrality(graph: Graph): Map<string, number> {
    const closeness = new Map<string, number>();
    const nodes = Array.from(graph.nodes.keys());

    for (const node of nodes) {
      const paths = this.dijkstra(graph, node);
      let sum = 0;
      let reachable = 0;

      for (const [target, result] of paths) {
        if (target !== node && result.cost < Infinity) {
          sum += result.cost;
          reachable++;
        }
      }

      closeness.set(node, reachable > 0 ? reachable / sum : 0);
    }

    return closeness;
  }

  private calculateEigenvectorCentrality(graph: Graph, iterations: number = 100): Map<string, number> {
    const nodes = Array.from(graph.nodes.keys());
    const centrality = new Map<string, number>();

    // Initialize
    for (const node of nodes) {
      centrality.set(node, 1);
    }

    // Power iteration
    for (let iter = 0; iter < iterations; iter++) {
      const newCentrality = new Map<string, number>();

      for (const node of nodes) {
        let sum = 0;

        for (const edge of graph.edges.values()) {
          if (edge.target === node) {
            sum += centrality.get(edge.source)! * edge.weight;
          }
        }

        newCentrality.set(node, sum);
      }

      // Normalize
      const norm = Math.sqrt(
        Array.from(newCentrality.values()).reduce((sum, v) => sum + v * v, 0)
      );

      for (const node of nodes) {
        centrality.set(node, newCentrality.get(node)! / norm);
      }
    }

    return centrality;
  }

  private calculateClusteringCoefficient(graph: Graph): number {
    const nodes = Array.from(graph.nodes.keys());
    let totalCoefficient = 0;

    for (const node of nodes) {
      const neighbors = this.getNeighbors(graph, node);
      const k = neighbors.size;

      if (k < 2) continue;

      // Count edges between neighbors
      let edges = 0;
      for (const n1 of neighbors) {
        for (const n2 of neighbors) {
          if (n1 !== n2 && this.hasEdge(graph, n1, n2)) {
            edges++;
          }
        }
      }

      const coefficient = edges / (k * (k - 1));
      totalCoefficient += coefficient;
    }

    return totalCoefficient / nodes.length;
  }

  private findConnectedComponents(graph: Graph): Set<string>[] {
    const visited = new Set<string>();
    const components: Set<string>[] = [];

    const dfs = (node: string, component: Set<string>) => {
      visited.add(node);
      component.add(node);

      for (const edge of graph.edges.values()) {
        if (edge.source === node && !visited.has(edge.target)) {
          dfs(edge.target, component);
        }
        if (edge.target === node && !visited.has(edge.source)) {
          dfs(edge.source, component);
        }
      }
    };

    for (const node of graph.nodes.keys()) {
      if (!visited.has(node)) {
        const component = new Set<string>();
        dfs(node, component);
        components.push(component);
      }
    }

    return components;
  }

  private getNeighbors(graph: Graph, node: string): Set<string> {
    const neighbors = new Set<string>();

    for (const edge of graph.edges.values()) {
      if (edge.source === node) neighbors.add(edge.target);
      if (edge.target === node && !graph.directed) neighbors.add(edge.source);
    }

    return neighbors;
  }

  private hasEdge(graph: Graph, source: string, target: string): boolean {
    for (const edge of graph.edges.values()) {
      if (edge.source === source && edge.target === target) return true;
      if (!graph.directed && edge.source === target && edge.target === source) return true;
    }
    return false;
  }

  private bfsPath(
    residual: Map<string, Map<string, number>>,
    source: string,
    sink: string
  ): string[] {
    const visited = new Set([source]);
    const queue: string[] = [source];
    const parent = new Map<string, string>();

    while (queue.length > 0) {
      const u = queue.shift()!;

      if (u === sink) {
        // Reconstruct path
        const path: string[] = [];
        let current = sink;

        while (current !== source) {
          path.unshift(current);
          current = parent.get(current)!;
        }
        path.unshift(source);

        return path;
      }

      for (const [v, cap] of residual.get(u)!) {
        if (!visited.has(v) && cap > 0) {
          visited.add(v);
          parent.set(v, u);
          queue.push(v);
        }
      }
    }

    return [];
  }
}

