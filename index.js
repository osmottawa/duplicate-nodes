const path = require('path')
const tileReduce = require('tile-reduce')
const load = require('load-json-file')
const write = require('write-json-file')
const turf = require('@turf/turf')

// Input variables
const extent = './extents/thailand.geojson'
const qatiles = 'thailand.mbtiles'
const days = 200
const users = []

// Results
const edits = {}
const geojson = load.sync(extent)
const results = turf.featureCollection([])

const options = {
  geojson,
  zoom: 12,
  map: path.join(__dirname, 'reduce.js'),
  sources: [{name: 'qatiles', mbtiles: qatiles}],
  mapOptions: {
    days,
    extent: geojson,
    users
  }
}

tileReduce(options)
.on('reduce', (features) => {
  features.map(feature => {
    results.features.push(feature)
    // Store User information
    const user = feature.properties['@user']
    if (edits[user] === undefined) {
      edits[user] = 1
    } else {
      edits[user] = 1 + edits[user]
    }
  })
})
.on('end', () => {
  console.log('Extent:', extent)
  console.log('Past days:', days)
  console.log('QA Tiles:', qatiles)
  console.log('Duplicate roads total: %d', results.features.length)
  console.log('Users:')
  const sorted = Object.keys(edits).sort((a, b) => edits[a] - edits[b]).reverse()
  sorted.map(user => console.log(`- [${edits[user]}] ${user}`))
  write.sync('results.geojson', results)
})