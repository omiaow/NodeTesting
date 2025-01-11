import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 30 })

export default {
    setCache: (value) => {
        if (value) {
            cache.set(`status`, value)
        } else {
            cache.del(`status`)
        }
    },

    getCache: (req, res, next) => {
        const statuses = cache.get(`status`)

        if (statuses && typeof statuses === 'object') {
            return res.json({ statuses })
        }

        next()
    }
}