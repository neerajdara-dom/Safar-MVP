function getRoadTypeScore(route) {
  try {
    const steps = route.legs[0].steps
    let hasHighway = false
    let hasUrban = false
    let hasIsolated = false

    steps.forEach((step) => {
      const instruction = step.instructions
        ? step.instructions.toLowerCase()
        : ''

      if (
        instruction.includes('nh') ||
        instruction.includes('sh') ||
        instruction.includes('national') ||
        instruction.includes('highway') ||
        instruction.includes('expressway') ||
        instruction.includes('flyover') ||
        instruction.includes('toll') ||
        /\bnh[-\s]?\d+/.test(instruction) ||
        /\bsh[-\s]?\d+/.test(instruction)
      ) {
        hasHighway = true
      } else if (
        instruction.includes('forest') ||
        instruction.includes('isolated') ||
        instruction.includes('village') ||
        instruction.includes('rural') ||
        instruction.includes('jungle') ||
        instruction.includes('ghat') ||
        step.distance.value > 8000
      ) {
        hasIsolated = true
      } else {
        hasUrban = true
      }
    })

    if (hasHighway && hasUrban && !hasIsolated) return 55
    if (hasHighway && !hasIsolated) return 60
    if (hasUrban && !hasIsolated && !hasHighway) return 50
    if (hasIsolated && hasHighway) return 35
    if (hasIsolated) return 25
    return 50
  } catch (e) {
    return 30
  }
}
function getModeAdjustment(route, mode) {
  try {
    if (!route?.legs?.[0]?.steps) return 0
    const steps = route.legs[0].steps

    let hasForest = false
    let hasHighway = false
    let isLongIsolated = false

    steps.forEach((step) => {
      const text = step.instructions?.toLowerCase() || ''

      // 🌲 Forest / isolated detection
      if (
        text.includes('forest') ||
        text.includes('jungle') ||
        text.includes('ghat') ||
        text.includes('rural')
      ) {
        hasForest = true
      }

      // 🛣️ Highway detection
      if (
        text.includes('highway') ||
        text.includes('expressway') ||
        text.includes('nh') ||
        text.includes('toll')
      ) {
        hasHighway = true
      }

      // 🚫 Very long isolated stretch
      if (step.distance.value > 10000) {
        isLongIsolated = true
      }
    })

    // 🎯 SMART CONDITIONS (ONLY WHEN NEEDED)

    // 🚶 Walking in forest/isolated = risky
    if (mode === 'walking' && (hasForest || isLongIsolated)) {
      return -10
    }

    // 🏍️ Bike on highway = risky
    if (mode === 'bike' && hasHighway) {
      return -8
    }

    // 🚗 Car in forest = slightly risky (but not harsh)
    if (mode === 'driving' && hasForest) {
      return -3
    }

    // 🚌 Transit is generally safer (small boost)
    if (mode === 'transit') {
      return +3
    }

    return 0
  } catch {
    return 0
  }
}

function getSafeHavenScore(openCount, totalCount) {
  if (totalCount === 0) return 5
  const ratio = openCount / totalCount
  if (ratio >= 1.0) return 20
  if (ratio >= 0.5) return 10
  if (ratio >= 0.25) return 5
  return 5
}

function getTrafficScore(route) {
  try {
    const durationNormal = route.legs[0].duration.value
    const durationTraffic = route.legs[0].duration_in_traffic?.value || durationNormal
    const ratio = durationTraffic / durationNormal
    if (ratio <= 1.2) return 20
    return 10
  } catch (e) {
    return 10
  }
}

function applyNightPenalty(roadScore) {
  const hour = new Date().getHours()
  const isNight = hour >= 19 || hour <= 6
  if (isNight && roadScore <= 30) {
    return Math.max(roadScore - 10, 10)
  }
  return roadScore
}

export function getRouteLabel(score) {
  if (score >= 80) return { label: 'ELITE', color: '#22C55E' }
  if (score >= 60) return { label: 'OPTIMAL', color: '#F4A022' }
  return { label: 'RISK', color: '#EF4444' }
}

export function calculateSafetyScore(route, openHavens, totalHavens, mode='driving') {
  try {
    const roadScore = applyNightPenalty(getRoadTypeScore(route))
    const havenScore = getSafeHavenScore(openHavens, totalHavens)
    const trafficScore = getTrafficScore(route)

    const modeAdjustment = getModeAdjustment(route, mode)

    const total = roadScore + havenScore + trafficScore + modeAdjustment

    return {
      total: Math.min(Math.max(total, 0), 100),
      breakdown: {
        road: roadScore,
        havens: havenScore,
        traffic: trafficScore
      }
    }
  } catch (e) {
    return {
      total: 50,
      breakdown: { road: 30, havens: 10, traffic: 10 }
    }
  }
}