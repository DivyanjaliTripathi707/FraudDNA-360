const NetworkModel = require('../../models/networkModel');
const AccountModel = require('../../models/accountModel');
const AtmModel = require('../../models/atmModel');
const LocationModel = require('../../models/locationModel');

class GraphService {
  static async getFullGraph() {
    const accounts = await AccountModel.getAll();
    const locations = await LocationModel.getAll();
    const atms = await AtmModel.getAll();
    const relationships = await NetworkModel.getAllRelationships();

    const nodes = [];
    const edges = [];

    // Map Accounts as Nodes
    accounts.forEach(acc => {
      let type = 'ACCOUNT';
      if (acc.status === 'MULE_SUSPECT') type = 'MULE_ACCOUNT';
      if (acc.account_number.includes('SOURCE')) type = 'VICTIM_ACCOUNT';

      nodes.push({
        id: `ACC-${acc.id}`,
        dbId: acc.id,
        label: acc.account_number,
        sublabel: acc.holder_name,
        type,
        riskScore: acc.risk_score,
        status: acc.status,
        balance: acc.current_balance
      });
    });

    // Map ATMs as Nodes
    atms.forEach(atm => {
      nodes.push({
        id: `ATM-${atm.id}`,
        dbId: atm.id,
        label: atm.atm_code,
        sublabel: atm.name,
        type: 'ATM',
        riskScore: atm.status === 'SUSPICIOUS' ? 80 : 30,
        status: atm.status
      });
    });

    // Map Locations as Nodes
    locations.forEach(loc => {
      nodes.push({
        id: `LOC-${loc.id}`,
        dbId: loc.id,
        label: loc.name,
        sublabel: `${loc.city}, ${loc.region}`,
        type: 'LOCATION',
        riskScore: loc.risk_score,
        status: loc.risk_level
      });
    });

    // Map Relationships as Edges
    relationships.forEach(rel => {
      edges.push({
        id: `EDGE-${rel.id}`,
        source: `ACC-${rel.source_account_id}`,
        target: `ACC-${rel.target_account_id}`,
        label: rel.relationship_type,
        strength: rel.strength,
        sharedAttribute: rel.shared_attribute
      });
    });

    // Add implicit edges from accounts to ATMs & Locations based on seed relationships
    edges.push(
      { id: 'EDGE-ATM-1', source: 'ACC-1003', target: 'ATM-101', label: 'ATM_WITHDRAWAL', strength: 5, sharedAttribute: 'Recent Cash Out' },
      { id: 'EDGE-ATM-2', source: 'ACC-1004', target: 'ATM-102', label: 'ATM_WITHDRAWAL', strength: 4, sharedAttribute: 'Recent Cash Out' },
      { id: 'EDGE-LOC-1', source: 'ATM-101', target: 'LOC-1', label: 'LOCATED_AT', strength: 5, sharedAttribute: 'ATM Cluster A' },
      { id: 'EDGE-LOC-2', source: 'ATM-102', target: 'LOC-1', label: 'LOCATED_AT', strength: 5, sharedAttribute: 'ATM Cluster A' }
    );

    return { nodes, edges };
  }

  static async getAccountNetwork(accountId) {
    const fullGraph = await this.getFullGraph();
    const targetId = `ACC-${accountId}`;

    const connectedEdges = fullGraph.edges.filter(
      e => e.source === targetId || e.target === targetId
    );

    const connectedNodeIds = new Set([targetId]);
    connectedEdges.forEach(e => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const connectedNodes = fullGraph.nodes.filter(n => connectedNodeIds.has(n.id));

    return {
      account: fullGraph.nodes.find(n => n.id === targetId),
      nodes: connectedNodes,
      edges: connectedEdges,
      muleCount: connectedNodes.filter(n => n.type === 'MULE_ACCOUNT').length
    };
  }

  static async traceMuleNetwork(startAccountId, maxDepth = 3) {
    const fullGraph = await this.getFullGraph();
    const startNodeId = `ACC-${startAccountId}`;

    const visitedNodes = new Set([startNodeId]);
    const visitedEdges = new Set();
    let currentLevel = [startNodeId];

    const traceSteps = [];

    for (let depth = 1; depth <= maxDepth; depth++) {
      const nextLevel = [];
      const stepEdges = [];

      fullGraph.edges.forEach(edge => {
        if (currentLevel.includes(edge.source) && !visitedNodes.has(edge.target)) {
          visitedNodes.add(edge.target);
          visitedEdges.add(edge.id);
          nextLevel.push(edge.target);
          stepEdges.push(edge);
        } else if (currentLevel.includes(edge.target) && !visitedNodes.has(edge.source)) {
          visitedNodes.add(edge.source);
          visitedEdges.add(edge.id);
          nextLevel.push(edge.source);
          stepEdges.push(edge);
        }
      });

      traceSteps.push({
        depth,
        nodesFound: nextLevel.map(id => fullGraph.nodes.find(n => n.id === id)).filter(Boolean),
        edges: stepEdges
      });

      currentLevel = nextLevel;
      if (currentLevel.length === 0) break;
    }

    const tracedNodes = fullGraph.nodes.filter(n => visitedNodes.has(n.id));
    const tracedEdges = fullGraph.edges.filter(e => visitedEdges.has(e.id));

    return {
      rootAccount: fullGraph.nodes.find(n => n.id === startNodeId),
      maxDepth,
      totalNodesInMuleNetwork: tracedNodes.length,
      suspectMules: tracedNodes.filter(n => n.type === 'MULE_ACCOUNT'),
      nodes: tracedNodes,
      edges: tracedEdges,
      traceSteps
    };
  }
}

module.exports = GraphService;
