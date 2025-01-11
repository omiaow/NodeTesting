import db from '../db.js'

import feedbackCacheMiddleware from "../middleware/feedback.cache.middleware.js"

const feedback = {
    create: async (req, res) => {
        try {
            const { title, description, category_id, status_id } = req.body
            const authorId = req.character.id
            
            if (!title || !category_id || !status_id) {
                return res.status(400).json({ message: "Title, category, and status are required." })
            }

            const category = await db.query('SELECT * FROM categories WHERE id = $1', [category_id])
            if (category.rows.length === 0) {
                return res.status(400).json({ message: "Invalid category ID." })
            }

            const status = await db.query('SELECT * FROM statuses WHERE id = $1', [status_id])
            if (status.rows.length === 0) {
                return res.status(400).json({ message: "Invalid status ID." })
            }

            const result = await db.query(
                `INSERT INTO feedback (title, description, category_id, status_id, author_id) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [title, description || null, category_id, status_id, authorId]
            )

            const newFeedback = result.rows[0]
            
            feedbackCacheMiddleware.setCache(newFeedback.id, newFeedback)
            
            res.status(200).json({ message: "Feedback created successfully.", feedback: newFeedback })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    get: async (req, res) => {
        try {
            const id = req.params.id

            if (!id) {
                return res.status(400).json({ message: "Feedback ID is required." })
            }
            
            const result = await db.query(
                `SELECT 
                    f.id, 
                    f.title, 
                    f.description, 
                    f.category_id, 
                    c.name AS category_name, 
                    f.status_id, 
                    s.name AS status_name, 
                    f.author_id, 
                    u.email AS author_email, 
                    f.created_at, 
                    f.updated_at,
                    COALESCE(vote_count.total_votes, 0) AS number_of_votes
                FROM feedback f
                LEFT JOIN categories c ON f.category_id = c.id
                LEFT JOIN statuses s ON f.status_id = s.id
                LEFT JOIN users u ON f.author_id = u.id
                LEFT JOIN (
                    SELECT feedback_id, COUNT(*) AS total_votes
                    FROM upvotes
                    GROUP BY feedback_id
                ) vote_count ON f.id = vote_count.feedback_id
                WHERE f.id = $1`,
                [id]
            )

            const feedback = result.rows[0];

            if (!feedback) {
                return res.status(404).json({ message: "Feedback not found." })
            }

            feedbackCacheMiddleware.setCache(id, feedback)

            res.status(200).json(feedback)
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    update: async (req, res) => {
        try {
            const { title, description, category_id, status_id } = req.body
            const feedbackId = req.params.id
            const authorId = req.character.id

            if (!feedbackId) {
                return res.status(400).json({ message: "Feedback ID is required." })
            }

            if (!title || !category_id || !status_id) {
                return res.status(400).json({ message: "Title, category, and status are required." })
            }

            const feedbackResult = await db.query(
                `SELECT * FROM feedback WHERE id = $1 AND author_id = $2`,
                [feedbackId, authorId]
            )

            const feedback = feedbackResult.rows[0]
            if (!feedback) {
                return res.status(404).json({ message: "Feedback not found or you don't have permission to update it." })
            }

            const category = await db.query('SELECT * FROM categories WHERE id = $1', [category_id])
            if (category.rows.length === 0) {
                return res.status(400).json({ message: "Invalid category ID." })
            }

            const status = await db.query('SELECT * FROM statuses WHERE id = $1', [status_id])
            if (status.rows.length === 0) {
                return res.status(400).json({ message: "Invalid status ID." })
            }

            const updatedFeedback = await db.query(
                `UPDATE feedback
                 SET title = $1, description = $2, category_id = $3, status_id = $4, updated_at = NOW()
                 WHERE id = $5 RETURNING *`,
                [title, description || null, category_id, status_id, feedbackId]
            )
            
            feedbackCacheMiddleware.setCache(feedbackId)

            res.status(200).json({ message: "Feedback updated successfully.", feedback: updatedFeedback.rows[0] })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    delete: async (req, res) => {
        try {
            const feedbackId = req.params.id
            const authorId = req.character.id
            
            if (!feedbackId) {
                return res.status(400).json({ message: "Feedback ID is required." })
            }

            const feedbackResult = await db.query(
                `SELECT * FROM feedback WHERE id = $1 AND author_id = $2`,
                [feedbackId, authorId]
            )

            const feedback = feedbackResult.rows[0]
            if (!feedback) {
                return res.status(404).json({ message: "Feedback not found or you don't have permission to delete it." })
            }

            await db.query(`DELETE FROM feedback WHERE id = $1`, [feedbackId])

            feedbackCacheMiddleware.setCache(feedbackId)

            res.status(200).json({ message: "Feedback deleted successfully." })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    getAll: async (req, res) => {
        try {
            const page = parseInt(req.params.page) || 1
            const limit = 10
            const offset = (page - 1) * limit

            const feedbacksQuery = `
                SELECT 
                    f.id, 
                    f.title, 
                    f.description, 
                    f.category_id, 
                    c.name AS category_name, 
                    f.status_id, 
                    s.name AS status_name, 
                    f.author_id, 
                    u.email AS author_email, 
                    f.created_at, 
                    f.updated_at,
                    COALESCE(vote_count.total_votes, 0) AS number_of_votes
                FROM feedback f
                LEFT JOIN categories c ON f.category_id = c.id
                LEFT JOIN statuses s ON f.status_id = s.id
                LEFT JOIN users u ON f.author_id = u.id
                LEFT JOIN (
                    SELECT feedback_id, COUNT(*) AS total_votes
                    FROM upvotes
                    GROUP BY feedback_id
                ) vote_count ON f.id = vote_count.feedback_id
                ORDER BY f.created_at DESC
                LIMIT $1 OFFSET $2
            `
            const totalCountQuery = `
                SELECT COUNT(*) AS total_count
                FROM feedback
            `

            const feedbacksResult = await db.query(feedbacksQuery, [limit, offset])
            const totalCountResult = await db.query(totalCountQuery)

            const feedbacks = feedbacksResult.rows
            const totalCount = parseInt(totalCountResult.rows[0].total_count)
            
            const totalPages = Math.ceil(totalCount / limit)

            const result = {
                feedbacks,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalFeedbacks: totalCount,
                    feedbacksPerPage: limit,
                },
            }

            feedbackCacheMiddleware.setAllCache(page, result)

            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    vote: async (req, res) => {
        try {
            const feedbackId = req.params.id
            const userId = req.character.id

            if (!feedbackId) {
                return res.status(400).json({ message: "Feedback ID is required." })
            }

            const feedbackResult = await db.query(
                `SELECT * FROM feedback WHERE id = $1`,
                [feedbackId]
            )
            const feedback = feedbackResult.rows[0]
            if (!feedback) {
                return res.status(404).json({ message: "Feedback not found." })
            }

            const upvoteResult = await db.query(
                `SELECT * FROM upvotes WHERE feedback_id = $1 AND user_id = $2`,
                [feedbackId, userId]
            )
            const existingUpvote = upvoteResult.rows[0]
            
            if (existingUpvote) {
                await db.query(
                    `DELETE FROM upvotes WHERE id = $1`,
                    [existingUpvote.id]
                )
                return res.status(200).json({ message: "Upvote removed." })
            } else {
                await db.query(
                    `INSERT INTO upvotes (feedback_id, user_id) VALUES ($1, $2)`,
                    [feedbackId, userId]
                )
                return res.status(201).json({ message: "Upvote added." })
            }
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    }
}

export default feedback