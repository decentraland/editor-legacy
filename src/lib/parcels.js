/* globals location */

// Return a list of parcels as specified in the url ?parcel[]=1,2&parcel[]=2,3

export default function getParcelsFromURL () {
  const result = []

  // if (!location.search.match('parcels[]=')) {
  //   return result
  // }

  location.search.split('&').forEach((pair) => {
    const components = pair.split(/(,|=)/).map((i) => parseInt(i, 10))
    result.push([components[2], components[4]])
  })

  console.log(result)

  return result
}
