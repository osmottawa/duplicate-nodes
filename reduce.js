const turf = require('@turf/turf')
const invariant = require('@turf/invariant')

const days = global.mapOptions.days
const extent = global.mapOptions.extent
const users = global.mapOptions.users

module.exports = (data, tile, writeData, done) => {
  const features = []
  const timestamp = Date.now() / 1000 - days * 24 * 60 * 60
  const unique = {}

  for (let feature of data.qatiles.osm.features) {
    if (feature.geometry.type === 'LineString') {
      // Only find buildings
      if (!feature.properties.highway) { continue }

      // Filter by Date
      if (days > 0) { if (!(Number(feature.properties['@timestamp']) > timestamp)) { continue } }

      // Filter by Usernames
      if (users.length) { if (users.indexOf(feature.properties['@user']) === -1) { continue } }

      // Must intersect within extent
      if (turf.intersect(feature, extent)) {
        let duplicates = 0
        feature = turf.truncate(feature)

        // Detect duplicate nodes (must intersect both previous & current)
        turf.coordReduce(feature, (previousCoord, currentCoord) => {
          const previousId = unique[previousCoord.join(',')]
          const currentId = unique[currentCoord.join(',')]
          // Must have unique ideas based on the same way
          if (previousId && currentId && previousId === currentId) {
            duplicates++
          }
          return currentCoord
        })
        // Add coordinates to unique
        turf.coordEach(feature, coord => {
          const key = coord.join(',')
          unique[key] = feature.properties['@id']
        })
        // Ignore ways with less than 5 coordinates
        if (feature.geometry.coordinates.length < 5) continue

        // Only show duplicates with greater than 50% overlap
        if (duplicates / feature.geometry.coordinates.length > 0.50) features.push(feature)
      }
    }
  }
  done(null, features)
}