import db from '../db.js'
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import sendEmail from "../email/email.js"
import verificationEmail from "../email/mail.verification.js"

const userAuth = {
    create: async (req, res) => {
        try {
            const { email } = req.body
            
            const correctedEmail = email.toLowerCase()

            if (typeof correctedEmail !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correctedEmail)) {
                return res.status(400).json({ message: "Email and password are required." })
            }
            
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [correctedEmail])
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: "User with this email already exists." })
            }
            
            const verification = Math.floor(100000 + Math.random() * 900000)

            const subject = verificationEmail.subject
            const text = verificationEmail.text(verification)
            const html = verificationEmail.html(verification)
            const isSent = await sendEmail(correctedEmail, subject, text, html)

            if (!isSent) {
                return res.status(400).json({ message: "Couldn't send an email!" })
            }

            const result = await db.query(
                'INSERT INTO users (email, verification) VALUES ($1, $2) RETURNING *',
                [correctedEmail, verification]
            )

            const newUser = result.rows[0]

            if (!newUser) {
                return res.status(400).json({ message: "Couldn't create a new user!" })
            }

            res.status(200).json({ message: "User created successfully." })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    verify: async (req, res) => {

        const validatePassword = (password) => {
            // check length
            if (typeof password !== "string" || password.length < 8) {
                return { status: false, message: 'Password must be at least 8 characters long.' }
            }
    
            // check uppercase letters
            if (!/[A-Z]/.test(password)) {
                return { status: false, message: 'Password must contain at least one uppercase letter.' }
            }
    
            // check lowercase letter
            if (!/[a-z]/.test(password)) {
                return { status: false, message: 'Password must contain at least one lowercase letter.' }
            }
    
            // check numbers
            if (!/[0-9]/.test(password)) {
                return { status: false, message: 'Password must contain at least one number.' }
            }
          
            // If all criteria are met, return success
            return { status: true, message: 'Password is valid.' };
        }

        try {
            const { email, verification, password } = req.body

            const correctedEmail = email.toLowerCase()

            const passwordStatus = validatePassword(password)

            if (!passwordStatus.status) {
                return res.status(400).json(passwordStatus)
            }

            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [correctedEmail])
            const user = existingUser.rows[0]

            if (!user) {
                return res.status(400).json({ message: "User doesn't exist" })
            }

            if (verification != user.verification) {
                return res.status(400).json({ message: "Verification code doesn't match" })
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            await db.query(
                'UPDATE users SET password = $1, verification = NULL WHERE email = $2',
                [hashedPassword, correctedEmail]
            )
            
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_KEY,
                { expiresIn: "24h" }
            )

            res.status(201).json({ message: "Successfully updated!", token: token })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body
            
            const correctedEmail = email.toLowerCase()
            
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [correctedEmail])
            const user = existingUser.rows[0]

            if (!user) {
                return res.status(400).json({ message: "User doesn't exist" })
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password)

            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Wrong password!" })
            }

            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_KEY,
                { expiresIn: "24h" }
            )
            
            res.status(200).json({ token: token })
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    },

    reset: async (req, res) => {
        try {
            const { email } = req.body
            
            const correctedEmail = email.toLowerCase()

            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [correctedEmail])
            const user = existingUser.rows[0]

            if (!user) {
                return res.status(400).json({ message: "User doesn't exist" })
            }

            const verification = Math.floor(100000 + Math.random() * 900000)

            const subject = verificationEmail.subject
            const text = verificationEmail.text(verification)
            const html = verificationEmail.html(verification)
            const isSent = await sendEmail(correctedEmail, subject, text, html)

            if (!isSent) {
                return res.status(400).json({ message: "Couldn't send an email!" })
            }

            await db.query(
                'UPDATE users SET verification = $1 WHERE email = $2',
                [verification, correctedEmail]
            )

            res.status(200).json({ message: "Email successfully sent to user" })            
        } catch (e) {
            res.status(500).json({ message: "Что-то пошло не так, попробуйте еще раз!", error: e.message })
        }
    }
}

export default userAuth