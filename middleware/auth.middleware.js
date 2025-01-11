import jwt from "jsonwebtoken"

export default  (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next()
  }

  try {

    const token = req.headers["authorization"].split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: "No authorization" })
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY)
    req.character = decoded
    next()

  } catch (e) {
    return res.status(401).json({ message: "No authorization" })
  }
}