// Road type scoring
function getRoadTypeScore(route) {
  try {
    const steps = route.legs[0].steps
    let hasHighway = false
    let hasUrban = false
    let hasIsolated = false

    steps.forEach((step) => {
      const instruction = step.html_instructions
        ? step.html_instructions.toLowerCase()
        : ''

      // Highway detection
      if (
        instruction.includes('highway') ||
        instruction.includes('expressway') ||
        instruction.includes('nh-') ||
        instruction.includes('national highway') ||
        instruction.includes('flyover')
      ) {
        hasHighway = true
      }

      // Isolated/forest detection
      else if (
        instruction.includes('forest') ||
        instruction.includes('isolated') ||
        instruction.includes('village') ||
        instruction.includes('rural') ||
        step.distance.value > 5000
      ) {
        hasIsolated = true
      }

      // Urban road detection
      else {
        hasUrban = true
      }
    })

    // Apply scoring based on combination
    if (hasHighway && hasUrban && !hasIsolated) return 55
    if (hasHighway && !hasUrban && !hasIsolated) return 60
    if (!hasHighway && hasUrban && !hasIsolated) return 50
    if (hasIsolated && !hasHighway) return 25
    if (hasIsolated && hasHighway) return 35
    return 50

  } catch (e) {
    return 30
  }
}

// Safe haven scoring
// Types: hospital, petrol bunk, mechanic, medical shop
function getSafeHavenScore(openCount, totalCount) {
  if (totalCount === 0) return 5

  const ratio = openCount / totalCount

  if (ratio >= 1.0) return 20      // All open
  if (ratio >= 0.5) return 10      // Half open
  if (ratio >= 0.25) return 5      // 1/4 open
  return 5                          // Less than 1/4
}

// Traffic and accident scoring
function getTrafficScore(route) {
  try {
    const durationNormal = route.legs[0].duration.value
    const durationTraffic =
      route.legs[0].duration_in_traffic?.value || durationNormal
    const ratio = durationTraffic / durationNormal

    // ratio close to 1 = clear roads
    if (ratio <= 1.2) return 20
    return 10

  } catch (e) {
    return 10
  }
}

// Night penalty — isolated roads after 7PM
function applyNightPenalty(roadScore) {
  const hour = new Date().getHours()
  const isNight = hour >= 19 || hour <= 6
  if (isNight && roadScore <= 30) {
    return Math.max(roadScore - 10, 10)
  }
  return roadScore
}

// Label based on total score
export function getRouteLabel(score) {
  if (score >= 80) return { label: 'ELITE', color: '#22C55E' }
  if (score >= 60) return { label: 'OPTIMAL', color: '#F4A022' }
  return { label: 'RISK', color: '#EF4444' }
}

// Main function
export function calculateSafetyScore(route, openHavens, totalHavens) {
  try {
    const roadScore = applyNightPenalty(getRoadTypeScore(route))
    const havenScore = getSafeHavenScore(openHavens, totalHavens)
    const trafficScore = getTrafficScore(route)
    const total = roadScore + havenScore + trafficScore

    return {
      total: Math.min(total, 100),
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