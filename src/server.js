import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import mongoose from 'mongoose'
import productsRouter from './api/products/index.js'
import { badRequestHandler, genericErrorHandler, notFoundHandler } from "./errorHandlers.js"

const server = express()

const port = process.env.PORT || 3007

server.use(cors())
server.use(express.json())

server.use("/products", productsRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION_URL)

mongoose.connection.on("connected", ()=>{
    console.log("Successfully conected to MongoDB!")
    server.listen(port,()=>{
        console.table(listEndpoints(server))
        console.log(`Server is running on port ${port}`)
    })
})