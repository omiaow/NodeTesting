import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 30 })

export default {
    setCache: (value) => {
        if (value) {
            cache.set(`category`, value)
        } else {
            cache.del(`category`)
        }
    },

    getCache: (req, res, next) => {
        const categories = cache.get(`category`)

        if (categories && typeof categories === 'object') {
            return res.json({ categories })
        }

        next()
    }
}