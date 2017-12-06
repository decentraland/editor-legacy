/* Test runner */
import './parcel-boundary-test'
import './utils-test'

// Make sure we are running in a browser instance, our tests don't
// work under node
import assert from 'assert'
assert(typeof window === 'object', 'Tests must be run by a browser')
