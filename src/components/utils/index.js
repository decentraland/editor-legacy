export function isError(...resources) {
  return resources.some(resource =>
    ! isLoading(resource) && resource.get('error')
  )
}

export function isLoading(...resources) {
  return resources.some(resource =>
    ! resource || resource.size === 0 || resource.get('loading')
  )
}
