import express from "express"
import createHttpError from "http-errors"
import ProductsModel from "./model.js"
import q2m from "query-to-mongo"

const productsRouter = express.Router()

productsRouter.post("/", async (req, res, next) => {
    try {
      const newProduct = new ProductsModel(req.body) 
      const { _id } = await newProduct.save()
  
      res.status(201).send({ _id })
    } catch (error) {
      next(error)
    }
  })
  
  productsRouter.get("/", async (req, res, next) => {
    try {
      const mongoQuery = q2m(req.query)
      console.log("QUERY: ", req.query)
      console.log("MONGO-QUERY: ", mongoQuery)
  
      const total = await ProductsModel.countDocuments(mongoQuery.criteria)
      const products = await ProductsModel.find(mongoQuery.criteria , mongoQuery.options.fields)
      .limit(mongoQuery.options.limit)
      .skip(mongoQuery.options.skip)
      .sort(mongoQuery.options.sort)
      res.send({ links: mongoQuery.links("http://localhost:3007/products", total), total, totalPages: Math.ceil(total / mongoQuery.options.limit), products })
    } catch (error) {
      next(error)
    }
  })
  
  productsRouter.get("/:productId", async (req, res, next) => {
    try {
      const product = await ProductsModel.findById(req.params.productId)
      if (product) {
        res.send(product)
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })
  
  productsRouter.put("/:productId", async (req, res, next) => {
    try {
      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId, 
        req.body, 
        { new: true, runValidators: true } 
      )
  
      if (updatedProduct) {
        res.send(updatedProduct)
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })
  
  productsRouter.delete("/:productId", async (req, res, next) => {
    try {
      const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.productId)
      if (deletedProduct) {
        res.status(204).send()
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

  productsRouter.post("/:productId/reviews", async (req,res,next)=>{
    try {
      
      const updatedProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId, 
        { $push: { reviews: req.body } }, 
        { new: true, runValidators: true } 
      )
      if (updatedProduct) {
        res.send(updatedProduct)
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
  
    } catch (error) {
      next(error)
    }
  })
  
  productsRouter.get("/:productId/reviews", async (req,res,next)=>{
    try {
      const product = await ProductsModel.findById(req.params.productId)
      if(product){
        res.send(product.reviews)
      }
      else{
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } catch (error) {
      next (error)
    }
  })

  productsRouter.get("/:productId/reviews/:reviewId", async (req, res, next)=>{
    try {
        const product = await ProductsModel.findById(req.params.productId)
        if (product) {
            const review = product.reviews.find(current => req.params.reviewId === current._id.toString())
            if (review) {
              res.send(review)
            } else {
              next(createHttpError(404, `Comment with id ${req.params.reviewId} not found!`))
            }
          } else {
            next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
          }
    } catch (error) {
        next(error)
    }
  })

  productsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
    try {
      
      const product = await ProductsModel.findById(req.params.productId)
  
      if (product) {
      
  
        const index = product.reviews.findIndex(current => current._id.toString() === req.params.reviewId)
  
        if (index !== -1) {
       
          product.reviews[index] = { ...product.reviews[index].toObject(), ...req.body }
  
         
          await product.save()
          res.send(product)
        } else {
          next(createHttpError(404, `Review with id ${req.params.reviewId} not found!`))
        }
      } else {
        next(createHttpError(404, `Product with id ${req.params.productId} not found!`))
      }
    } catch (error) {
      next(error)
    }
  })

export default productsRouter