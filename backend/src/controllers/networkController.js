const GraphService = require('../services/graph/graphService');

exports.getFullGraph = async (req, res, next) => {
  try {
    const graph = await GraphService.getFullGraph();
    res.json({ success: true, layer: 'Layer 2: Network & Graph Analysis', ...graph });
  } catch (err) {
    next(err);
  }
};

exports.getAccountNetwork = async (req, res, next) => {
  try {
    const network = await GraphService.getAccountNetwork(req.params.id);
    res.json({ success: true, layer: 'Layer 2: Network & Graph Analysis', ...network });
  } catch (err) {
    next(err);
  }
};

exports.traceNetwork = async (req, res, next) => {
  try {
    const depth = parseInt(req.query.depth || '3');
    const trace = await GraphService.traceMuleNetwork(req.params.id, depth);
    res.json({ success: true, layer: 'Layer 2: Network & Graph Analysis', ...trace });
  } catch (err) {
    next(err);
  }
};
