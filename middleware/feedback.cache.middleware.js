import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 30 })

export default {
    setCache: (id, value) => {
        if (value) {
            cache.set(`feedback-${id}`, value)
        } else {
            cache.del(`feedback-${id}`)
        }
        
        const keys = cache.keys()

        keys.forEach(key => {
            if (key.startsWith("all-feedback-")) {
                cache.del(key)
            }
        })
    },

    getCache: (req, res, next) => {
        const id = req.params.id
        const feedback = cache.get(`feedback-${id}`)

        if (feedback && typeof feedback === 'object') {
            return res.json(feedback)
        }

        next()
    },

    getAllCache: (req, res, next) => {
        const page = req.params.page
        const feedback = cache.get(`all-feedback-${page}`)

        if (feedback && typeof feedback === 'object') {
            return res.json(feedback)
        }

        next()
    },

    setAllCache: (page, value) => {
        cache.set(`all-feedback-${page}`, value)
    }
}