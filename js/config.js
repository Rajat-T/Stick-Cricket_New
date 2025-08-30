// Centralized gameplay tuning. All values are optional: code falls back to sane defaults.
window.GameTuning = {
  timing: {
    // Base absolute pixels window around ideal contact (pre-difficulty scaling)
    baseWindow: 26
  },
  edges: {
    // Maximum probability that an edge is generated (after multipliers)
    capByDifficulty: { amateur: 0.20, pro: 0.25, legend: 0.30 },
    // Chance that a generated edge results in a dismissal (before difficulty scaling)
    wicketOnEdgeBase: { Fast: 0.45, 'Fast Medium': 0.35, Spin: 0.25 },
    // Multiplier applied to wicketOnEdgeBase by difficulty
    wicketOnEdgeDiffScale: { amateur: 0.7, pro: 1.0, legend: 1.15 },
    // Upper bound on edge->wicket after scaling
    wicketOnEdgeCap: 0.6,
    // Probability an edged, non-dismissal ball dribbles a scrappy single
    scrappySingleProb: 0.2,
    // Bowler-type multipliers for edge generation
    bowlerEdgeMultiplier: { Fast: 1.2, 'Fast Medium': 1.1, Spin: 0.6 },
    // Surprise slower-ball factor for fast bowlers
    surpriseSlowFactorFast: 1.6,
  },
  lbw: {
    // Bowler-type LBW multipliers
    bowlerMultiplier: { Fast: 0.4, 'Fast Medium': 0.9, Spin: 1.2 },
    bowlerMultiplierSpinHigh: 1.4,
    // Timing/shot factors
    poorTimingFactor: 1.8,
    wrongShotFactor: 0.9,
    goodTimingSmallChanceFactor: 0.05,
    // Global cap so LBW rarely feels unfair
    cap: 0.18
  },
  catches: {
    // Probability that a lofted mishit becomes a simple catch
    mishitLoftedProb: 0.15
  },
  wickets: {
    // Collision narrowness: horizontal margin in multiples of ball radius (5px)
    marginXBallRadiusFactor: 0.5,
    // How far above the crease line we consider valid z-depth for a bowled (fraction of ball radius)
    depthTopPaddingBallRadiusFactor: 0.6
  }
};

